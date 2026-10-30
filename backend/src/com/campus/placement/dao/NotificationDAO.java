package com.campus.placement.dao;

import com.campus.placement.config.DBConnectionManager;
import com.campus.placement.model.Notification;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class NotificationDAO {
    private final DBConnectionManager dbManager = DBConnectionManager.getInstance();

    /**
     * Insert a new notification alert.
     */
    public int createNotification(Notification n) {
        String sql = """
            INSERT INTO notifications (user_id, student_id, category, type, title, message, reference_id, is_read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            if (n.getUserId() != null && n.getUserId() > 0) {
                ps.setInt(1, n.getUserId());
                ps.setInt(2, n.getUserId());
            } else {
                ps.setNull(1, Types.INTEGER);
                ps.setNull(2, Types.INTEGER);
            }
            String cat = n.getCategory() != null ? n.getCategory() : "General Alert";
            ps.setString(3, cat);
            ps.setString(4, cat);
            ps.setString(5, n.getTitle());
            ps.setString(6, n.getMessage());
            if (n.getReferenceId() != null && n.getReferenceId() > 0) {
                ps.setInt(7, n.getReferenceId());
            } else {
                ps.setNull(7, Types.INTEGER);
            }
            ps.setBoolean(8, n.isRead());
            if (n.getCreatedAt() != null) {
                ps.setTimestamp(9, n.getCreatedAt());
            } else {
                ps.setTimestamp(9, new Timestamp(System.currentTimeMillis()));
            }

            int affected = ps.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        int id = rs.getInt(1);
                        n.setNotificationId(id);
                        return id;
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }

    /**
     * Fetch unread and recent notifications for a user/student, ordered by created_at DESC.
     * Also fetches broadcast alerts (where user_id IS NULL or user_id = 0).
     */
    public List<Notification> getNotificationsByUserId(int userId) {
        List<Notification> list = new ArrayList<>();
        String sql = """
            SELECT * FROM notifications
            WHERE user_id = ? OR student_id = ? OR user_id IS NULL OR user_id = 0
            ORDER BY created_at DESC
            LIMIT 50
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.setInt(2, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToNotification(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    /**
     * Mark an individual notification as read.
     */
    public boolean markAsRead(int notificationId) {
        String sql = "UPDATE notifications SET is_read = TRUE WHERE notification_id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, notificationId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Mark all notifications for a specific user as read.
     */
    public boolean markAllAsRead(int userId) {
        String sql = "UPDATE notifications SET is_read = TRUE WHERE (user_id = ? OR student_id = ? OR user_id IS NULL OR user_id = 0) AND is_read = FALSE";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.setInt(2, userId);
            ps.executeUpdate();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Return live count of unread notifications for navbar bell badge.
     */
    public int getUnreadCount(int userId) {
        String sql = "SELECT COUNT(*) FROM notifications WHERE (user_id = ? OR student_id = ? OR user_id IS NULL OR user_id = 0) AND is_read = FALSE";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.setInt(2, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    private Notification mapRowToNotification(ResultSet rs) throws SQLException {
        Notification n = new Notification();
        try {
            n.setNotificationId(rs.getInt("notification_id"));
        } catch (SQLException e) {
            try {
                n.setNotificationId(rs.getInt("id"));
            } catch (SQLException ignored) {}
        }

        try {
            int uid = rs.getInt("user_id");
            if (!rs.wasNull() && uid > 0) {
                n.setUserId(uid);
            } else {
                int sid = rs.getInt("student_id");
                if (!rs.wasNull() && sid > 0) {
                    n.setUserId(sid);
                } else {
                    n.setUserId(null);
                }
            }
        } catch (SQLException e) {
            try {
                int sid = rs.getInt("student_id");
                if (!rs.wasNull()) n.setUserId(sid);
            } catch (SQLException ignored) {}
        }

        try {
            String cat = rs.getString("category");
            if (cat != null && !cat.isEmpty()) {
                n.setCategory(cat);
            } else {
                n.setCategory(rs.getString("type"));
            }
        } catch (SQLException e) {
            try {
                n.setCategory(rs.getString("type"));
            } catch (SQLException ignored) {}
        }

        n.setTitle(rs.getString("title"));
        n.setMessage(rs.getString("message"));
        try {
            int refId = rs.getInt("reference_id");
            if (!rs.wasNull()) {
                n.setReferenceId(refId);
            } else {
                n.setReferenceId(null);
            }
        } catch (SQLException ignored) {}

        n.setRead(rs.getBoolean("is_read"));
        n.setCreatedAt(rs.getTimestamp("created_at"));
        return n;
    }
}
