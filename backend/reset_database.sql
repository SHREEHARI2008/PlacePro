-- ====================================================================
-- PLACEPRO DATABASE RESET SCRIPT
-- Database: campus_placement_db
-- Target: Clean state (truncates all student, mentor, application, and tracking records)
-- ====================================================================

USE campus_placement_db;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE student_skill_booster_progress;
TRUNCATE TABLE skill_booster_questions;
TRUNCATE TABLE skill_booster_batches;
TRUNCATE TABLE notifications;
TRUNCATE TABLE student_assessments;
TRUNCATE TABLE assessments;
TRUNCATE TABLE mentor_feedback;
TRUNCATE TABLE applications;
TRUNCATE TABLE company_drives;
TRUNCATE TABLE leetcode_stats;
TRUNCATE TABLE academic_records;
TRUNCATE TABLE students;
TRUNCATE TABLE mentors;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- Re-seed default placement drives so students immediately have drives to explore
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

-- Re-seed default Skill Booster challenge batch
INSERT INTO skill_booster_batches (id, updated_by_mentor_id, is_active) VALUES (1, NULL, TRUE);

INSERT INTO skill_booster_questions (batch_id, question_number, title, problem_link) VALUES
(1, 1, 'Two Sum & Pair Matching', 'https://leetcode.com/problems/two-sum/'),
(1, 2, 'Valid Parentheses & Bracket Matching', 'https://leetcode.com/problems/valid-parentheses/'),
(1, 3, 'Merge Intervals & Overlapping Spans', 'https://leetcode.com/problems/merge-intervals/'),
(1, 4, 'Lowest Common Ancestor of a Binary Tree', 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/'),
(1, 5, 'Longest Substring Without Repeating Characters', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/'),
(1, 6, 'Coin Change & Optimal Denomination (DP)', 'https://leetcode.com/problems/coin-change/');

SELECT 'PlacePro Database successfully reset to clean state!' AS Status;
