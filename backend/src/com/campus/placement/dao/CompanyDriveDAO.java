package com.campus.placement.dao;

import com.campus.placement.config.DBConnectionManager;
import com.campus.placement.model.CompanyDrive;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class CompanyDriveDAO {
    private final DBConnectionManager dbManager = DBConnectionManager.getInstance();

    public List<CompanyDrive> findAll() {
        List<CompanyDrive> list = new ArrayList<>();
        String sql = """
            SELECT cd.*, 
                   (SELECT COUNT(*) FROM applications a WHERE a.drive_id = cd.id) AS applicant_count
            FROM company_drives cd
            ORDER BY cd.drive_date ASC
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapRowToCompanyDrive(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public CompanyDrive findById(int id) {
        String sql = """
            SELECT cd.*, 
                   (SELECT COUNT(*) FROM applications a WHERE a.drive_id = cd.id) AS applicant_count
            FROM company_drives cd
            WHERE cd.id = ?
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToCompanyDrive(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public int createDrive(CompanyDrive drive) {
        String sql = """
            INSERT INTO company_drives 
            (company_name, logo_url, job_role, package_lpa, min_cgpa, max_backlogs_allowed, eligible_branches, required_skills, job_location, drive_date, application_deadline, description, posted_by_mentor_id, status, registration_url, gform_link, application_link)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, drive.getCompanyName());
            ps.setString(2, drive.getLogoUrl());
            ps.setString(3, drive.getJobRole());
            ps.setDouble(4, drive.getPackageLpa());
            ps.setDouble(5, drive.getMinCgpa());
            ps.setInt(6, drive.getMaxBacklogsAllowed());
            ps.setString(7, drive.getEligibleBranches());
            ps.setString(8, drive.getRequiredSkills());
            ps.setString(9, drive.getJobLocation());
            ps.setDate(10, drive.getDriveDate() != null ? drive.getDriveDate() : new java.sql.Date(System.currentTimeMillis() + 86400000L * 30));
            ps.setDate(11, drive.getApplicationDeadline() != null ? drive.getApplicationDeadline() : new java.sql.Date(System.currentTimeMillis() + 86400000L * 15));
            ps.setString(12, drive.getDescription());
            if (drive.getPostedByMentorId() != null) {
                ps.setInt(13, drive.getPostedByMentorId());
            } else {
                ps.setNull(13, java.sql.Types.INTEGER);
            }
            ps.setString(14, drive.getStatus() != null ? drive.getStatus() : "UPCOMING");
            ps.setString(15, drive.getRegistrationUrl());
            ps.setString(16, drive.getRegistrationUrl());
            ps.setString(17, drive.getRegistrationUrl());
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

    public boolean updateDrive(CompanyDrive drive) {
        String sql = """
            UPDATE company_drives SET
                company_name = ?, logo_url = ?, job_role = ?, package_lpa = ?,
                min_cgpa = ?, max_backlogs_allowed = ?, eligible_branches = ?,
                required_skills = ?, job_location = ?, drive_date = ?,
                application_deadline = ?, description = ?, status = ?,
                registration_url = ?, gform_link = ?, application_link = ?
            WHERE id = ?
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, drive.getCompanyName());
            ps.setString(2, drive.getLogoUrl());
            ps.setString(3, drive.getJobRole());
            ps.setDouble(4, drive.getPackageLpa());
            ps.setDouble(5, drive.getMinCgpa());
            ps.setInt(6, drive.getMaxBacklogsAllowed());
            ps.setString(7, drive.getEligibleBranches());
            ps.setString(8, drive.getRequiredSkills());
            ps.setString(9, drive.getJobLocation());
            ps.setDate(10, drive.getDriveDate());
            ps.setDate(11, drive.getApplicationDeadline());
            ps.setString(12, drive.getDescription());
            ps.setString(13, drive.getStatus());
            ps.setString(14, drive.getRegistrationUrl());
            ps.setString(15, drive.getRegistrationUrl());
            ps.setString(16, drive.getRegistrationUrl());
            ps.setInt(17, drive.getId());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean deleteDrive(int driveId) {
        String sql = "DELETE FROM company_drives WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, driveId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private CompanyDrive mapRowToCompanyDrive(ResultSet rs) throws SQLException {
        CompanyDrive drive = new CompanyDrive();
        drive.setId(rs.getInt("id"));
        drive.setCompanyName(rs.getString("company_name"));
        drive.setLogoUrl(rs.getString("logo_url"));
        drive.setJobRole(rs.getString("job_role"));
        drive.setPackageLpa(rs.getDouble("package_lpa"));
        drive.setMinCgpa(rs.getDouble("min_cgpa"));
        drive.setMaxBacklogsAllowed(rs.getInt("max_backlogs_allowed"));
        drive.setEligibleBranches(rs.getString("eligible_branches"));
        drive.setRequiredSkills(rs.getString("required_skills"));
        drive.setJobLocation(rs.getString("job_location"));
        drive.setDriveDate(rs.getDate("drive_date"));
        drive.setApplicationDeadline(rs.getDate("application_deadline"));
        drive.setDescription(rs.getString("description"));
        drive.setPostedByMentorId((Integer) rs.getObject("posted_by_mentor_id"));
        drive.setStatus(rs.getString("status"));
        drive.setCreatedAt(rs.getTimestamp("created_at"));
        drive.setApplicantCount(rs.getInt("applicant_count"));
        String regUrl = null;
        try {
            regUrl = rs.getString("registration_url");
        } catch (Exception ignored) {}
        if (regUrl == null || regUrl.isEmpty()) {
            try {
                regUrl = rs.getString("gform_link");
            } catch (Exception ignored) {}
        }
        if (regUrl == null || regUrl.isEmpty()) {
            try {
                regUrl = rs.getString("application_link");
            } catch (Exception ignored) {}
        }
        drive.setRegistrationUrl(regUrl);
        return drive;
    }
}
