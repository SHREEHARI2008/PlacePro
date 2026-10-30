# 🎓 PlacePro — Campus Placement Management & Skill Growth Portal

An enterprise-grade, full-stack placement management and readiness ecosystem designed to streamline campus recruitment. PlacePro connects **Students** and **Faculty Mentors** to track live coding performance, analyze semester-wise academic progression, evaluate real-time company drive eligibility, coordinate assessments, and deliver mentor guidance.

---

## 📌 Table of Contents
1. [Platform Overview & Architecture](#-platform-overview--architecture)
2. [Technology Stack](#-technology-stack)
3. [Student Portal Features](#-student-portal-features)
4. [Mentor Portal Features](#-mentor-portal-features)
5. [Database Schema & Architecture](#-database-schema--architecture)
6. [Local Installation & Setup Guide](#-local-installation--setup-guide)
7. [API Endpoints Summary](#-api-endpoints-summary)
8. [Security & Authentication](#-security--authentication)

---

## 🏛️ Platform Overview & Architecture

PlacePro bridges the communication and data gap between graduating students and institutional placement cells / faculty mentors:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PlacePro Architecture                         │
└────────────────────────────────────────────────────────────────────────┘

     ┌───────────────────────┐              ┌───────────────────────┐
     │    Student Portal     │              │     Mentor Portal     │
     │  (React 18 / Tailwind)│              │ (React 18 / Tailwind) │
     └──────────┬────────────┘              └───────────┬───────────┘
                │                                       │
                │        REST API Calls (Bearer Token)  │
                ▼                                       ▼
     ┌──────────────────────────────────────────────────────────────┐
     │                 Vite Reverse Proxy (/api)                    │
     └──────────────────────────────┬───────────────────────────────┘
                                    │
                                    ▼
     ┌──────────────────────────────────────────────────────────────┐
     │               Java 21 REST HTTP Server (:8080)               │
     │  ┌────────────────────┬──────────────────────────────────┐   │
     │  │ Session & Security │ BCrypt Hashing, Role Guards      │   │
     │  ├────────────────────┼──────────────────────────────────┤   │
     │  │ EligibilityEngine  │ Bidirectional Canonical Matcher  │   │
     │  ├────────────────────┼──────────────────────────────────┤   │
     │  │ LeetCode Sync Svc  │ GraphQL Live Tracker             │   │
     │  ├────────────────────┼──────────────────────────────────┤   │
     │  │ Notification Svc   │ Real-time Event Broadcaster      │   │
     │  └────────────────────┴──────────────────────────────────┘   │
     └──────────────────────────────┬───────────────────────────────┘
                                    │ JDBC Connection Pool
                                    ▼
     ┌──────────────────────────────────────────────────────────────┐
     │               MySQL 8.0 Database Storage                     │
     │  - Users & Roles          - Academic Records                 │
     │  - Students & Mentors     - LeetCode Statistics              │
     │  - Company Drives & Apps  - Assessments & Student Progress   │
     │  - Notifications          - Skill Booster Batches & Questions│
     └──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Backend
- **Language & Runtime**: Java 21 (Standard Edition)
- **HTTP Server**: Built-in high-performance `com.sun.net.httpserver.HttpServer` running on port `8080`
- **Database Connectivity**: JDBC (`mysql-connector-j-8.3.0.jar`) with connection pooling and parameterized prepared statements
- **JSON Serialization**: Google Gson (`gson-2.10.1.jar`) with dual field serialization (`eligible` & `isEligible`)
- **Security & Cryptography**: BCrypt password hashing (`jbcrypt-0.4.jar`) and token-based enterprise session management
- **External API Integrations**: LeetCode Official GraphQL API (`https://leetcode.com/graphql`) for real-time problem submissions and streak tracking

### Frontend
- **Framework & Tooling**: React 18, Vite 5 (`@vitejs/plugin-react`), ES Modules
- **Routing**: React Router DOM v7 with client-side role guarding
- **Styling**: Tailwind CSS v3 with responsive utility classes
- **Icons**: Lucide React (`lucide-react`)
- **Data Visualization**: Recharts (Interactive Donut Difficulty Breakdown & GPA Progression Area Charts)
- **HTTP Client**: Axios with automatic request token attachment and 401/403 interceptors

### Database
- **Database Engine**: MySQL Server 8.0+ (`campus_placement_db`)
- **Schema Management**: Automated table verification and programmatic migration via `DatabaseInitializer.java`

---

## 👨‍🎓 Student Portal Features

### 1. Dashboard & LeetCode Live Analytics
- **Live LeetCode Sync**: Background and on-demand synchronization with LeetCode's public GraphQL endpoint.
- **Problem Breakdown Donut**: Circular chart categorized by **Easy (Teal)**, **Medium (Amber)**, and **Hard (Rose)**.
- **Maximum Streak Display**: Displays the student's verified **Maximum Streak** (`maxStreak`) and total active problem-solving history, maintaining a clean focus on peak milestones without volatile active streak counters.
- **Corrected Global Ranking**: Formatted real-time global rank representation.
- **Live Search Box**: Instant search widget allowing students to preview and verify any LeetCode handle directly on page.
- **Daily Solving Notifications**: Clean daily problem-solving reminder banners prompting students to practice coding today without mentioning active streak counts or streak day numbers.

### 2. Academic & Profile Management
- **Zero-Initialized Standing**: On student registration, academic figures (`cgpa`, `activeBacklogs`, percentages) initialize cleanly to `0` / `0.00` rather than dummy placeholder values.
- **Interactive Semester Logger**: Semester-by-semester GPA entry modal with automatic cumulative CGPA re-computation and real-time database persistence.
- **Profile Customization**: Full avatar support (with robust fallback), university register number, degree, department, batch year, and resume drive link storage.
- **Cleaned-Up Architecture**: Complete removal of legacy "Verified Technical Skills" dependencies in favor of actual academic records and coding metrics.

### 3. Smart Placement Drives & Eligibility Engine (`EligibilityEngine.java`)
- **Automated Verification**: Dynamic evaluation based on:
  - Minimum CGPA cutoff
  - Maximum active backlogs/arrears allowed
  - 10th and 12th minimum percentage thresholds (≥ 60%)
  - **Bidirectional Department/Branch Matching**: Canonical normalization (`CSE`, `IT`, `ECE`, `EEE`, `MECH`, `AIDS`, `CIVIL`, `ALL`) allowing seamless matching whether the company post says `"Computer Science"`, `"CSE"`, or `"All Branches"`.
- **Unmet Criteria Breakdown**: Ineligible drives do not just show a generic badge; they display an alert box detailing the exact failure metric (e.g., `Minimum CGPA required: 8.50 (Your CGPA: 7.20)` or `Active backlogs exceed allowed limit: 2 active (Allowed: 0)`).
- **Empty Reasons on Pass**: When all criteria are satisfied, the unmet failure reasons list is completely empty, rendering a clean green `"Eligible to Apply"` badge.
- **Direct Google Form (`gform`) Links**: For drives utilizing off-portal forms, direct Google Form links (`registration_url`) unlock and render on eligible drive cards.
- **One-Click Portal Applications**: Unlocked `"Apply on Portal"` button with immediate database persistence in `applications`.

### 4. Daily Skill Booster (Mentor-Driven 6-Question Challenge)
- **Daily 6-Question Module**: A curated set of 6 coding and aptitude questions updated by faculty mentors.
- **Real-Time Module Progress Bar**: Prominently displayed header progress tracker showing `X / 6 Completed` and overall percentage completion.
- **Dynamic Checkboxes**: Per-question completion checkboxes that automatically persist to `student_skill_booster_progress`.
- **Automatic Batch Reset**: Whenever a mentor updates or publishes a new batch of 6 questions, student progress cleanly resets for the new challenge.

### 5. Assessments & Multi-Language Open IDE
- **Dynamic Assessment List**: Department-specific technical tests posted by mentors.
- **Synchronized Completion**: Ticking the **"Completed"** checkbox syncs status (`COMPLETED`) directly to the mentor's candidate view and dynamically hides the *"Take Assessment"* button.
- **Streamlined UI**: Legacy badge clutter and super-badges have been removed for an enterprise interface.
- **Open IDE / Online Compiler**: Language selector modal allowing students to select their preferred programming language (Python, Java, C++, C, JavaScript, SQL) and launch Programiz online compilers in a single click.

### 6. Real-Time Notification Center
- Dedicated bell notification dropdown in the top navigation bar with polling and unread counter badges.
- Categorized alert feeds:
  1. 💬 **Mentor's Feedback (`MENTOR_FEEDBACK`)**: Direct guidance and focus-area recommendations from the assigned mentor.
  2. 🏢 **Placement Drive Updations (`DRIVE_UPDATE`)**: Announcements of new recruitment drives or modified CTC/eligibility criteria.
  3. 🎯 **Application Status Changes (`DRIVE_STATUS`)**: Real-time hiring stage transitions (`APPLIED` → `SHORTLISTED` → `SELECTED` / `REJECTED`).

---

## 👨‍🏫 Mentor Portal & Permission Architecture

PlacePro implements an enterprise **Shared Drives + Mentor-Scoped Mentee Permission Architecture**:

### 1. Shared Global Access to All Placement Drives (All Mentors ↔ All Drives)
- **Universal Drive Management**: Every logged-in faculty mentor can view, access, create, edit, and manage **all placement drives** in the system, regardless of which faculty member originally posted the drive.
- **No Ownership Locks on Drives**: Endpoints (`GET /api/companies`, `POST /api/companies`, `PUT /api/companies`) have no restrictive `WHERE posted_by_mentor_id = ?` filters, ensuring full collaborative placement coordination across departments.
- **Universal Student Visibility**: Every student sees all active placement drives across the platform, with personalized eligibility evaluation and direct Google Form (`gform_link` / `registration_url`) action links.
- **Instant Student Broadcast Alerts**: Whenever any mentor publishes a new placement drive or edits an existing drive's package/deadlines, an automated broadcast notification with category `Placement Drive Updation` is instantly delivered to all student portals.

### 2. Scoped Mentee Placement Tracking (Respective Mentor Only)
- **Strictly Scoped Mentee Supervision**: While placement drives are shared globally, **student candidate records and application tracking remain strictly scoped to each student's assigned mentor** (`student.mentor_id = loggedInMentor.id`).
- **Manage Candidates Scoping**: When any mentor opens **Manage Candidates** for a shared placement drive (`GET /api/applications?driveId=X`), the system automatically queries `WHERE a.drive_id = ? AND s.mentor_id = ?`. Mentors only see applications submitted by **their own assigned mentees**.
- **Role-Based Status Updating**: Mentors can view and update hiring statuses (`APPLIED`, `SHORTLISTED`, `TECHNICAL_ROUND`, `HR_ROUND`, `SELECTED`, `REJECTED`) and provide feedback **only** for their own assigned mentees. Any attempt to modify candidate records belonging to another mentor's mentee is blocked at the backend with `HTTP 403 Forbidden`.
- **Dossier Inspection Isolation**: Mentee inspection endpoints (`GET /api/student/dashboard?studentId=X` and `GET /api/student/profile?studentId=X`) enforce mentor ownership guards, preventing cross-mentor snooping into non-assigned students' CGPA, arrears, or detailed placement histories.

### 3. Mentee Inspection View (`Inspect` Button)
- Clicking the **"Inspect"** button on any assigned mentee in **Live Mentee Tracking** opens a comprehensive candidate dossier modal:
  - Interactive LeetCode difficulty breakdown chart
  - Cumulative CGPA and semester GPA trend history
  - Dynamic **Placement Readiness Score** (0–100%)
  - Completed vs. pending technical assessments
  - Applied placement drives and current application status
  - **Direct Feedback Submission**: Form to transmit guidance notes, focus areas, and star ratings directly to the mentee's portal (secured against cross-mentor feedback submissions).

### 4. Global Skill Booster Publisher
- Dedicated management interface where any mentor can author and publish the daily 6 Skill Booster questions:
  - Question titles and direct problem URLs
  - Instant synchronization: Publishing a new batch deactivates the prior batch and immediately refreshes the challenge across all student portals.

### 5. Streamlined Supervisory Hub
- Cleaned-up dashboard focusing strictly on high-impact supervisory metrics:
  - Total Assigned Mentees
  - Batch Average CGPA
  - Placement Drive Pipeline (with quick **Edit Drive** and **Manage Mentees** actions on every active drive)
  - Total LeetCode Problems Solved by Mentees

---

## 🗄️ Database Schema & Architecture

The database is powered by **MySQL 8.0** under the database name `campus_placement_db`.

### Entity-Relationship Diagram Summary

```
 users (id) ──┬──< mentors (user_id) ──┬──< students (mentor_id)
              │                        │
              └──< students (user_id)  ├──< company_drives (posted_by_mentor_id)
                                       ├──< assessments (mentor_id)
                                       ├──< mentor_feedback (mentor_id)
                                       └──< skill_booster_batches (updated_by_mentor_id)

 students (id) ──┬──< academic_records (student_id)
                 ├──< leetcode_stats (student_id)
                 ├──< applications (student_id) >── company_drives (id)
                 ├──< student_assessments (student_id) >── assessments (assessment_id)
                 └──< student_skill_booster_progress (student_id) >── skill_booster_batches (id)
```

### Table Definitions

| Table Name | Primary Key | Description & Key Columns |
| :--- | :--- | :--- |
| `users` | `id` | Core credentials: `name`, `email` (UNIQUE), `password_hash` (BCrypt), `role` (`STUDENT`, `MENTOR`), `avatar_url`, `phone_number`. |
| `mentors` | `id` | Faculty profiles: `user_id` (FK), `mentor_staff_id`, `department`, `designation`, `cabin_location`. |
| `students` | `id` | Student profiles: `user_id` (FK), `roll_number` (UNIQUE), `register_number`, `department`, `year_semester`, `batch_year`, `mentor_id` (FK to `mentors`), `cgpa` (DEFAULT 0.00), `active_backlogs` (DEFAULT 0), `history_of_backlogs` (DEFAULT 0), `placement_readiness_score` (DEFAULT 0), `profile_image` / `avatar_url`, `tenth_percentage` (DEFAULT '0'), `twelfth_percentage` (DEFAULT '0'), `diploma_percentage` (DEFAULT '0'), `undergraduate_gpa` (DEFAULT '0.00'), `degree`, `resume_drive_url`. Cleaned of legacy skills tags. |
| `academic_records` | `id` | Semester transcripts: `student_id` (FK), `semester`, `gpa`, `credits`, `total_subjects`, `backlogs`. |
| `leetcode_stats` | `id` | LeetCode telemetry: `student_id` (FK, UNIQUE), `username`, `total_solved`, `easy_solved`, `medium_solved`, `hard_solved`, `acceptance_rate`, `global_ranking`, `streak_days`, `total_active_days` (Max Streak tracking), `submission_calendar`. |
| `company_drives` | `id` | Recruitment drives: `company_name`, `logo_url`, `job_role`, `package_lpa`, `min_cgpa` (DEFAULT 0.00), `max_backlogs_allowed` (DEFAULT 0), `eligible_branches`, `required_skills`, `job_location`, `drive_date`, `application_deadline`, `registration_url` / `gform_link` / `application_link` (Google Form link), `posted_by_mentor_id` (FK), `status`. |
| `applications` | `id` | Placement applications: `student_id` (FK), `drive_id` (FK), `status` (`APPLIED`, `SHORTLISTED`, `SELECTED`, `REJECTED`), `applied_at`, `mentor_remarks`. |
| `mentor_feedback` | `id` | Advisory notes: `mentor_id` (FK), `student_id` (FK), `feedback_text`, `focus_area`, `rating`, `created_at`. |
| `assessments` | `assessment_id` | Tests posted by mentors: `mentor_id` (FK), `title`, `description`, `target_dept`, `test_link`, `due_date`. |
| `student_assessments` | `id` | Per-student test tracking: `assessment_id` (FK), `student_id` (FK), `status` (`ASSIGNED`, `COMPLETED`), `is_completed` (BOOLEAN DEFAULT FALSE), `score`, `submitted_at`, `completed_at` (TIMESTAMP). |
| `notifications` | `notification_id` | System and candidate alerts: `user_id` / `student_id` (FK), `category` / `type` (`Mentor Feedback`, `Drive Updation`, `Drive Status Updation`), `title`, `message`, `reference_id`, `is_read` (BOOLEAN DEFAULT FALSE), `created_at`. |
| `skill_booster_batches` | `id` | Batches of daily challenges: `updated_by_mentor_id` (FK), `is_active` (BOOLEAN DEFAULT TRUE), `created_at`, `updated_at`. |
| `skill_booster_questions` | `id` | The active 6 questions for a batch: `batch_id` (FK), `question_number` (1 to 6), `title`, `problem_link`. |
| `student_skill_booster_progress` | `id` | Per-student daily progress: `student_id` (FK), `batch_id` (FK), `question_number` (1 to 6), `is_completed` (BOOLEAN DEFAULT FALSE), `completed_at` (TIMESTAMP). |
| `drives` *(View)* | — | SQL compatibility view mirroring `company_drives`. |

---

## 🚀 Local Installation & Setup Guide

### 1. Prerequisites
Ensure the following are installed on your machine:
- **Java Development Kit (JDK)**: Version 21 or higher
- **Node.js**: Version 18 or higher (with `npm`)
- **MySQL Server**: Version 8.0 or higher
- **Git**

---

### 2. Database Setup & Initialization
PlacePro provides two verified SQL scripts depending on whether you are setting up a fresh database or updating an existing installation:

#### Option A: Fresh Database Installation (Recommended for New Setups)
Execute the master schema file [`schema.sql`](file:///c:/Users/Sreehari/OneDrive/Desktop/campus_placement/schema.sql) (also mirrored at [`backend/schema.sql`](file:///c:/Users/Sreehari/OneDrive/Desktop/campus_placement/backend/schema.sql)). This creates all 14 tables with strict relational constraints, sets `0` / `0.00` defaults, configures the `drives` view, and seeds default upcoming company drives and the active 6-question Skill Booster challenge batch.
```sql
-- In MySQL Workbench or MySQL CLI:
SOURCE schema.sql;
```

#### Option B: Safe Migration for Existing Databases (Zero Data Loss)
If you already have existing student and mentor records in your local MySQL database, execute [`backend/schema_migration.sql`](file:///c:/Users/Sreehari/OneDrive/Desktop/campus_placement/backend/schema_migration.sql). This idempotent script uses stored procedures to safely add missing columns (`placement_readiness_score`, `gform_link`, `is_completed`, `completed_at`, `student_id`, `type`, etc.), drops the legacy `verified_technical_skills` column, and creates new tables with `IF NOT EXISTS` without truncating or altering existing candidate data:
```sql
SOURCE backend/schema_migration.sql;
```

#### Option C: Automated Initialization on Backend Startup
The Java backend automatically inspects database health and missing columns on startup via [`DatabaseInitializer.java`](file:///c:/Users/Sreehari/OneDrive/Desktop/campus_placement/backend/src/com/campus/placement/util/DatabaseInitializer.java). It checks all 14 tables, adds any missing columns dynamically, and ensures zero runtime `SQLSyntaxErrorException` or column mismatch errors.

#### Option D: Complete Database Reset
To wipe test registrations and return to a pristine state with default drives, run [`backend/reset_database.sql`](file:///c:/Users/Sreehari/OneDrive/Desktop/campus_placement/backend/reset_database.sql):
```sql
SOURCE backend/reset_database.sql;
```

#### 2.2 Configure Database Credentials
Configure your local MySQL connection in [`backend/db.properties`](file:///c:/Users/Sreehari/OneDrive/Desktop/campus_placement/backend/db.properties) (or override via environment variables like `DB_PASSWORD`):
```properties
db.host=localhost
db.port=3306
db.name=campus_placement_db
db.user=root
db.password=root      # Replace with your MySQL password if different from standard default 'root'
server.port=8080
```

---

### 3. Backend Setup (Java 21)
The backend does not require external build tools like Maven or Gradle; all required JAR dependencies (`mysql-connector-j-8.3.0.jar`, `gson-2.10.1.jar`, `jbcrypt-0.4.jar`) are included in `backend/lib`.

In PowerShell / Terminal:
```powershell
cd backend
# Compile all Java sources
.\build.ps1

# Run the backend HTTP server
.\run.ps1
```
The backend server will start at:
- **REST API Base URL**: `http://localhost:8080/api`
- **Health Check**: `http://localhost:8080/api/health`

---

### 4. Frontend Setup (React + Vite)
In a separate terminal window:
```powershell
cd frontend
# Install dependencies
npm install

# Launch Vite development server
npm run dev
```
The frontend will launch at:
- **Web App**: `http://localhost:5173`

*(Vite is configured with a reverse proxy routing `/api/*` to `http://localhost:8080/api/*`, avoiding any CORS complications).*

---

## 📡 API Endpoints Summary

| Endpoint | Method | Role / Access | Description |
| :--- | :---: | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register new Student or Mentor with BCrypt password hashing. |
| `/api/auth/login` | `POST` | Public | Authenticate user, return session token and profile data. |
| `/api/auth/logout` | `POST` | Authenticated | Invalidate active user session. |
| `/api/student/dashboard` | `GET` | Student | Fetch comprehensive student dashboard and readiness score. |
| `/api/student/profile` | `GET` / `POST` | Student | Retrieve or update student academic details and resume link. |
| `/api/student/academics` | `POST` | Student | Log semester GPA, update total credits, and recalculate CGPA. |
| `/api/companies` | `GET` | Authenticated | Retrieve company drives evaluated via `EligibilityEngine`. |
| `/api/companies` | `POST` / `PUT` | Mentor | Create or update a company placement drive. |
| `/api/companies/apply` | `POST` | Student | Apply for a placement drive (validates eligibility first). |
| `/api/applications` | `GET` | Authenticated | List placement applications filtered by student, mentor, or drive. |
| `/api/applications/status` | `POST` | Mentor | Update application status (`SHORTLISTED`, `SELECTED`, etc.). |
| `/api/assessments` | `GET` / `POST` | Authenticated | List or create technical assessments. |
| `/api/assessments/toggle-completion` | `POST` | Student | Toggle completion state of a student assessment. |
| `/api/skill-booster/current` | `GET` | Authenticated | Fetch current daily 6-question challenge and student progress. |
| `/api/skill-booster/update-batch` | `POST` | Mentor | Publish a new batch of 6 Skill Booster questions. |
| `/api/skill-booster/toggle-question` | `POST` | Student | Toggle completion checkbox for a Skill Booster question. |
| `/api/leetcode/sync` | `POST` | Authenticated | Synchronize LeetCode stats via LeetCode GraphQL API. |
| `/api/leetcode/stats` | `GET` | Authenticated | Retrieve cached LeetCode difficulty metrics and streaks. |
| `/api/mentor/dashboard` | `GET` | Mentor | Retrieve mentor overview metrics and assigned mentees count. |
| `/api/mentor/mentees` | `GET` | Mentor | Retrieve strictly assigned mentees for the logged-in mentor. |
| `/api/mentor/feedback` | `POST` | Mentor | Post mentorship feedback for a specific mentee. |
| `/api/notifications` | `GET` | Authenticated | Fetch categorized user notifications and unread counts. |
| `/api/notifications/read` | `POST` | Authenticated | Mark a single notification as read. |
| `/api/notifications/read-all` | `POST` | Authenticated | Mark all notifications as read for current user. |

---

## 🔒 Security & Authentication

1. **Password Security**: Passwords are never stored in plaintext. They are salted and hashed using **BCrypt** (`BCrypt.hashpw`) before persistence.
2. **Session Guarding**: The backend uses an in-memory enterprise `SessionManager` producing cryptographically strong session tokens (`placepro_<uuid>`).
3. **Role-Based Access Control**:
   - Frontend routes are protected by `RoleGuard`, preventing unauthorized URL traversal.
   - Backend controller routes enforce session and role checks (`SessionManager.UserSession`).
4. **Data Isolation**: Mentors can only query and manage students who have `mentor_id` matching their record.
5. **SQL Injection Protection**: All database interactions in the DAO layer use parameterized `PreparedStatement` instances.
