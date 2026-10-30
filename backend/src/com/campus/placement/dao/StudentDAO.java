package com.campus.placement.dao;

import com.campus.placement.config.DBConnectionManager;
import com.campus.placement.model.AcademicRecord;
import com.campus.placement.model.Student;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class StudentDAO {
    private final DBConnectionManager dbManager = DBConnectionManager.getInstance();

    public Student findByUserId(int userId) {
        String sql = """
            SELECT s.*, u.name, u.email, u.password_hash, u.avatar_url, u.created_at,
                   m_u.name AS mentor_name
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN mentors m ON s.mentor_id = m.id
            LEFT JOIN users m_u ON m.user_id = m_u.id
            WHERE s.user_id = ?
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToStudent(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Student findById(int studentId) {
        String sql = """
            SELECT s.*, u.name, u.email, u.password_hash, u.avatar_url, u.created_at,
                   m_u.name AS mentor_name
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN mentors m ON s.mentor_id = m.id
            LEFT JOIN users m_u ON m.user_id = m_u.id
            WHERE s.id = ?
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToStudent(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Student findByRegisterNumber(String regNo) {
        if (regNo == null || regNo.trim().isEmpty()) return null;
        String sql = """
            SELECT s.*, u.name, u.email, u.password_hash, u.avatar_url, u.created_at,
                   m_u.name AS mentor_name
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN mentors m ON s.mentor_id = m.id
            LEFT JOIN users m_u ON m.user_id = m_u.id
            WHERE s.roll_number = ? OR s.register_number = ?
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, regNo.trim());
            ps.setString(2, regNo.trim());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToStudent(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Student> findByMentorId(int mentorId) {
        List<Student> list = new ArrayList<>();
        String sql = """
            SELECT s.*, u.name, u.email, u.password_hash, u.avatar_url, u.created_at,
                   m_u.name AS mentor_name
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN mentors m ON s.mentor_id = m.id
            LEFT JOIN users m_u ON m.user_id = m_u.id
            WHERE s.mentor_id = ?
            ORDER BY s.cgpa DESC
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, mentorId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToStudent(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<Student> findAll() {
        List<Student> list = new ArrayList<>();
        String sql = """
            SELECT s.*, u.name, u.email, u.password_hash, u.avatar_url, u.created_at,
                   m_u.name AS mentor_name
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN mentors m ON s.mentor_id = m.id
            LEFT JOIN users m_u ON m.user_id = m_u.id
            ORDER BY s.cgpa DESC
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapRowToStudent(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public int createStudent(Student student) {
        String sql = """
            INSERT INTO students (
                user_id, roll_number, register_number, department, year_semester, batch_year, mentor_id, cgpa,
                active_backlogs, history_of_backlogs, leetcode_username, leetcode_url, resume_url,
                skills, phone_number, gender, date_of_birth, tenth_percentage,
                twelfth_percentage, diploma_percentage, undergraduate_gpa, college_name, campus, degree
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, student.getId()); // user_id
            ps.setString(2, student.getRollNumber());
            ps.setString(3, student.getRegisterNumber());
            ps.setString(4, student.getDepartment());
            ps.setString(5, student.getYearSemester());
            ps.setInt(6, student.getBatchYear());
            if (student.getMentorId() != null) {
                ps.setInt(7, student.getMentorId());
            } else {
                ps.setNull(7, java.sql.Types.INTEGER);
            }
            ps.setDouble(8, student.getCgpa());
            ps.setInt(9, student.getActiveBacklogs());
            ps.setInt(10, student.getHistoryOfBacklogs());
            ps.setString(11, student.getLeetcodeUsername());
            ps.setString(12, student.getLeetcodeUrl());
            ps.setString(13, student.getResumeUrl());
            ps.setString(14, student.getSkills());
            ps.setString(15, student.getPhoneNumber());
            ps.setString(16, student.getGender());
            ps.setString(17, student.getDateOfBirth());
            ps.setString(18, student.getTenthPercentage());
            ps.setString(19, student.getTwelfthPercentage());
            ps.setString(20, student.getDiplomaPercentage());
            ps.setString(21, student.getUndergraduateGpa());
            ps.setString(22, student.getCollegeName());
            ps.setString(23, student.getCampus());
            ps.setString(24, student.getDegree());

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

    public boolean updateStudent(Student student) {
        String sql = """
            UPDATE students SET
                roll_number = ?, register_number = ?, department = ?, year_semester = ?, batch_year = ?, cgpa = ?,
                active_backlogs = ?, history_of_backlogs = ?, leetcode_username = ?, leetcode_url = ?,
                resume_url = ?, skills = ?, phone_number = ?, gender = ?, date_of_birth = ?,
                tenth_percentage = ?, twelfth_percentage = ?, diploma_percentage = ?,
                undergraduate_gpa = ?, college_name = ?, campus = ?, degree = ?
            WHERE id = ?
        """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, student.getRollNumber());
            ps.setString(2, student.getRegisterNumber());
            ps.setString(3, student.getDepartment());
            ps.setString(4, student.getYearSemester());
            ps.setInt(5, student.getBatchYear());
            ps.setDouble(6, student.getCgpa());
            ps.setInt(7, student.getActiveBacklogs());
            ps.setInt(8, student.getHistoryOfBacklogs());
            ps.setString(9, student.getLeetcodeUsername());
            ps.setString(10, student.getLeetcodeUrl());
            ps.setString(11, student.getResumeUrl());
            ps.setString(12, student.getSkills());
            ps.setString(13, student.getPhoneNumber());
            ps.setString(14, student.getGender());
            ps.setString(15, student.getDateOfBirth());
            ps.setString(16, student.getTenthPercentage());
            ps.setString(17, student.getTwelfthPercentage());
            ps.setString(18, student.getDiplomaPercentage());
            ps.setString(19, student.getUndergraduateGpa());
            ps.setString(20, student.getCollegeName());
            ps.setString(21, student.getCampus());
            ps.setString(22, student.getDegree());
            ps.setInt(23, student.getStudentId());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateFullProfile(Student s, String name, String phone) {
        boolean hasAvatar = s.getAvatarUrl() != null && !s.getAvatarUrl().trim().isEmpty();
        String userSql = hasAvatar
                ? "UPDATE users SET name = ?, phone_number = ?, avatar_url = ? WHERE id = ?"
                : "UPDATE users SET name = ?, phone_number = ? WHERE id = ?";
        String studentSql = """
            UPDATE students SET
                phone_number = ?, gender = ?, date_of_birth = ?,
                tenth_percentage = ?, twelfth_percentage = ?, diploma_percentage = ?,
                undergraduate_gpa = ?, college_name = ?, campus = ?, degree = ?,
                mentor_id = ?, skills = ?, resume_drive_url = ?
            WHERE id = ?
        """;
        try (Connection conn = dbManager.getConnection()) {
            conn.setAutoCommit(false);
            try (PreparedStatement psUser = conn.prepareStatement(userSql);
                 PreparedStatement psStudent = conn.prepareStatement(studentSql)) {

                psUser.setString(1, name);
                psUser.setString(2, phone);
                if (hasAvatar) {
                    psUser.setString(3, s.getAvatarUrl().trim());
                    psUser.setInt(4, s.getId()); // user_id
                } else {
                    psUser.setInt(3, s.getId()); // user_id
                }
                psUser.executeUpdate();

                psStudent.setString(1, phone);
                psStudent.setString(2, s.getGender());
                psStudent.setString(3, s.getDateOfBirth());
                psStudent.setString(4, s.getTenthPercentage());
                psStudent.setString(5, s.getTwelfthPercentage());
                psStudent.setString(6, s.getDiplomaPercentage());
                psStudent.setString(7, s.getUndergraduateGpa());
                psStudent.setString(8, s.getCollegeName());
                psStudent.setString(9, s.getCampus());
                psStudent.setString(10, s.getDegree());
                if (s.getMentorId() != null) {
                    psStudent.setInt(11, s.getMentorId());
                } else {
                    psStudent.setNull(11, java.sql.Types.INTEGER);
                }
                psStudent.setString(12, s.getSkills());
                psStudent.setString(13, s.getResumeDriveUrl());
                psStudent.setInt(14, s.getStudentId());
                psStudent.executeUpdate();

                conn.commit();
                return true;
            } catch (SQLException ex) {
                conn.rollback();
                ex.printStackTrace();
            } finally {
                conn.setAutoCommit(true);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateMentor(int studentId, Integer mentorId) {
        String sql = "UPDATE students SET mentor_id = ? WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            if (mentorId != null && mentorId > 0) {
                ps.setInt(1, mentorId);
            } else {
                ps.setNull(1, java.sql.Types.INTEGER);
            }
            ps.setInt(2, studentId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateResumeDriveUrl(int studentId, String resumeDriveUrl) {
        String sql = "UPDATE students SET resume_drive_url = ? WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, resumeDriveUrl);
            ps.setInt(2, studentId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public List<AcademicRecord> getAcademicRecords(int studentId) {
        List<AcademicRecord> list = new ArrayList<>();
        String sql = "SELECT * FROM academic_records WHERE student_id = ? ORDER BY semester ASC";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    AcademicRecord rec = new AcademicRecord(
                            rs.getInt("id"),
                            rs.getInt("student_id"),
                            rs.getInt("semester"),
                            rs.getDouble("gpa"),
                            rs.getInt("credits"),
                            rs.getInt("total_subjects"),
                            rs.getInt("backlogs")
                    );
                    list.add(rec);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public boolean addOrUpdateAcademicRecord(AcademicRecord rec) {
        String checkSql = "SELECT id FROM academic_records WHERE student_id = ? AND semester = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement psCheck = conn.prepareStatement(checkSql)) {
            psCheck.setInt(1, rec.getStudentId());
            psCheck.setInt(2, rec.getSemester());
            try (ResultSet rs = psCheck.executeQuery()) {
                if (rs.next()) {
                    String updateSql = "UPDATE academic_records SET gpa = ?, credits = ?, total_subjects = ?, backlogs = ? WHERE id = ?";
                    try (PreparedStatement psUpdate = conn.prepareStatement(updateSql)) {
                        psUpdate.setDouble(1, rec.getGpa());
                        psUpdate.setInt(2, rec.getCredits());
                        psUpdate.setInt(3, rec.getTotalSubjects());
                        psUpdate.setInt(4, rec.getBacklogs());
                        psUpdate.setInt(5, rs.getInt("id"));
                        return psUpdate.executeUpdate() > 0;
                    }
                } else {
                    String insertSql = "INSERT INTO academic_records (student_id, semester, gpa, credits, total_subjects, backlogs) VALUES (?, ?, ?, ?, ?, ?)";
                    try (PreparedStatement psInsert = conn.prepareStatement(insertSql)) {
                        psInsert.setInt(1, rec.getStudentId());
                        psInsert.setInt(2, rec.getSemester());
                        psInsert.setDouble(3, rec.getGpa());
                        psInsert.setInt(4, rec.getCredits());
                        psInsert.setInt(5, rec.getTotalSubjects());
                        psInsert.setInt(6, rec.getBacklogs());
                        return psInsert.executeUpdate() > 0;
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private Student mapRowToStudent(ResultSet rs) throws SQLException {
        Student s = new Student(
                rs.getInt("user_id"),
                rs.getString("name"),
                rs.getString("email"),
                rs.getString("password_hash"),
                rs.getString("avatar_url"),
                rs.getTimestamp("created_at"),
                rs.getInt("id"),
                rs.getString("roll_number"),
                rs.getString("department"),
                rs.getInt("batch_year"),
                (Integer) rs.getObject("mentor_id"),
                rs.getDouble("cgpa"),
                rs.getInt("active_backlogs"),
                rs.getInt("history_of_backlogs"),
                rs.getString("leetcode_username"),
                rs.getString("resume_url"),
                rs.getString("skills")
        );
        s.setMentorName(rs.getString("mentor_name"));
        try {
            String reg = rs.getString("register_number");
            if (reg != null && !reg.isEmpty()) s.setRegisterNumber(reg);
        } catch (Exception ignored) {}
        try {
            s.setYearSemester(rs.getString("year_semester"));
        } catch (Exception ignored) {}
        try {
            s.setLeetcodeUrl(rs.getString("leetcode_url"));
        } catch (Exception ignored) {}
        try {
            s.setPhoneNumber(rs.getString("phone_number"));
        } catch (Exception ignored) {}
        try {
            s.setGender(rs.getString("gender"));
        } catch (Exception ignored) {}
        try {
            s.setDateOfBirth(rs.getString("date_of_birth"));
        } catch (Exception ignored) {}
        try {
            s.setTenthPercentage(rs.getString("tenth_percentage"));
        } catch (Exception ignored) {}
        try {
            s.setTwelfthPercentage(rs.getString("twelfth_percentage"));
        } catch (Exception ignored) {}
        try {
            s.setDiplomaPercentage(rs.getString("diploma_percentage"));
        } catch (Exception ignored) {}
        try {
            s.setUndergraduateGpa(rs.getString("undergraduate_gpa"));
        } catch (Exception ignored) {}
        try {
            s.setCollegeName(rs.getString("college_name"));
        } catch (Exception ignored) {}
        try {
            s.setCampus(rs.getString("campus"));
        } catch (Exception ignored) {}
        try {
            s.setDegree(rs.getString("degree"));
        } catch (Exception ignored) {}
        try {
            s.setResumeDriveUrl(rs.getString("resume_drive_url"));
        } catch (Exception ignored) {}
        try {
            s.setPlacementReadinessScore(rs.getInt("placement_readiness_score"));
        } catch (Exception ignored) {}
        return s;
    }
}
