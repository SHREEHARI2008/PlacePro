package com.campus.placement.dao;

import com.campus.placement.config.DBConnectionManager;
import com.campus.placement.model.MentorFeedback;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class FeedbackDAO {
    private final DBConnectionManager dbManager = DBConnectionManager.getInstance();

    public List<MentorFeedback> findByStudentId(int studentId) {
        List<MentorFeedback> list = new ArrayList<>();
        String sql = """
            SELECT fb.*, u.name AS mentor_name, m.designation AS mentor_designation, s_u.name AS student_name
            FROM mentor_feedback fb
            JOIN mentors m ON fb.mentor_id = m.id
            JOIN users u ON m.user_id = u.id
            JOIN students s ON fb.student_id = s.id
            JOIN users s_u ON s.user_id = s_u.id
            WHERE fb.student_id = ?
            ORDER BY fb.created_at DESC
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    MentorFeedback fb = new MentorFeedback(
                            rs.getInt("id"),
                            rs.getInt("mentor_id"),
                            rs.getInt("student_id"),
                            rs.getString("feedback_text"),
                            rs.getString("focus_area"),
                            rs.getInt("rating"),
                            rs.getTimestamp("created_at")
                    );
                    fb.setMentorName(rs.getString("mentor_name"));
                    fb.setMentorDesignation(rs.getString("mentor_designation"));
                    fb.setStudentName(rs.getString("student_name"));
                    list.add(fb);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<MentorFeedback> findByMentorId(int mentorId) {
        List<MentorFeedback> list = new ArrayList<>();
        String sql = """
            SELECT fb.*, u.name AS mentor_name, m.designation AS mentor_designation, s_u.name AS student_name
            FROM mentor_feedback fb
            JOIN mentors m ON fb.mentor_id = m.id
            JOIN users u ON m.user_id = u.id
            JOIN students s ON fb.student_id = s.id
            JOIN users s_u ON s.user_id = s_u.id
            WHERE fb.mentor_id = ?
            ORDER BY fb.created_at DESC
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, mentorId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    MentorFeedback fb = new MentorFeedback(
                            rs.getInt("id"),
                            rs.getInt("mentor_id"),
                            rs.getInt("student_id"),
                            rs.getString("feedback_text"),
                            rs.getString("focus_area"),
                            rs.getInt("rating"),
                            rs.getTimestamp("created_at")
                    );
                    fb.setMentorName(rs.getString("mentor_name"));
                    fb.setMentorDesignation(rs.getString("mentor_designation"));
                    fb.setStudentName(rs.getString("student_name"));
                    list.add(fb);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public int addFeedback(MentorFeedback fb) {
        String sql = "INSERT INTO mentor_feedback (mentor_id, student_id, feedback_text, focus_area, rating) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, fb.getMentorId());
            ps.setInt(2, fb.getStudentId());
            ps.setString(3, fb.getFeedbackText());
            ps.setString(4, fb.getFocusArea());
            ps.setInt(5, fb.getRating());
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
}
