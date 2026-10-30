package com.campus.placement.dao;

import com.campus.placement.config.DBConnectionManager;
import com.campus.placement.model.Assessment;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class AssessmentDAO {
    private final DBConnectionManager dbManager = DBConnectionManager.getInstance();

    public int createAssessment(Assessment a) {
        String sql = """
            INSERT INTO assessments (mentor_id, title, description, target_dept, test_link, due_date)
            VALUES (?, ?, ?, ?, ?, ?)
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            if (a.getMentorId() != null) {
                ps.setInt(1, a.getMentorId());
            } else {
                ps.setNull(1, java.sql.Types.INTEGER);
            }
            ps.setString(2, a.getTitle());
            ps.setString(3, a.getDescription());
            ps.setString(4, a.getTargetDept());
            ps.setString(5, a.getTestLink());
            ps.setString(6, a.getDueDate());

            int affected = ps.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        return rs.getInt(1);
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }

    public List<Assessment> findAll() {
        List<Assessment> list = new ArrayList<>();
        String sql = """
            SELECT a.*, u.name AS mentor_name
            FROM assessments a
            LEFT JOIN mentors m ON a.mentor_id = m.id
            LEFT JOIN users u ON m.user_id = u.id
            ORDER BY a.due_date ASC
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapRowToAssessment(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<Assessment> findByMentorId(int mentorId) {
        List<Assessment> list = new ArrayList<>();
        String sql = """
            SELECT a.*, u.name AS mentor_name
            FROM assessments a
            LEFT JOIN mentors m ON a.mentor_id = m.id
            LEFT JOIN users u ON m.user_id = u.id
            WHERE a.mentor_id = ?
            ORDER BY a.due_date ASC
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, mentorId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToAssessment(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<Assessment> findByDepartment(String dept) {
        List<Assessment> list = new ArrayList<>();
        String sql = """
            SELECT a.*, u.name AS mentor_name
            FROM assessments a
            LEFT JOIN mentors m ON a.mentor_id = m.id
            LEFT JOIN users u ON m.user_id = u.id
            WHERE a.target_dept LIKE ? OR a.target_dept LIKE '%ALL%'
            ORDER BY a.due_date ASC
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, "%" + dept + "%");
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToAssessment(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public boolean toggleStudentAssessmentCompletion(int assessmentId, int studentId, boolean completed) {
        String sql;
        if (completed) {
            sql = """
                INSERT INTO student_assessments (assessment_id, student_id, status, is_completed, submitted_at, completed_at)
                VALUES (?, ?, 'COMPLETED', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON DUPLICATE KEY UPDATE status = 'COMPLETED', is_completed = TRUE, submitted_at = CURRENT_TIMESTAMP, completed_at = CURRENT_TIMESTAMP
            """;
        } else {
            sql = """
                INSERT INTO student_assessments (assessment_id, student_id, status, is_completed, submitted_at, completed_at)
                VALUES (?, ?, 'ASSIGNED', FALSE, NULL, NULL)
                ON DUPLICATE KEY UPDATE status = 'ASSIGNED', is_completed = FALSE, submitted_at = NULL, completed_at = NULL
            """;
        }
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, assessmentId);
            ps.setInt(2, studentId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public List<Assessment> findByDepartmentForStudent(String dept, int studentId) {
        List<Assessment> list = new ArrayList<>();
        String sql = """
            SELECT a.*, u.name AS mentor_name,
                   COALESCE(sa.status, 'ASSIGNED') AS student_status,
                   sa.submitted_at,
                   sa.is_completed,
                   sa.completed_at
            FROM assessments a
            LEFT JOIN mentors m ON a.mentor_id = m.id
            LEFT JOIN users u ON m.user_id = u.id
            LEFT JOIN student_assessments sa ON a.assessment_id = sa.assessment_id AND sa.student_id = ?
            WHERE a.target_dept LIKE ? OR a.target_dept LIKE '%ALL%'
            ORDER BY a.due_date ASC
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            ps.setString(2, "%" + (dept != null ? dept : "") + "%");
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Assessment a = mapRowToAssessment(rs);
                    String status = rs.getString("student_status");
                    boolean isDone = "COMPLETED".equalsIgnoreCase(status);
                    try {
                        if (!isDone && rs.getObject("is_completed") != null) {
                            isDone = rs.getBoolean("is_completed");
                        }
                    } catch (Exception ignored) {}
                    a.setCompleted(isDone);
                    java.sql.Timestamp sub = rs.getTimestamp("submitted_at");
                    if (sub == null) {
                        try { sub = rs.getTimestamp("completed_at"); } catch (Exception ignored) {}
                    }
                    if (sub != null) {
                        a.setCompletedAt(sub.toString());
                    }
                    list.add(a);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<Assessment> findStudentAssessments(int studentId) {
        List<Assessment> list = new ArrayList<>();
        String sql = """
            SELECT a.*, u.name AS mentor_name,
                   COALESCE(sa.status, 'ASSIGNED') AS student_status,
                   sa.submitted_at,
                   sa.is_completed,
                   sa.completed_at
            FROM assessments a
            JOIN students s ON s.id = ?
            LEFT JOIN mentors m ON a.mentor_id = m.id
            LEFT JOIN users u ON m.user_id = u.id
            LEFT JOIN student_assessments sa ON a.assessment_id = sa.assessment_id AND sa.student_id = s.id
            WHERE a.target_dept LIKE CONCAT('%', s.department, '%') OR a.target_dept LIKE '%ALL%'
            ORDER BY a.due_date ASC
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Assessment a = mapRowToAssessment(rs);
                    String status = rs.getString("student_status");
                    boolean isDone = "COMPLETED".equalsIgnoreCase(status);
                    try {
                        if (!isDone && rs.getObject("is_completed") != null) {
                            isDone = rs.getBoolean("is_completed");
                        }
                    } catch (Exception ignored) {}
                    a.setCompleted(isDone);
                    java.sql.Timestamp sub = rs.getTimestamp("submitted_at");
                    if (sub == null) {
                        try { sub = rs.getTimestamp("completed_at"); } catch (Exception ignored) {}
                    }
                    if (sub != null) {
                        a.setCompletedAt(sub.toString());
                    }
                    list.add(a);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<Assessment> findByMentorIdWithStats(int mentorId) {
        List<Assessment> list = new ArrayList<>();
        String sql = """
            SELECT a.*, u.name AS mentor_name,
                   COUNT(DISTINCT CASE WHEN sa.status = 'COMPLETED' OR sa.is_completed = TRUE THEN sa.student_id END) AS completed_count
            FROM assessments a
            LEFT JOIN mentors m ON a.mentor_id = m.id
            LEFT JOIN users u ON m.user_id = u.id
            LEFT JOIN student_assessments sa ON a.assessment_id = sa.assessment_id
            WHERE a.mentor_id = ?
            GROUP BY a.assessment_id, u.name
            ORDER BY a.due_date ASC
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, mentorId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Assessment a = mapRowToAssessment(rs);
                    a.setCompletedCount(rs.getInt("completed_count"));
                    list.add(a);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public boolean deleteAssessment(int assessmentId) {
        String sql = "DELETE FROM assessments WHERE assessment_id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, assessmentId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private Assessment mapRowToAssessment(ResultSet rs) throws SQLException {
        Assessment a = new Assessment();
        a.setAssessmentId(rs.getInt("assessment_id"));
        a.setMentorId((Integer) rs.getObject("mentor_id"));
        a.setTitle(rs.getString("title"));
        a.setDescription(rs.getString("description"));
        a.setTargetDept(rs.getString("target_dept"));
        a.setTestLink(rs.getString("test_link"));
        a.setDueDate(rs.getString("due_date"));
        a.setCreatedAt(rs.getTimestamp("created_at"));
        try {
            a.setMentorName(rs.getString("mentor_name"));
        } catch (Exception ignored) {}
        return a;
    }
}
