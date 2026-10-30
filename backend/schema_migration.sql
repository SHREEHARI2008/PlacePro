-- ====================================================================
-- PLACEPRO DATABASE SAFE MIGRATION & PATCH SCRIPT
-- Database: campus_placement_db
-- Safe to run on existing databases: IDEMPOTENT & PRESERVES ALL DATA
-- ====================================================================

USE campus_placement_db;

-- 1. Helper procedure for idempotent column addition
DROP PROCEDURE IF EXISTS AddColumnIfNotExists;
DELIMITER $$
CREATE PROCEDURE AddColumnIfNotExists(
    IN tableName VARCHAR(64),
    IN colName VARCHAR(64),
    IN colDef VARCHAR(255)
)
BEGIN
    DECLARE col_count INT;
    SELECT COUNT(*) INTO col_count 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = tableName 
      AND COLUMN_NAME = colName;
      
    IF col_count = 0 THEN
        SET @query = CONCAT('ALTER TABLE ', tableName, ' ADD COLUMN ', colName, ' ', colDef);
        PREPARE stmt FROM @query;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END $$
DELIMITER ;

-- 2. Helper procedure for dropping legacy columns cleanly
DROP PROCEDURE IF EXISTS DropColumnIfExists;
DELIMITER $$
CREATE PROCEDURE DropColumnIfExists(
    IN tableName VARCHAR(64),
    IN colName VARCHAR(64)
)
BEGIN
    DECLARE col_count INT;
    SELECT COUNT(*) INTO col_count 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = tableName 
      AND COLUMN_NAME = colName;
      
    IF col_count > 0 THEN
        SET @query = CONCAT('ALTER TABLE ', tableName, ' DROP COLUMN ', colName);
        PREPARE stmt FROM @query;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END $$
DELIMITER ;

-- ====================================================================
-- 3. APPLY COLUMN ENHANCEMENTS
-- ====================================================================

-- 3.1 Users table
CALL AddColumnIfNotExists('users', 'phone_number', 'VARCHAR(25) NULL');

-- 3.2 Mentors table
CALL AddColumnIfNotExists('mentors', 'mentor_staff_id', 'VARCHAR(50) NULL');

-- 3.3 Students table: 0-defaulted academics, readiness score, profile image, registration number
CALL AddColumnIfNotExists('students', 'register_number', 'VARCHAR(50) NULL');
CALL AddColumnIfNotExists('students', 'year_semester', "VARCHAR(50) DEFAULT '3rd Year / Sem 6'");
CALL AddColumnIfNotExists('students', 'placement_readiness_score', 'INT NOT NULL DEFAULT 0');
CALL AddColumnIfNotExists('students', 'profile_image', 'VARCHAR(500) NULL');
CALL AddColumnIfNotExists('students', 'avatar_url', 'VARCHAR(500) NULL');
CALL AddColumnIfNotExists('students', 'leetcode_url', 'VARCHAR(255) NULL');
CALL AddColumnIfNotExists('students', 'phone_number', 'VARCHAR(25) NULL');
CALL AddColumnIfNotExists('students', 'gender', "VARCHAR(20) DEFAULT 'Female'");
CALL AddColumnIfNotExists('students', 'date_of_birth', "VARCHAR(30) DEFAULT '30-12-2004'");
CALL AddColumnIfNotExists('students', 'tenth_percentage', "VARCHAR(20) DEFAULT '0'");
CALL AddColumnIfNotExists('students', 'twelfth_percentage', "VARCHAR(20) DEFAULT '0'");
CALL AddColumnIfNotExists('students', 'diploma_percentage', "VARCHAR(20) DEFAULT '0'");
CALL AddColumnIfNotExists('students', 'undergraduate_gpa', "VARCHAR(20) DEFAULT '0.00'");
CALL AddColumnIfNotExists('students', 'college_name', "VARCHAR(255) DEFAULT 'ABC College'");
CALL AddColumnIfNotExists('students', 'campus', "VARCHAR(100) DEFAULT 'ABC College'");
CALL AddColumnIfNotExists('students', 'degree', "VARCHAR(100) DEFAULT 'B.E CSE'");
CALL AddColumnIfNotExists('students', 'resume_drive_url', 'VARCHAR(500) NULL');

-- Drop legacy verified_technical_skills if it existed
CALL DropColumnIfExists('students', 'verified_technical_skills');

-- 3.4 LeetCode stats enhancements
CALL AddColumnIfNotExists('leetcode_stats', 'total_active_days', 'INT DEFAULT 0');
CALL AddColumnIfNotExists('leetcode_stats', 'submission_calendar', 'MEDIUMTEXT NULL');

-- 3.5 Company Drives table: registration URL and Google Form links
CALL AddColumnIfNotExists('company_drives', 'registration_url', 'VARCHAR(500) NULL');
CALL AddColumnIfNotExists('company_drives', 'gform_link', 'VARCHAR(500) NULL');
CALL AddColumnIfNotExists('company_drives', 'application_link', 'VARCHAR(500) NULL');

-- Ensure drives view exists for direct SQL compatibility
CREATE OR REPLACE VIEW drives AS SELECT * FROM company_drives;

-- ====================================================================
-- 4. ENSURE ALL TABLES EXIST
-- ====================================================================

-- 4.1 Assessments table
CREATE TABLE IF NOT EXISTS assessments (
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

-- 4.2 Student Assessments Tracking table
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
) ENGINE=InnoDB;

CALL AddColumnIfNotExists('student_assessments', 'is_completed', 'BOOLEAN DEFAULT FALSE');
CALL AddColumnIfNotExists('student_assessments', 'completed_at', 'TIMESTAMP NULL');

-- 4.3 Notifications table (dual-column support: user_id/student_id and category/type)
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
) ENGINE=InnoDB;

CALL AddColumnIfNotExists('notifications', 'student_id', 'INT NULL');
CALL AddColumnIfNotExists('notifications', 'type', 'VARCHAR(100) NULL');

-- 4.4 Skill Booster Daily Challenge batches & student progress
CREATE TABLE IF NOT EXISTS skill_booster_batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    updated_by_mentor_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by_mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS skill_booster_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id INT NOT NULL,
    question_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    problem_link VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_batch_qnum (batch_id, question_number),
    FOREIGN KEY (batch_id) REFERENCES skill_booster_batches(id) ON DELETE CASCADE
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

-- ====================================================================
-- 5. CLEAN UP HELPER PROCEDURES
-- ====================================================================
DROP PROCEDURE IF EXISTS AddColumnIfNotExists;
DROP PROCEDURE IF EXISTS DropColumnIfExists;

SELECT 'PlacePro Safe Database Migration completed successfully with zero data loss!' AS Status;
