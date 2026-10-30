package com.campus.placement.util;

import com.campus.placement.config.DBConnectionManager;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

public class DatabaseInitializer {

    public static void initializeDatabase() {
        System.out.println("Initializing MySQL database & tables...");
        try {
            // 1. Create database if not exists
            try (Connection rootConn = DBConnectionManager.getInstance().getRootConnection();
                 Statement stmt = rootConn.createStatement()) {
                stmt.executeUpdate("CREATE DATABASE IF NOT EXISTS campus_placement_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
            }

            // 2. Create clean tables if not exist
            try (Connection conn = DBConnectionManager.getInstance().getConnection();
                 Statement stmt = conn.createStatement()) {

                stmt.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS users (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        email VARCHAR(100) UNIQUE NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        role VARCHAR(20) NOT NULL,
                        avatar_url VARCHAR(255),
                        phone_number VARCHAR(25) NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """);

                stmt.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS mentors (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT UNIQUE NOT NULL,
                        mentor_staff_id VARCHAR(50) NULL,
                        department VARCHAR(100) NOT NULL,
                        designation VARCHAR(100) NOT NULL,
                        cabin_location VARCHAR(100),
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                    );
                """);

                stmt.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS students (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT UNIQUE NOT NULL,
                        roll_number VARCHAR(50) UNIQUE NOT NULL,
                        register_number VARCHAR(50) NULL,
                        department VARCHAR(100) NOT NULL,
                        year_semester VARCHAR(50) DEFAULT '3rd Year / Sem 6',
                        batch_year INT NOT NULL,
                        mentor_id INT,
                        cgpa DECIMAL(4,2) NOT NULL DEFAULT 0.00,
                        active_backlogs INT NOT NULL DEFAULT 0,
                        history_of_backlogs INT NOT NULL DEFAULT 0,
                        placement_readiness_score INT NOT NULL DEFAULT 0,
                        leetcode_username VARCHAR(100),
                        leetcode_url VARCHAR(255) NULL,
                        resume_url VARCHAR(255),
                        resume_drive_url VARCHAR(500) NULL,
                        profile_image VARCHAR(500) NULL,
                        avatar_url VARCHAR(500) NULL,
                        skills TEXT,
                        phone_number VARCHAR(25) NULL,
                        gender VARCHAR(20) DEFAULT 'Female',
                        date_of_birth VARCHAR(30) DEFAULT '30-12-2004',
                        tenth_percentage VARCHAR(20) DEFAULT '0',
                        twelfth_percentage VARCHAR(20) DEFAULT '0',
                        diploma_percentage VARCHAR(20) DEFAULT '0',
                        undergraduate_gpa VARCHAR(20) DEFAULT '0.00',
                        college_name VARCHAR(255) DEFAULT 'ABC College',
                        campus VARCHAR(100) DEFAULT 'ABC College',
                        degree VARCHAR(100) DEFAULT 'B.E CSE',
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                        FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
                    );
                """);

                stmt.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS academic_records (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        student_id INT NOT NULL,
                        semester INT NOT NULL,
                        gpa DECIMAL(4,2) NOT NULL,
                        credits INT NOT NULL,
                        total_subjects INT NOT NULL,
                        backlogs INT DEFAULT 0,
                        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
                    );
                """);

                stmt.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS leetcode_stats (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        student_id INT UNIQUE NOT NULL,
                        username VARCHAR(100) NOT NULL,
                        total_solved INT DEFAULT 0,
                        easy_solved INT DEFAULT 0,
                        medium_solved INT DEFAULT 0,
                        hard_solved INT DEFAULT 0,
                        acceptance_rate DECIMAL(5,2) DEFAULT 0.00,
                        global_ranking INT DEFAULT 0,
                        streak_days INT DEFAULT 0,
                        total_active_days INT DEFAULT 0,
                        submission_calendar MEDIUMTEXT NULL,
                        topic_stats TEXT,
                        last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
                    );
                """);

                stmt.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS company_drives (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        company_name VARCHAR(150) NOT NULL,
                        logo_url VARCHAR(255),
                        job_role VARCHAR(150) NOT NULL,
                        package_lpa DECIMAL(6,2) NOT NULL,
                        min_cgpa DECIMAL(4,2) NOT NULL DEFAULT 0.00,
                        max_backlogs_allowed INT DEFAULT 0,
                        eligible_branches TEXT NOT NULL,
                        required_skills TEXT NOT NULL,
                        job_location VARCHAR(100) NOT NULL,
                        drive_date DATE NOT NULL,
                        application_deadline DATE NOT NULL,
                        description TEXT,
                        posted_by_mentor_id INT,
                        status VARCHAR(20) DEFAULT 'UPCOMING',
                        registration_url VARCHAR(500) NULL,
                        gform_link VARCHAR(500) NULL,
                        application_link VARCHAR(500) NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (posted_by_mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
                    );
                """);

                stmt.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS applications (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        student_id INT NOT NULL,
                        drive_id INT NOT NULL,
                        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        status VARCHAR(30) DEFAULT 'APPLIED',
                        mentor_remarks TEXT,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        UNIQUE KEY unique_app (student_id, drive_id),
                        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                        FOREIGN KEY (drive_id) REFERENCES company_drives(id) ON DELETE CASCADE
                    );
                """);

                stmt.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS mentor_feedback (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        mentor_id INT NOT NULL,
                        student_id INT NOT NULL,
                        feedback_text TEXT NOT NULL,
                        focus_area VARCHAR(100),
                        rating INT DEFAULT 5,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE CASCADE,
                        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
                    );
                """);

                stmt.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS assessments (
                        assessment_id INT AUTO_INCREMENT PRIMARY KEY,
                        mentor_id INT,
                        title VARCHAR(200) NOT NULL,
                        description TEXT,
                        target_dept VARCHAR(100) NOT NULL,
                        test_link VARCHAR(500) NOT NULL,
                        due_date DATETIME NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
                    );
                """);

                stmt.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS student_assessments (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        assessment_id INT NOT NULL,
                        student_id INT NOT NULL,
                        status VARCHAR(30) DEFAULT 'ASSIGNED',
                        is_completed BOOLEAN DEFAULT FALSE,
                        score DECIMAL(5,2) NULL,
                        submitted_at TIMESTAMP NULL,
                        completed_at TIMESTAMP NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE KEY uk_assessment_student (assessment_id, student_id),
                        FOREIGN KEY (assessment_id) REFERENCES assessments(assessment_id) ON DELETE CASCADE,
                        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
                    );
                """);

                stmt.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS notifications (
                        notification_id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NULL,
                        student_id INT NULL,
                        category VARCHAR(100) NOT NULL,
                        type VARCHAR(100) NOT NULL,
                        title VARCHAR(150) NOT NULL,
                        message TEXT NOT NULL,
                        reference_id INT NULL,
                        is_read BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        INDEX idx_user_id (user_id),
                        INDEX idx_student_id (student_id),
                        INDEX idx_created_at (created_at)
                    );
                """);

                stmt.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS skill_booster_batches (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        updated_by_mentor_id INT NULL,
                        is_active BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (updated_by_mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
                    );
                """);

                stmt.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS skill_booster_questions (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        batch_id INT NOT NULL,
                        question_number INT NOT NULL,
                        title VARCHAR(255) NOT NULL,
                        problem_link VARCHAR(500) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE KEY uk_batch_qnum (batch_id, question_number),
                        FOREIGN KEY (batch_id) REFERENCES skill_booster_batches(id) ON DELETE CASCADE
                    );
                """);

                stmt.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS student_skill_booster_progress (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        student_id INT NOT NULL,
                        batch_id INT NOT NULL,
                        question_number INT NOT NULL,
                        is_completed BOOLEAN DEFAULT FALSE,
                        completed_at TIMESTAMP NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE KEY uk_student_batch_qnum (student_id, batch_id, question_number),
                        INDEX idx_student_batch (student_id, batch_id),
                        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                        FOREIGN KEY (batch_id) REFERENCES skill_booster_batches(id) ON DELETE CASCADE
                    );
                """);

                // Ensure drives view exists for SQL compatibility
                try {
                    stmt.executeUpdate("CREATE OR REPLACE VIEW drives AS SELECT * FROM company_drives;");
                } catch (Exception ignored) {}

                // 3. Ensure required columns exist across active database
                addColumnIfNotExists(conn, "users", "phone_number", "VARCHAR(25) NULL");
                addColumnIfNotExists(conn, "mentors", "mentor_staff_id", "VARCHAR(50) NULL");
                addColumnIfNotExists(conn, "students", "register_number", "VARCHAR(50) NULL");
                addColumnIfNotExists(conn, "students", "year_semester", "VARCHAR(50) DEFAULT '3rd Year / Sem 6'");
                addColumnIfNotExists(conn, "students", "placement_readiness_score", "INT NOT NULL DEFAULT 0");
                addColumnIfNotExists(conn, "students", "profile_image", "VARCHAR(500) NULL");
                addColumnIfNotExists(conn, "students", "avatar_url", "VARCHAR(500) NULL");
                addColumnIfNotExists(conn, "students", "leetcode_url", "VARCHAR(255) NULL");
                addColumnIfNotExists(conn, "students", "phone_number", "VARCHAR(25) NULL");
                addColumnIfNotExists(conn, "students", "gender", "VARCHAR(20) DEFAULT 'Female'");
                addColumnIfNotExists(conn, "students", "date_of_birth", "VARCHAR(30) DEFAULT '30-12-2004'");
                addColumnIfNotExists(conn, "students", "tenth_percentage", "VARCHAR(20) DEFAULT '0'");
                addColumnIfNotExists(conn, "students", "twelfth_percentage", "VARCHAR(20) DEFAULT '0'");
                addColumnIfNotExists(conn, "students", "diploma_percentage", "VARCHAR(20) DEFAULT '0'");
                addColumnIfNotExists(conn, "students", "undergraduate_gpa", "VARCHAR(20) DEFAULT '0.00'");
                addColumnIfNotExists(conn, "students", "college_name", "VARCHAR(255) DEFAULT 'ABC College'");
                addColumnIfNotExists(conn, "students", "campus", "VARCHAR(100) DEFAULT 'ABC College'");
                addColumnIfNotExists(conn, "students", "degree", "VARCHAR(100) DEFAULT 'B.E CSE'");
                addColumnIfNotExists(conn, "students", "resume_drive_url", "VARCHAR(500) NULL");
                dropColumnIfExists(conn, "students", "verified_technical_skills");

                addColumnIfNotExists(conn, "leetcode_stats", "total_active_days", "INT DEFAULT 0");
                addColumnIfNotExists(conn, "leetcode_stats", "submission_calendar", "MEDIUMTEXT NULL");
                addColumnIfNotExists(conn, "company_drives", "registration_url", "VARCHAR(500) NULL");
                addColumnIfNotExists(conn, "company_drives", "gform_link", "VARCHAR(500) NULL");
                addColumnIfNotExists(conn, "company_drives", "application_link", "VARCHAR(500) NULL");

                addColumnIfNotExists(conn, "student_assessments", "is_completed", "BOOLEAN DEFAULT FALSE");
                addColumnIfNotExists(conn, "student_assessments", "completed_at", "TIMESTAMP NULL");

                addColumnIfNotExists(conn, "notifications", "student_id", "INT NULL");
                addColumnIfNotExists(conn, "notifications", "type", "VARCHAR(100) NULL");

                // 4. Completely eliminate demo/mock accounts from DB
                stmt.executeUpdate("DELETE FROM users WHERE email IN ('student.demo@placepro.edu', 'mentor.demo@placepro.edu', 'student@campus.edu', 'mentor@campus.edu', 'meera.mentor@campus.edu', 'ananya@campus.edu', 'rohan@campus.edu', 'sneha@campus.edu', 'vikram@campus.edu');");

                // 5. Seed Placement Drives if none exist (so visiting drives are available for real students to view/apply)
                ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM company_drives");
                if (rs.next() && rs.getInt(1) == 0) {
                    seedCompanyDrives(conn);
                }

                // 6. Seed Skill Booster batch if none exists
                ResultSet rsBooster = stmt.executeQuery("SELECT COUNT(*) FROM skill_booster_batches");
                if (rsBooster.next() && rsBooster.getInt(1) == 0) {
                    seedSkillBoosterBatches(conn);
                }
            }

            System.out.println("Database initialization completed successfully. No demo credentials present.");
        } catch (Exception e) {
            System.err.println("Error initializing database: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static void resetDatabase() {
        try (Connection conn = DBConnectionManager.getInstance().getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.executeUpdate("SET FOREIGN_KEY_CHECKS = 0;");
            stmt.executeUpdate("TRUNCATE TABLE applications;");
            stmt.executeUpdate("TRUNCATE TABLE mentor_feedback;");
            stmt.executeUpdate("TRUNCATE TABLE leetcode_stats;");
            stmt.executeUpdate("TRUNCATE TABLE academic_records;");
            stmt.executeUpdate("TRUNCATE TABLE students;");
            stmt.executeUpdate("TRUNCATE TABLE mentors;");
            stmt.executeUpdate("TRUNCATE TABLE users;");
            try { stmt.executeUpdate("TRUNCATE TABLE student_assessments;"); } catch (Exception ignored) {}
            try { stmt.executeUpdate("TRUNCATE TABLE assessments;"); } catch (Exception ignored) {}
            try { stmt.executeUpdate("TRUNCATE TABLE student_skill_booster_progress;"); } catch (Exception ignored) {}
            try { stmt.executeUpdate("TRUNCATE TABLE skill_booster_questions;"); } catch (Exception ignored) {}
            try { stmt.executeUpdate("TRUNCATE TABLE skill_booster_batches;"); } catch (Exception ignored) {}
            try { stmt.executeUpdate("TRUNCATE TABLE notifications;"); } catch (Exception ignored) {}
            stmt.executeUpdate("SET FOREIGN_KEY_CHECKS = 1;");
            System.out.println("PlacePro Database successfully reset to clean state (all student and mentor records truncated).");
        } catch (Exception e) {
            System.err.println("Database reset notice: " + e.getMessage());
        }
    }

    private static void seedCompanyDrives(Connection conn) throws Exception {
        String sql = """
            INSERT INTO company_drives (
                company_name, logo_url, job_role, package_lpa, min_cgpa, max_backlogs_allowed,
                eligible_branches, required_skills, job_location, drive_date, application_deadline, description, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            // 1. Google
            ps.setString(1, "Google");
            ps.setString(2, "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg");
            ps.setString(3, "Software Engineer - Campus Graduate");
            ps.setDouble(4, 34.50);
            ps.setDouble(5, 8.50);
            ps.setInt(6, 0);
            ps.setString(7, "CSE,IT");
            ps.setString(8, "Data Structures,Algorithms,Java,C++,Distributed Systems,System Design");
            ps.setString(9, "Bangalore / Hyderabad");
            ps.setDate(10, java.sql.Date.valueOf("2026-11-15"));
            ps.setDate(11, java.sql.Date.valueOf("2026-11-05"));
            ps.setString(12, "Join Google's Core Engineering team to build hyper-scale services used by billions. Rounds: Online Assessment -> Technical DSA Round 1 -> Technical System Design Round 2 -> Googliness & Leadership.");
            ps.setString(13, "UPCOMING");
            ps.executeUpdate();

            // 2. Microsoft
            ps.setString(1, "Microsoft");
            ps.setString(2, "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg");
            ps.setString(3, "Software Development Engineer (SDE)");
            ps.setDouble(4, 28.00);
            ps.setDouble(5, 8.00);
            ps.setInt(6, 0);
            ps.setString(7, "CSE,IT,ECE");
            ps.setString(8, "C++,Java,Data Structures,Cloud Computing,Algorithms,OOP");
            ps.setString(9, "Hyderabad / Noida");
            ps.setDate(10, java.sql.Date.valueOf("2026-11-20"));
            ps.setDate(11, java.sql.Date.valueOf("2026-11-10"));
            ps.setString(12, "Empowering every person and organization on the planet to achieve more. Work on Azure Cloud, Microsoft 365, and AI Copilot foundations.");
            ps.setString(13, "UPCOMING");
            ps.executeUpdate();

            // 3. Amazon
            ps.setString(1, "Amazon");
            ps.setString(2, "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg");
            ps.setString(3, "SDE-1 (Full Time)");
            ps.setDouble(4, 26.50);
            ps.setDouble(5, 7.50);
            ps.setInt(6, 0);
            ps.setString(7, "CSE,IT,ECE,EEE");
            ps.setString(8, "Java,Data Structures,OOP,Algorithms,AWS,SQL");
            ps.setString(9, "Bangalore / Chennai / Hyderabad");
            ps.setDate(10, java.sql.Date.valueOf("2026-11-28"));
            ps.setDate(11, java.sql.Date.valueOf("2026-11-18"));
            ps.setString(12, "Amazon is hiring customer-obsessed SDE-1 engineers. Assessment covers Debugging, Problem Solving, and Leadership Principles.");
            ps.setString(13, "UPCOMING");
            ps.executeUpdate();

            // 4. Cisco Systems
            ps.setString(1, "Cisco Systems");
            ps.setString(2, "https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg");
            ps.setString(3, "Network Software Engineer");
            ps.setDouble(4, 18.00);
            ps.setDouble(5, 7.00);
            ps.setInt(6, 0);
            ps.setString(7, "CSE,IT,ECE");
            ps.setString(8, "C,Python,Networking,Linux,Operating Systems,DSA");
            ps.setString(9, "Bangalore");
            ps.setDate(10, java.sql.Date.valueOf("2026-12-05"));
            ps.setDate(11, java.sql.Date.valueOf("2026-11-25"));
            ps.setString(12, "Develop core networking stacks, SD-WAN controllers, and cloud telemetry systems.");
            ps.setString(13, "UPCOMING");
            ps.executeUpdate();

            // 5. Zoho Corporation
            ps.setString(1, "Zoho Corporation");
            ps.setString(2, "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Zoho_Corporation_logo.svg/320px-Zoho_Corporation_logo.svg.png");
            ps.setString(3, "Member Technical Staff (MTS)");
            ps.setDouble(4, 9.50);
            ps.setDouble(5, 6.50);
            ps.setInt(6, 1);
            ps.setString(7, "CSE,IT,ECE,EEE,MECH,AIDS");
            ps.setString(8, "Java,C,Data Structures,Problem Solving,Web Applications");
            ps.setString(9, "Chennai / Tenkasi");
            ps.setDate(10, java.sql.Date.valueOf("2026-12-12"));
            ps.setDate(11, java.sql.Date.valueOf("2026-12-02"));
            ps.setString(12, "Build Made-in-India SaaS products for 100M+ global users. Rounds: Basic DSA -> Advanced App Design -> Tech Interview -> HR.");
            ps.setString(13, "UPCOMING");
            ps.executeUpdate();
        }
    }

    private static void addColumnIfNotExists(Connection conn, String table, String column, String definition) {
        try {
            String checkSql = "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?";
            try (PreparedStatement ps = conn.prepareStatement(checkSql)) {
                ps.setString(1, table);
                ps.setString(2, column);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next() && rs.getInt(1) == 0) {
                        try (Statement alterStmt = conn.createStatement()) {
                            alterStmt.executeUpdate("ALTER TABLE " + table + " ADD COLUMN " + column + " " + definition);
                            System.out.println("Added column " + column + " to table " + table);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Column check for " + table + "." + column + ": " + e.getMessage());
        }
    }

    private static void dropColumnIfExists(Connection conn, String table, String column) {
        try {
            String checkSql = "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?";
            try (PreparedStatement ps = conn.prepareStatement(checkSql)) {
                ps.setString(1, table);
                ps.setString(2, column);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next() && rs.getInt(1) > 0) {
                        try (Statement alterStmt = conn.createStatement()) {
                            alterStmt.executeUpdate("ALTER TABLE " + table + " DROP COLUMN " + column);
                            System.out.println("Dropped legacy column " + column + " from table " + table);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Drop column check for " + table + "." + column + ": " + e.getMessage());
        }
    }

    private static void seedSkillBoosterBatches(Connection conn) {
        try {
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
                    ps.setNull(1, java.sql.Types.INTEGER);
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
        } catch (Exception e) {
            System.err.println("Notice: Could not seed default Skill Booster batch: " + e.getMessage());
        }
    }
}
