package com.campus.placement.dao;

import com.campus.placement.config.DBConnectionManager;
import com.campus.placement.model.Application;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class ApplicationDAO {
    private final DBConnectionManager dbManager = DBConnectionManager.getInstance();

    public int apply(int studentId, int driveId) {
        String sql = "INSERT INTO applications (student_id, drive_id, status) VALUES (?, ?, 'APPLIED')";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, studentId);
            ps.setInt(2, driveId);
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

    public List<Application> findByStudentId(int studentId) {
        List<Application> list = new ArrayList<>();
        String sql = """
            SELECT a.*, 
                   u.name AS student_name, s.roll_number AS student_roll, u.email AS student_email,
                   s.department AS student_department, s.cgpa AS student_cgpa, s.active_backlogs AS student_backlogs,
                   s.skills AS student_skills, s.resume_url AS student_resume_url, s.leetcode_username AS student_leetcode,
                   COALESCE(ls.total_solved, 0) AS student_lc_solved,
                   cd.company_name, cd.job_role, cd.package_lpa, cd.logo_url AS company_logo
            FROM applications a
            JOIN students s ON a.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN company_drives cd ON a.drive_id = cd.id
            LEFT JOIN leetcode_stats ls ON s.id = ls.student_id
            WHERE a.student_id = ?
            ORDER BY a.applied_at DESC
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToApplication(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<Application> findByDriveId(int driveId) {
        List<Application> list = new ArrayList<>();
        String sql = """
            SELECT a.*, 
                   u.name AS student_name, s.roll_number AS student_roll, u.email AS student_email,
                   s.department AS student_department, s.cgpa AS student_cgpa, s.active_backlogs AS student_backlogs,
                   s.skills AS student_skills, s.resume_url AS student_resume_url, s.leetcode_username AS student_leetcode,
                   COALESCE(ls.total_solved, 0) AS student_lc_solved,
                   cd.company_name, cd.job_role, cd.package_lpa, cd.logo_url AS company_logo
            FROM applications a
            JOIN students s ON a.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN company_drives cd ON a.drive_id = cd.id
            LEFT JOIN leetcode_stats ls ON s.id = ls.student_id
            WHERE a.drive_id = ?
            ORDER BY s.cgpa DESC, student_lc_solved DESC
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, driveId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToApplication(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<Application> findByDriveIdAndMentorId(int driveId, int mentorId) {
        List<Application> list = new ArrayList<>();
        String sql = """
            SELECT a.*, 
                   u.name AS student_name, s.roll_number AS student_roll, u.email AS student_email,
                   s.department AS student_department, s.cgpa AS student_cgpa, s.active_backlogs AS student_backlogs,
                   s.skills AS student_skills, s.resume_url AS student_resume_url, s.leetcode_username AS student_leetcode,
                   COALESCE(ls.total_solved, 0) AS student_lc_solved,
                   cd.company_name, cd.job_role, cd.package_lpa, cd.logo_url AS company_logo
            FROM applications a
            JOIN students s ON a.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN company_drives cd ON a.drive_id = cd.id
            LEFT JOIN leetcode_stats ls ON s.id = ls.student_id
            WHERE a.drive_id = ? AND s.mentor_id = ?
            ORDER BY s.cgpa DESC, student_lc_solved DESC
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, driveId);
            ps.setInt(2, mentorId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToApplication(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<Application> findByMentorId(int mentorId) {
        List<Application> list = new ArrayList<>();
        String sql = """
            SELECT a.*, 
                   u.name AS student_name, s.roll_number AS student_roll, u.email AS student_email,
                   s.department AS student_department, s.cgpa AS student_cgpa, s.active_backlogs AS student_backlogs,
                   s.skills AS student_skills, s.resume_url AS student_resume_url, s.leetcode_username AS student_leetcode,
                   COALESCE(ls.total_solved, 0) AS student_lc_solved,
                   cd.company_name, cd.job_role, cd.package_lpa, cd.logo_url AS company_logo
            FROM applications a
            JOIN students s ON a.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN company_drives cd ON a.drive_id = cd.id
            LEFT JOIN leetcode_stats ls ON s.id = ls.student_id
            WHERE s.mentor_id = ?
            ORDER BY a.applied_at DESC
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, mentorId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToApplication(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<Application> findAll() {
        List<Application> list = new ArrayList<>();
        String sql = """
            SELECT a.*, 
                   u.name AS student_name, s.roll_number AS student_roll, u.email AS student_email,
                   s.department AS student_department, s.cgpa AS student_cgpa, s.active_backlogs AS student_backlogs,
                   s.skills AS student_skills, s.resume_url AS student_resume_url, s.leetcode_username AS student_leetcode,
                   COALESCE(ls.total_solved, 0) AS student_lc_solved,
                   cd.company_name, cd.job_role, cd.package_lpa, cd.logo_url AS company_logo
            FROM applications a
            JOIN students s ON a.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN company_drives cd ON a.drive_id = cd.id
            LEFT JOIN leetcode_stats ls ON s.id = ls.student_id
            ORDER BY a.applied_at DESC
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapRowToApplication(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public boolean updateStatus(int applicationId, String status, String remarks) {
        String sql = "UPDATE applications SET status = ?, mentor_remarks = ? WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setString(2, remarks);
            ps.setInt(3, applicationId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public Application findByStudentAndDrive(int studentId, int driveId) {
        String sql = """
            SELECT a.*, 
                   u.name AS student_name, s.roll_number AS student_roll, u.email AS student_email,
                   s.department AS student_department, s.cgpa AS student_cgpa, s.active_backlogs AS student_backlogs,
                   s.skills AS student_skills, s.resume_url AS student_resume_url, s.leetcode_username AS student_leetcode,
                   COALESCE(ls.total_solved, 0) AS student_lc_solved,
                   cd.company_name, cd.job_role, cd.package_lpa, cd.logo_url AS company_logo
            FROM applications a
            JOIN students s ON a.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN company_drives cd ON a.drive_id = cd.id
            LEFT JOIN leetcode_stats ls ON s.id = ls.student_id
            WHERE a.student_id = ? AND a.drive_id = ?
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            ps.setInt(2, driveId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToApplication(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Application findById(int applicationId) {
        String sql = """
            SELECT a.*, 
                   u.name AS student_name, s.roll_number AS student_roll, u.email AS student_email,
                   s.department AS student_department, s.cgpa AS student_cgpa, s.active_backlogs AS student_backlogs,
                   s.skills AS student_skills, s.resume_url AS student_resume_url, s.leetcode_username AS student_leetcode,
                   COALESCE(ls.total_solved, 0) AS student_lc_solved,
                   cd.company_name, cd.job_role, cd.package_lpa, cd.logo_url AS company_logo
            FROM applications a
            JOIN students s ON a.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN company_drives cd ON a.drive_id = cd.id
            LEFT JOIN leetcode_stats ls ON s.id = ls.student_id
            WHERE a.id = ?
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, applicationId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToApplication(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    private Application mapRowToApplication(ResultSet rs) throws SQLException {
        Application app = new Application();
        app.setId(rs.getInt("id"));
        app.setStudentId(rs.getInt("student_id"));
        app.setDriveId(rs.getInt("drive_id"));
        app.setAppliedAt(rs.getTimestamp("applied_at"));
        app.setStatus(rs.getString("status"));
        app.setMentorRemarks(rs.getString("mentor_remarks"));
        app.setUpdatedAt(rs.getTimestamp("updated_at"));

        app.setStudentName(rs.getString("student_name"));
        app.setStudentRoll(rs.getString("student_roll"));
        app.setStudentEmail(rs.getString("student_email"));
        app.setStudentDepartment(rs.getString("student_department"));
        app.setStudentCgpa(rs.getDouble("student_cgpa"));
        app.setStudentActiveBacklogs(rs.getInt("student_backlogs"));
        app.setStudentSkills(rs.getString("student_skills"));
        app.setStudentResumeUrl(rs.getString("student_resume_url"));
        app.setStudentLeetcode(rs.getString("student_leetcode"));
        app.setStudentLeetcodeTotalSolved(rs.getInt("student_lc_solved"));

        app.setCompanyName(rs.getString("company_name"));
        app.setJobRole(rs.getString("job_role"));
        app.setPackageLpa(rs.getDouble("package_lpa"));
        app.setCompanyLogo(rs.getString("company_logo"));
        return app;
    }
}
