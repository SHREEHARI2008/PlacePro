package com.campus.placement.dao;

import com.campus.placement.config.DBConnectionManager;
import com.campus.placement.model.LeetCodeStats;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

public class LeetCodeDAO {
    private final DBConnectionManager dbManager = DBConnectionManager.getInstance();

    public LeetCodeStats findByStudentId(int studentId) {
        String sql = "SELECT * FROM leetcode_stats WHERE student_id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToLeetCodeStats(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean saveOrUpdate(LeetCodeStats stats) {
        String checkSql = "SELECT id FROM leetcode_stats WHERE student_id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement psCheck = conn.prepareStatement(checkSql)) {
            psCheck.setInt(1, stats.getStudentId());
            try (ResultSet rs = psCheck.executeQuery()) {
                if (rs.next()) {
                    String updateSql = """
                        UPDATE leetcode_stats SET
                            username = ?, total_solved = ?, easy_solved = ?, medium_solved = ?,
                            hard_solved = ?, acceptance_rate = ?, global_ranking = ?,
                            streak_days = ?, total_active_days = ?, submission_calendar = ?, topic_stats = ?, last_synced_at = ?
                        WHERE student_id = ?
                    """;
                    try (PreparedStatement psUp = conn.prepareStatement(updateSql)) {
                        psUp.setString(1, stats.getUsername());
                        psUp.setInt(2, stats.getTotalSolved());
                        psUp.setInt(3, stats.getEasySolved());
                        psUp.setInt(4, stats.getMediumSolved());
                        psUp.setInt(5, stats.getHardSolved());
                        psUp.setDouble(6, stats.getAcceptanceRate());
                        psUp.setInt(7, stats.getGlobalRanking());
                        psUp.setInt(8, stats.getStreakDays());
                        psUp.setInt(9, stats.getTotalActiveDays());
                        psUp.setString(10, stats.getSubmissionCalendar());
                        psUp.setString(11, stats.getTopicStatsJson());
                        psUp.setTimestamp(12, new Timestamp(System.currentTimeMillis()));
                        psUp.setInt(13, stats.getStudentId());
                        return psUp.executeUpdate() > 0;
                    }
                } else {
                    String insertSql = """
                        INSERT INTO leetcode_stats 
                        (student_id, username, total_solved, easy_solved, medium_solved, hard_solved, acceptance_rate, global_ranking, streak_days, total_active_days, submission_calendar, topic_stats, last_synced_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """;
                    try (PreparedStatement psIn = conn.prepareStatement(insertSql)) {
                        psIn.setInt(1, stats.getStudentId());
                        psIn.setString(2, stats.getUsername());
                        psIn.setInt(3, stats.getTotalSolved());
                        psIn.setInt(4, stats.getEasySolved());
                        psIn.setInt(5, stats.getMediumSolved());
                        psIn.setInt(6, stats.getHardSolved());
                        psIn.setDouble(7, stats.getAcceptanceRate());
                        psIn.setInt(8, stats.getGlobalRanking());
                        psIn.setInt(9, stats.getStreakDays());
                        psIn.setInt(10, stats.getTotalActiveDays());
                        psIn.setString(11, stats.getSubmissionCalendar());
                        psIn.setString(12, stats.getTopicStatsJson());
                        psIn.setTimestamp(13, new Timestamp(System.currentTimeMillis()));
                        return psIn.executeUpdate() > 0;
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private LeetCodeStats mapRowToLeetCodeStats(ResultSet rs) throws SQLException {
        LeetCodeStats stats = new LeetCodeStats(
                rs.getInt("id"),
                rs.getInt("student_id"),
                rs.getString("username"),
                rs.getInt("total_solved"),
                rs.getInt("easy_solved"),
                rs.getInt("medium_solved"),
                rs.getInt("hard_solved"),
                rs.getDouble("acceptance_rate"),
                rs.getInt("global_ranking"),
                rs.getInt("streak_days"),
                rs.getString("topic_stats"),
                rs.getTimestamp("last_synced_at")
        );
        try {
            stats.setTotalActiveDays(rs.getInt("total_active_days"));
        } catch (Exception ignored) {}
        try {
            stats.setSubmissionCalendar(rs.getString("submission_calendar"));
        } catch (Exception ignored) {}
        stats.setSolvedToday(LeetCodeStats.computeSolvedToday(stats.getSubmissionCalendar()));
        stats.setMaxStreak(LeetCodeStats.computeMaxStreak(stats.getSubmissionCalendar(), stats.getStreakDays()));
        stats.setLive(true);
        return stats;
    }
}
