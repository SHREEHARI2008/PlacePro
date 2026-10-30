-- ====================================================================
-- CAMPUS PLACEMENT MANAGEMENT SYSTEM (PLACEPRO) - COMPLETE MASTER SCHEMA
-- Database: campus_placement_db
-- Synchronized with all Java Models, DAOs, and Portal Controllers
-- ====================================================================

CREATE DATABASE IF NOT EXISTS campus_placement_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campus_placement_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS student_skill_booster_progress;
DROP TABLE IF EXISTS skill_booster_questions;
DROP TABLE IF EXISTS skill_booster_batches;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS student_assessments;
DROP TABLE IF EXISTS assessments;
DROP TABLE IF EXISTS mentor_feedback;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS company_drives;
DROP TABLE IF EXISTS leetcode_stats;
DROP TABLE IF EXISTS academic_records;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS mentors;
DROP TABLE IF EXISTS users;
DROP VIEW IF EXISTS drives;

SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================================
-- 1. USERS & ROLES TABLE
-- ====================================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'STUDENT' or 'MENTOR'
    avatar_url VARCHAR(500),
    phone_number VARCHAR(25) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ====================================================================
-- 2. MENTORS TABLE
-- ====================================================================
CREATE TABLE mentors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    mentor_staff_id VARCHAR(50) NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    cabin_location VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ====================================================================
-- 3. STUDENTS TABLE
-- ====================================================================
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    register_number VARCHAR(50) NULL,
    department VARCHAR(100) NOT NULL,
    year_semester VARCHAR(50) DEFAULT '3rd Year / Sem 6',
    batch_year INT NOT NULL,
    mentor_id INT NULL,
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
) ENGINE=InnoDB;

-- ====================================================================
-- 4. ACADEMIC RECORDS TABLE
-- ====================================================================
CREATE TABLE academic_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    semester INT NOT NULL,
    gpa DECIMAL(4,2) NOT NULL,
    credits INT NOT NULL,
    total_subjects INT NOT NULL,
    backlogs INT DEFAULT 0,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ====================================================================
-- 5. LEETCODE STATS TABLE
-- ====================================================================
CREATE TABLE leetcode_stats (
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
) ENGINE=InnoDB;

-- ====================================================================
-- 6. COMPANY DRIVES TABLE
-- ====================================================================
CREATE TABLE company_drives (
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
    posted_by_mentor_id INT NULL,
    status VARCHAR(20) DEFAULT 'UPCOMING',
    registration_url VARCHAR(500) NULL,
    gform_link VARCHAR(500) NULL,
    application_link VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by_mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Ensure view exists for drive queries
CREATE OR REPLACE VIEW drives AS SELECT * FROM company_drives;

-- ====================================================================
-- 7. APPLICATIONS TABLE
-- ====================================================================
CREATE TABLE applications (
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
) ENGINE=InnoDB;

-- ====================================================================
-- 8. MENTOR FEEDBACK TABLE
-- ====================================================================
CREATE TABLE mentor_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mentor_id INT NOT NULL,
    student_id INT NOT NULL,
    feedback_text TEXT NOT NULL,
    focus_area VARCHAR(100),
    rating INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ====================================================================
-- 9. ASSESSMENTS TABLE
-- ====================================================================
CREATE TABLE assessments (
    assessment_id INT AUTO_INCREMENT PRIMARY KEY,
    mentor_id INT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_dept VARCHAR(100) NOT NULL,
    test_link VARCHAR(500) NOT NULL,
    due_date DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ====================================================================
-- 10. STUDENT ASSESSMENTS TRACKING TABLE
-- ====================================================================
CREATE TABLE student_assessments (
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
) ENGINE=InnoDB;

-- ====================================================================
-- 11. NOTIFICATIONS TABLE
-- ====================================================================
CREATE TABLE notifications (
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
) ENGINE=InnoDB;

-- ====================================================================
-- 12. SKILL BOOSTER DAILY CHALLENGE BATCHES & QUESTIONS
-- ====================================================================
CREATE TABLE skill_booster_batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    updated_by_mentor_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by_mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE skill_booster_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id INT NOT NULL,
    question_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    problem_link VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_batch_qnum (batch_id, question_number),
    FOREIGN KEY (batch_id) REFERENCES skill_booster_batches(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE student_skill_booster_progress (
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
) ENGINE=InnoDB;

-- ====================================================================
-- 13. SEED DEFAULT PLACEMENT DRIVES
-- ====================================================================
INSERT INTO company_drives (
    company_name, logo_url, job_role, package_lpa, min_cgpa, max_backlogs_allowed,
    eligible_branches, required_skills, job_location, drive_date, application_deadline,
    description, status, registration_url, gform_link, application_link
) VALUES 
('Google', 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', 'Software Engineer - Campus Graduate', 34.50, 8.50, 0, 'CSE,IT', 'Data Structures,Algorithms,Java,C++,Distributed Systems,System Design', 'Bangalore / Hyderabad', '2026-11-15', '2026-11-05', 'Join Google Core Engineering team to build hyper-scale services used by billions. Rounds: Online Assessment -> Technical DSA Round 1 -> Technical System Design Round 2 -> Googliness & Leadership.', 'UPCOMING', 'https://forms.gle/google-campus-recruitment-2026', 'https://forms.gle/google-campus-recruitment-2026', 'https://forms.gle/google-campus-recruitment-2026'),
('Microsoft', 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg', 'Software Development Engineer (SDE)', 28.00, 8.00, 0, 'CSE,IT,ECE', 'C++,Java,Data Structures,Cloud Computing,Algorithms,OOP', 'Hyderabad / Noida', '2026-11-20', '2026-11-10', 'Empowering every person and organization on the planet to achieve more. Work on Azure Cloud, Microsoft 365, and AI Copilot foundations.', 'UPCOMING', 'https://forms.gle/microsoft-sde-graduates-2026', 'https://forms.gle/microsoft-sde-graduates-2026', 'https://forms.gle/microsoft-sde-graduates-2026'),
('Amazon', 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', 'SDE-1 (Full Time)', 26.50, 7.50, 0, 'CSE,IT,ECE,EEE', 'Java,Data Structures,OOP,Algorithms,AWS,SQL', 'Bangalore / Chennai / Hyderabad', '2026-11-28', '2026-11-18', 'Amazon is hiring customer-obsessed SDE-1 engineers. Assessment covers Debugging, Problem Solving, and Leadership Principles.', 'UPCOMING', 'https://forms.gle/amazon-campus-sde1-2026', 'https://forms.gle/amazon-campus-sde1-2026', 'https://forms.gle/amazon-campus-sde1-2026'),
('Cisco Systems', 'https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg', 'Network Software Engineer', 18.00, 7.00, 0, 'CSE,IT,ECE', 'C,Python,Networking,Linux,Operating Systems,DSA', 'Bangalore', '2026-12-05', '2026-11-25', 'Develop core networking stacks, SD-WAN controllers, and cloud telemetry systems.', 'UPCOMING', 'https://forms.gle/cisco-networking-eng-2026', 'https://forms.gle/cisco-networking-eng-2026', 'https://forms.gle/cisco-networking-eng-2026'),
('Zoho Corporation', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Zoho_Corporation_logo.svg/320px-Zoho_Corporation_logo.svg.png', 'Member Technical Staff (MTS)', 9.50, 6.50, 1, 'CSE,IT,ECE,EEE,MECH,AIDS', 'Java,C,Data Structures,Problem Solving,Web Applications', 'Chennai / Tenkasi', '2026-12-12', '2026-12-02', 'Build Made-in-India SaaS products for 100M+ global users. Rounds: Basic DSA -> Advanced App Design -> Tech Interview -> HR.', 'UPCOMING', 'https://forms.gle/zoho-mts-campus-hiring-2026', 'https://forms.gle/zoho-mts-campus-hiring-2026', 'https://forms.gle/zoho-mts-campus-hiring-2026');

-- ====================================================================
-- 14. SEED INITIAL SKILL BOOSTER BATCH
-- ====================================================================
INSERT INTO skill_booster_batches (id, updated_by_mentor_id, is_active) VALUES (1, NULL, TRUE);

INSERT INTO skill_booster_questions (batch_id, question_number, title, problem_link) VALUES
(1, 1, 'Two Sum & Pair Matching', 'https://leetcode.com/problems/two-sum/'),
(1, 2, 'Valid Parentheses & Bracket Matching', 'https://leetcode.com/problems/valid-parentheses/'),
(1, 3, 'Merge Intervals & Overlapping Spans', 'https://leetcode.com/problems/merge-intervals/'),
(1, 4, 'Lowest Common Ancestor of a Binary Tree', 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/'),
(1, 5, 'Longest Substring Without Repeating Characters', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/'),
(1, 6, 'Coin Change & Optimal Denomination (DP)', 'https://leetcode.com/problems/coin-change/');

SELECT 'PlacePro Master Database schema & initial seeds successfully initialized!' AS Status;
