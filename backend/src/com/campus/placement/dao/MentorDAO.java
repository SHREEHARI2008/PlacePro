package com.campus.placement.dao;

import com.campus.placement.config.DBConnectionManager;
import com.campus.placement.model.Mentor;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class MentorDAO {
    private final DBConnectionManager dbManager = DBConnectionManager.getInstance();

    public Mentor findByUserId(int userId) {
        String sql = """
            SELECT m.*, u.name, u.email, u.password_hash, u.avatar_url, u.created_at, u.phone_number,
                   (SELECT COUNT(*) FROM students s WHERE s.mentor_id = m.id) AS mentee_count
            FROM mentors m
            JOIN users u ON m.user_id = u.id
            WHERE m.user_id = ?
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToMentor(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Mentor findById(int mentorId) {
        String sql = """
            SELECT m.*, u.name, u.email, u.password_hash, u.avatar_url, u.created_at, u.phone_number,
                   (SELECT COUNT(*) FROM students s WHERE s.mentor_id = m.id) AS mentee_count
            FROM mentors m
            JOIN users u ON m.user_id = u.id
            WHERE m.id = ?
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, mentorId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToMentor(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Mentor findByStaffId(String staffId) {
        if (staffId == null || staffId.trim().isEmpty()) return null;
        String sql = """
            SELECT m.*, u.name, u.email, u.password_hash, u.avatar_url, u.created_at, u.phone_number,
                   (SELECT COUNT(*) FROM students s WHERE s.mentor_id = m.id) AS mentee_count
            FROM mentors m
            JOIN users u ON m.user_id = u.id
            WHERE m.mentor_staff_id = ?
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, staffId.trim());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToMentor(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Mentor> findAll() {
        List<Mentor> list = new ArrayList<>();
        String sql = """
            SELECT m.*, u.name, u.email, u.password_hash, u.avatar_url, u.created_at, u.phone_number,
                   (SELECT COUNT(*) FROM students s WHERE s.mentor_id = m.id) AS mentee_count
            FROM mentors m
            JOIN users u ON m.user_id = u.id
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapRowToMentor(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public int createMentor(Mentor mentor) {
        String sql = "INSERT INTO mentors (user_id, department, designation, cabin_location, mentor_staff_id) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, mentor.getId()); // user_id
            ps.setString(2, mentor.getDepartment());
            ps.setString(3, mentor.getDesignation());
            ps.setString(4, mentor.getCabinLocation());
            ps.setString(5, mentor.getMentorStaffId());
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

    public boolean updateMentorProfile(int mentorId, String name, String phone, String department, String designation, String cabinLocation) {
        String sqlMentor = "UPDATE mentors SET department = ?, designation = ?, cabin_location = ? WHERE id = ?";
        String sqlUser = "UPDATE users SET name = ?, phone_number = ? WHERE id = (SELECT user_id FROM mentors WHERE id = ?)";
        try (Connection conn = dbManager.getConnection()) {
            conn.setAutoCommit(false);
            try (PreparedStatement psM = conn.prepareStatement(sqlMentor);
                 PreparedStatement psU = conn.prepareStatement(sqlUser)) {
                psM.setString(1, department);
                psM.setString(2, designation);
                psM.setString(3, cabinLocation);
                psM.setInt(4, mentorId);
                psM.executeUpdate();

                psU.setString(1, name);
                psU.setString(2, phone);
                psU.setInt(3, mentorId);
                psU.executeUpdate();

                conn.commit();
                return true;
            } catch (SQLException e) {
                conn.rollback();
                e.printStackTrace();
            } finally {
                conn.setAutoCommit(true);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private Mentor mapRowToMentor(ResultSet rs) throws SQLException {
        Mentor m = new Mentor(
                rs.getInt("user_id"),
                rs.getString("name"),
                rs.getString("email"),
                rs.getString("password_hash"),
                rs.getString("avatar_url"),
                rs.getTimestamp("created_at"),
                rs.getInt("id"),
                rs.getString("department"),
                rs.getString("designation"),
                rs.getString("cabin_location")
        );
        m.setMenteeCount(rs.getInt("mentee_count"));
        try {
            m.setMentorStaffId(rs.getString("mentor_staff_id"));
        } catch (Exception ignored) {}
        try {
            m.setPhoneNumber(rs.getString("phone_number"));
        } catch (Exception ignored) {}
        return m;
    }
}
