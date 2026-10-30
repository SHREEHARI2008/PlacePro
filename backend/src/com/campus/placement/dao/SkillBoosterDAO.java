package com.campus.placement.dao;

import com.campus.placement.config.DBConnectionManager;
import com.campus.placement.model.SkillBoosterBatch;
import com.campus.placement.model.SkillBoosterQuestion;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Data Access Object for Mentor-driven Skill Booster daily 6-question challenge batches and student progress.
 */
public class SkillBoosterDAO {
    private final DBConnectionManager db = DBConnectionManager.getInstance();

    /**
     * Retrieve the currently active batch along with question items and student-specific completion status.
     */
    public SkillBoosterBatch getActiveBatch(int studentId) {
        String batchSql = """
            SELECT b.id, b.updated_by_mentor_id, b.is_active, b.created_at, b.updated_at,
                   u.name AS mentor_name
            FROM skill_booster_batches b
            LEFT JOIN mentors m ON b.updated_by_mentor_id = m.id
            LEFT JOIN users u ON m.user_id = u.id
            WHERE b.is_active = TRUE
            ORDER BY b.id DESC
            LIMIT 1
        """;

        try (Connection conn = db.getConnection()) {
            SkillBoosterBatch batch = null;

            try (PreparedStatement ps = conn.prepareStatement(batchSql);
                 ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    batch = new SkillBoosterBatch(
                        rs.getInt("id"),
                        (Integer) rs.getObject("updated_by_mentor_id"),
                        rs.getString("mentor_name") != null ? rs.getString("mentor_name") : "Faculty Placement Mentor",
                        rs.getBoolean("is_active"),
                        rs.getTimestamp("created_at"),
                        rs.getTimestamp("updated_at")
                    );
                }
            }

            // Seed initial batch if none exists
            if (batch == null) {
                seedInitialBatch(conn);
                try (PreparedStatement ps = conn.prepareStatement(batchSql);
                     ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        batch = new SkillBoosterBatch(
                            rs.getInt("id"),
                            (Integer) rs.getObject("updated_by_mentor_id"),
                            rs.getString("mentor_name") != null ? rs.getString("mentor_name") : "Faculty Placement Mentor",
                            rs.getBoolean("is_active"),
                            rs.getTimestamp("created_at"),
                            rs.getTimestamp("updated_at")
                        );
                    }
                }
            }

            if (batch == null) return null;

            // Load 6 questions for this batch
            String questionsSql = """
                SELECT id, batch_id, question_number, title, problem_link, created_at
                FROM skill_booster_questions
                WHERE batch_id = ?
                ORDER BY question_number ASC
            """;

            List<SkillBoosterQuestion> questions = new ArrayList<>();
            try (PreparedStatement ps = conn.prepareStatement(questionsSql)) {
                ps.setInt(1, batch.getId());
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        SkillBoosterQuestion q = new SkillBoosterQuestion(
                            rs.getInt("id"),
                            rs.getInt("batch_id"),
                            rs.getInt("question_number"),
                            rs.getString("title"),
                            rs.getString("problem_link"),
                            rs.getTimestamp("created_at")
                        );
                        questions.add(q);
                    }
                }
            }

            // If a valid studentId is provided, check progress for this specific batch
            int completedCount = 0;
            if (studentId > 0) {
                String progressSql = """
                    SELECT question_number, is_completed, completed_at
                    FROM student_skill_booster_progress
                    WHERE student_id = ? AND batch_id = ?
                """;

                Map<Integer, Boolean> progressMap = new HashMap<>();
                Map<Integer, Timestamp> timeMap = new HashMap<>();

                try (PreparedStatement ps = conn.prepareStatement(progressSql)) {
                    ps.setInt(1, studentId);
                    ps.setInt(2, batch.getId());
                    try (ResultSet rs = ps.executeQuery()) {
                        while (rs.next()) {
                            int qNum = rs.getInt("question_number");
                            boolean done = rs.getBoolean("is_completed");
                            progressMap.put(qNum, done);
                            timeMap.put(qNum, rs.getTimestamp("completed_at"));
                        }
                    }
                }

                for (SkillBoosterQuestion q : questions) {
                    boolean isDone = progressMap.getOrDefault(q.getQuestionNumber(), false);
                    q.setCompleted(isDone);
                    q.setCompletedAt(timeMap.get(q.getQuestionNumber()));
                    if (isDone) completedCount++;
                }
            }

            batch.setQuestions(questions);
            batch.setCompletedCount(completedCount);
            return batch;

        } catch (SQLException e) {
            System.err.println("Error fetching active Skill Booster batch: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Publishes a new set of exactly 6 questions from a mentor.
     * Overrides any previous active batch globally and automatically resets student completion checkboxes to 0/6.
     */
    public SkillBoosterBatch publishNewBatch(int mentorId, List<SkillBoosterQuestion> questions) {
        if (questions == null || questions.size() != 6) {
            throw new IllegalArgumentException("Skill Booster batch must contain exactly 6 questions. Received: " + (questions == null ? 0 : questions.size()));
        }

        Connection conn = null;
        try {
            conn = db.getConnection();
            conn.setAutoCommit(false);

            // 1. Mark existing batches inactive
            try (Statement st = conn.createStatement()) {
                st.executeUpdate("UPDATE skill_booster_batches SET is_active = FALSE WHERE is_active = TRUE");
            }

            // 2. Insert new batch
            int newBatchId = 0;
            String insertBatchSql = "INSERT INTO skill_booster_batches (updated_by_mentor_id, is_active) VALUES (?, TRUE)";
            try (PreparedStatement ps = conn.prepareStatement(insertBatchSql, Statement.RETURN_GENERATED_KEYS)) {
                if (mentorId > 0) {
                    ps.setInt(1, mentorId);
                } else {
                    ps.setNull(1, Types.INTEGER);
                }
                ps.executeUpdate();
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        newBatchId = rs.getInt(1);
                    }
                }
            }

            if (newBatchId == 0) {
                conn.rollback();
                throw new SQLException("Failed to retrieve generated ID for new Skill Booster batch");
            }

            // 3. Insert the 6 questions
            String insertQSql = "INSERT INTO skill_booster_questions (batch_id, question_number, title, problem_link) VALUES (?, ?, ?, ?)";
            try (PreparedStatement ps = conn.prepareStatement(insertQSql)) {
                for (int i = 0; i < 6; i++) {
                    SkillBoosterQuestion q = questions.get(i);
                    ps.setInt(1, newBatchId);
                    ps.setInt(2, i + 1);
                    ps.setString(3, q.getTitle() != null && !q.getTitle().trim().isEmpty() ? q.getTitle().trim() : "Problem " + (i + 1));
                    ps.setString(4, q.getProblemLink() != null && !q.getProblemLink().trim().isEmpty() ? q.getProblemLink().trim() : "https://leetcode.com/problems/");
                    ps.addBatch();
                }
                ps.executeBatch();
            }

            conn.commit();

            // 4. Send notification alert to all students
            try {
                NotificationDAO notifDAO = new NotificationDAO();
                com.campus.placement.model.Notification notif = new com.campus.placement.model.Notification(
                    null, // broadcast to all students
                    "DRIVE_UPDATE",
                    "Daily Skill Booster Updated",
                    "A faculty mentor has published a fresh set of 6 daily coding challenge questions. Check them out!",
                    newBatchId
                );
                notifDAO.createNotification(notif);
            } catch (Exception notifEx) {
                System.err.println("Warning: Could not dispatch notification for Skill Booster update: " + notifEx.getMessage());
            }

            return getActiveBatch(0);

        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ignored) {}
            }
            System.err.println("Error publishing new Skill Booster batch: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Database error publishing Skill Booster batch: " + e.getMessage());
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException ignored) {}
            }
        }
    }

    /**
     * Toggles or sets the completion state of a specific question (1-6) for a student in a batch.
     */
    public Map<String, Object> toggleStudentProgress(int studentId, int batchId, int questionNumber, Boolean requestedState) {
        if (questionNumber < 1 || questionNumber > 6) {
            throw new IllegalArgumentException("Question number must be between 1 and 6. Received: " + questionNumber);
        }

        try (Connection conn = db.getConnection()) {
            // Resolve active batch ID if not provided or invalid
            if (batchId <= 0) {
                try (Statement st = conn.createStatement();
                     ResultSet rs = st.executeQuery("SELECT id FROM skill_booster_batches WHERE is_active = TRUE ORDER BY id DESC LIMIT 1")) {
                    if (rs.next()) {
                        batchId = rs.getInt(1);
                    } else {
                        throw new IllegalStateException("No active Skill Booster batch found");
                    }
                }
            }

            // Check if student progress row already exists
            String checkSql = "SELECT is_completed FROM student_skill_booster_progress WHERE student_id = ? AND batch_id = ? AND question_number = ?";
            boolean rowExists = false;
            boolean currentStatus = false;

            try (PreparedStatement ps = conn.prepareStatement(checkSql)) {
                ps.setInt(1, studentId);
                ps.setInt(2, batchId);
                ps.setInt(3, questionNumber);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        rowExists = true;
                        currentStatus = rs.getBoolean("is_completed");
                    }
                }
            }

            boolean newStatus = (requestedState != null) ? requestedState : !currentStatus;
            Timestamp now = new Timestamp(System.currentTimeMillis());

            if (rowExists) {
                String updateSql = "UPDATE student_skill_booster_progress SET is_completed = ?, completed_at = ? WHERE student_id = ? AND batch_id = ? AND question_number = ?";
                try (PreparedStatement ps = conn.prepareStatement(updateSql)) {
                    ps.setBoolean(1, newStatus);
                    ps.setTimestamp(2, newStatus ? now : null);
                    ps.setInt(3, studentId);
                    ps.setInt(4, batchId);
                    ps.setInt(5, questionNumber);
                    ps.executeUpdate();
                }
            } else {
                String insertSql = "INSERT INTO student_skill_booster_progress (student_id, batch_id, question_number, is_completed, completed_at) VALUES (?, ?, ?, ?, ?)";
                try (PreparedStatement ps = conn.prepareStatement(insertSql)) {
                    ps.setInt(1, studentId);
                    ps.setInt(2, batchId);
                    ps.setInt(3, questionNumber);
                    ps.setBoolean(4, newStatus);
                    ps.setTimestamp(5, newStatus ? now : null);
                    ps.executeUpdate();
                }
            }

            // Query updated count of completed questions in this batch for the student
            int completedCount = 0;
            String countSql = "SELECT COUNT(*) FROM student_skill_booster_progress WHERE student_id = ? AND batch_id = ? AND is_completed = TRUE";
            try (PreparedStatement ps = conn.prepareStatement(countSql)) {
                ps.setInt(1, studentId);
                ps.setInt(2, batchId);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        completedCount = rs.getInt(1);
                    }
                }
            }

            int progressPercentage = (int) Math.round(((double) completedCount / 6.0) * 100.0);

            Map<String, Object> result = new HashMap<>();
            result.put("studentId", studentId);
            result.put("batchId", batchId);
            result.put("questionNumber", questionNumber);
            result.put("isCompleted", newStatus);
            result.put("completedCount", completedCount);
            result.put("totalCount", 6);
            result.put("progressPercentage", progressPercentage);
            return result;

        } catch (SQLException e) {
            System.err.println("Error toggling student skill booster progress: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Database error toggling progress: " + e.getMessage());
        }
    }

    /**
     * Seeds an initial default active batch with 6 top LeetCode interview challenges.
     */
    private void seedInitialBatch(Connection conn) throws SQLException {
        // Find a default mentor ID if available
        Integer mentorId = null;
        try (Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery("SELECT id FROM mentors LIMIT 1")) {
            if (rs.next()) {
                mentorId = rs.getInt(1);
            }
        }

        int newBatchId = 0;
        String insertBatchSql = "INSERT INTO skill_booster_batches (updated_by_mentor_id, is_active) VALUES (?, TRUE)";
        try (PreparedStatement ps = conn.prepareStatement(insertBatchSql, Statement.RETURN_GENERATED_KEYS)) {
            if (mentorId != null) {
                ps.setInt(1, mentorId);
            } else {
                ps.setNull(1, Types.INTEGER);
            }
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    newBatchId = rs.getInt(1);
                }
            }
        }

        if (newBatchId > 0) {
            String insertQSql = "INSERT INTO skill_booster_questions (batch_id, question_number, title, problem_link) VALUES (?, ?, ?, ?)";
            try (PreparedStatement ps = conn.prepareStatement(insertQSql)) {
                Object[][] sampleQuestions = {
                    { 1, "Two Sum & Pair Matching", "https://leetcode.com/problems/two-sum/" },
                    { 2, "Valid Parentheses & Bracket Matching", "https://leetcode.com/problems/valid-parentheses/" },
                    { 3, "Merge Intervals & Overlapping Spans", "https://leetcode.com/problems/merge-intervals/" },
                    { 4, "Lowest Common Ancestor of a Binary Tree", "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/" },
                    { 5, "Longest Substring Without Repeating Characters", "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
                    { 6, "Coin Change & Optimal Denomination (DP)", "https://leetcode.com/problems/coin-change/" }
                };

                for (Object[] q : sampleQuestions) {
                    ps.setInt(1, newBatchId);
                    ps.setInt(2, (Integer) q[0]);
                    ps.setString(3, (String) q[1]);
                    ps.setString(4, (String) q[2]);
                    ps.addBatch();
                }
                ps.executeBatch();
            }
            System.out.println("Default 6-question Skill Booster batch initialized successfully.");
        }
    }
}
