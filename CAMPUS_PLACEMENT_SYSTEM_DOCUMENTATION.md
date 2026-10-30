# PlacePro: Campus Placement Management System
## Complete System Architecture, Algorithmic Specifications & Module Documentation

---

## 📌 1. System Overview & Technology Stack

**PlacePro** is an institutional campus placement automation, coding skill tracker, and mentor guidance ecosystem. It synchronizes student academic progression with real-time external algorithmic coding telemetry (LeetCode) and matches candidates dynamically against corporate recruitment drive criteria.

### Technology Stack Summary

| Layer | Technology | Key Libraries / Packages | Responsibility |
| :--- | :--- | :--- | :--- |
| **Backend** | Java 21 (LTS) | `com.sun.net.httpserver.HttpServer`, `jbcrypt-0.4.jar`, `gson-2.10.1.jar`, `mysql-connector-j-8.3.0.jar` | High-concurrency REST endpoints, security, eligibility evaluation, and LeetCode GraphQL synchronization. |
| **Frontend** | React 18, Vite 5 | React Router DOM v7, Axios, Lucide React, Recharts | Interactive responsive single-page portal for Students, Faculty Mentors, and Recruiters. |
| **Database** | MySQL 8.0+ | InnoDB Engine, Prepared Statements, Automated Migrations | Relational persistent store across 14 tables with foreign key referential integrity. |
| **External API**| LeetCode GraphQL | Official GraphQL Endpoint (`https://leetcode.com/graphql`) | Direct HTTP/2 submission calendar and question count ingestion. |

---

## 🏛️ 2. Architectural Structure

```
PlacePro System Architecture
├── Frontend (Port 5173 / React 18 + Vite)
│   ├── Context: AuthContext.jsx (Bearer Token Session Store)
│   ├── Student Portal: Dashboard, LeetCode Analytics, Academic Records, Drive Applications
│   ├── Mentor Portal: Mentee Cohort Monitoring, Placement Drive Posting, Skill Booster Management
│   └── Shared Components: NotificationPanel, LeetCodeDonut, GpaTrendChart, FloatingChatButton
│
├── Reverse Proxy (/api -> :8080/api)
│
├── Backend (Port 8080 / Java 21 REST Server)
│   ├── Controller Layer: AuthController, StudentController, MentorController, CompanyController, LeetCodeController, NotificationController
│   ├── Service Layer: AuthService, StudentService, MentorService, LeetCodeService, CompanyService, SkillBoosterService
│   ├── DAO Layer: UserDAO, StudentDAO, MentorDAO, AcademicRecordDAO, CompanyDriveDAO, LeetCodeDAO, NotificationDAO
│   └── Utility Engines: EligibilityEngine, PasswordSecurity, SessionManager, DatabaseInitializer
│
└── Database (MySQL 8.0 / campus_placement_db)
    └── 14 Relational Tables: users, students, mentors, academic_records, leetcode_stats, company_drives, applications, assessments, student_assessments, notifications, skill_booster_batches, skill_booster_questions, student_skill_booster_progress, drives (view).
```

---

## 📚 3. Detailed Specifications of the 10 System Modules

---

### Module 1: Authentication and User Management

#### 1. Description & Purpose
Provides role-guarded registration, authentication, session validation, and logout for **Students**, **Faculty Mentors**, and **Recruiters**. Prevents credential harvesting via cryptographic key stretching and maintains stateful token sessions with sliding-window expiration.

#### 2. Core Algorithm
* **Input:** User credentials $(\text{email}, \text{password})$ and target role.
* **Processing:**
  1. Input sanitization: Trim and lower-case email; lookup user record in `users` table via parameterized query.
  2. Cryptographic Verification: Verify raw password against stored salted hash using BCrypt blowfish algorithm ($2^{10} = 1024$ key expansion cycles).
  3. Session Issuance: Generate an unguessable 128-bit UUIDv4 token with the prefix `placepro_`. Store session in a thread-safe in-memory cache (`ConcurrentHashMap`) with timestamp.
* **Output:** HTTP 200 containing user identity, profile IDs (`studentId` or `mentorId`), role privileges, and Bearer token.

#### 3. Tooling & Implementation
* **Libraries:** `org.mindrot.jbcrypt.BCrypt`, `java.util.concurrent.ConcurrentHashMap`, `java.util.UUID`.
* **Frontend:** React 18 `AuthContext`, Axios Bearer interceptor, `localStorage`.

#### 4. Key Code Component
```java
// backend/src/com/campus/placement/util/PasswordSecurity.java
public static boolean verifyPassword(String rawPassword, String storedHash) {
    if (rawPassword == null || storedHash == null) return false;
    if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
        try {
            return BCrypt.checkpw(rawPassword, storedHash);
        } catch (Exception e) {
            return false;
        }
    }
    return false;
}
```
* **Explanation:**
  * Checks standard modular crypt format prefixes (`$2a$`, `$2b$`, `$2y$`) to identify valid BCrypt hashes.
  * `BCrypt.checkpw` computes the key expansion and constant-time comparison, protecting against timing attacks.

#### 5. Step-by-Step Execution
1. User enters login details on the login page; React dispatches `POST /api/auth/login`.
2. `AuthController.java` parses the JSON body and delegates to `AuthService.login()`.
3. `UserDAO.java` executes `SELECT * FROM users WHERE email = ?` and `PasswordSecurity.java` validates the hash.
4. `SessionManager.java` caches the active session, returning a Bearer token saved to `localStorage` for all subsequent requests.

---

### Module 2: Student Profile and Academic Management

#### 1. Description & Purpose
Manages the comprehensive digital resume and academic transcripts of students, including semester-by-semester GPA entries, active arrears/backlogs, personal information, degree details, and external resume links.

#### 2. Core Algorithm
* **Input:** Semester academic record $(\text{studentId}, \text{semester}, \text{gpa}_i, \text{credits}_i, \text{backlogs}_i)$.
* **Processing:**
  1. Upsert semester record into `academic_records` table on composite primary key `(student_id, semester)`.
  2. Retrieve all recorded semester transcripts for the candidate: $\{\text{gpa}_1, \text{gpa}_2, \dots, \text{gpa}_N\}$.
  3. Recompute Cumulative Grade Point Average (CGPA) and total active arrears dynamically:
     $$\text{CGPA} = \frac{\operatorname{round}\left( \left(\frac{1}{N} \sum_{i=1}^N \text{GPA}_i\right) \times 100 \right)}{100}, \quad \text{Active Backlogs} = \sum_{i=1}^N \text{Backlogs}_i$$
  4. Write updated `cgpa` and `active_backlogs` back to the student's master profile record.
* **Output:** Synchronized academic profile with recomputed CGPA and instant database persistence.

#### 3. Tooling & Implementation
* **Backend:** JDBC `PreparedStatement` with transactional integrity, MySQL `academic_records` and `students` tables.
* **Frontend:** React form modal (`AcademicPerformance.jsx`), Recharts Area Progression Chart.

#### 4. Key Code Component
```java
// backend/src/com/campus/placement/service/StudentService.java
public boolean saveAcademicRecord(AcademicRecord record) {
    boolean ok = studentDAO.addOrUpdateAcademicRecord(record);
    if (ok) {
        List<AcademicRecord> records = studentDAO.getAcademicRecords(record.getStudentId());
        if (!records.isEmpty()) {
            double sum = 0; int backlogs = 0;
            for (AcademicRecord r : records) { sum += r.getGpa(); backlogs += r.getBacklogs(); }
            double avg = Math.round((sum / records.size()) * 100.0) / 100.0;
            Student s = studentDAO.findById(record.getStudentId());
            if (s != null) { s.setCgpa(avg); s.setActiveBacklogs(backlogs); studentDAO.updateStudent(s); }
        }
    }
    return ok;
}
```
* **Explanation:**
  * Performs an upsert operation into the database without creating duplicate semester entries.
  * Calculates the exact mathematical average rounded to two decimal places.
  * Directly updates the `students` table to guarantee that drive eligibility checks always evaluate the freshest CGPA.

#### 5. Step-by-Step Execution
1. Student inputs semester details in `AcademicPerformance.jsx` and clicks "Save Record".
2. Axios issues `POST /api/student/academic-record` with authentication headers.
3. `StudentService.java` validates inputs, writes to `academic_records`, and updates `students.cgpa`.
4. The frontend re-renders the GPA Progression Trend chart and updates the Dashboard cumulative metric card.

---

### Module 3: LeetCode Tracking and Coding Analytics

#### 1. Description & Purpose
Provides automated, real-time ingestion of student algorithmic problem-solving telemetry directly from LeetCode. Displays solved counts by difficulty (Easy, Medium, Hard), historical Maximum Streak, acceptance rates, worldwide ranking, and target tier company readiness.

#### 2. Core Algorithm
* **Input:** Student's LeetCode username or profile URL.
* **Processing:**
  1. URL Sanitization: Normalize input handle (`https://leetcode.com/u/rahul_verma/` $\rightarrow$ `rahul_verma`).
  2. GraphQL Query Execution: Send an HTTP/2 POST request to `https://leetcode.com/graphql` extracting `submitStats` and `userCalendar.submissionCalendar`.
  3. Maximum Streak Extraction: Parse epoch timestamp submission counts into a Red-Black Tree (`TreeSet<LocalDate>`). Traverse the ordered dates:
     $$\text{Streak}_i = \begin{cases} \text{Streak}_{i-1} + 1 & \text{if } d_i = d_{i-1} + 1\text{ day} \\ 1 & \text{otherwise} \end{cases}$$
     $$\text{Max Streak} = \max(\max_i \text{Streak}_i, \text{currentStreak})$$
* **Output:** Persistent `leetcode_stats` record, 4 symmetrical KPI cards, difficulty donut chart, and topic mastery bars.

#### 3. Tooling & Implementation
* **Backend:** Java 21 `HttpClient` (HTTP/2), Google Gson `JsonParser`, `TreeSet<LocalDate>`.
* **Frontend:** `StudentLeetCode.jsx`, Recharts Donut (`LeetCodeDonut.jsx`), Lucide React icons.

#### 4. Key Code Component
```java
// backend/src/com/campus/placement/model/LeetCodeStats.java
TreeSet<LocalDate> dates = new TreeSet<>();
for (String key : obj.keySet()) {
    if (obj.get(key).getAsInt() > 0) {
        dates.add(Instant.ofEpochSecond(Long.parseLong(key)).atZone(ZoneOffset.UTC).toLocalDate());
    }
}
int maxS = 0, curS = 0; LocalDate prev = null;
for (LocalDate d : dates) {
    curS = (prev != null && d.equals(prev.plusDays(1))) ? curS + 1 : 1;
    if (curS > maxS) maxS = curS;
    prev = d;
}
return Math.max(maxS, currentStreak);
```
* **Explanation:**
  * Uses `TreeSet` to eliminate duplicate timestamps and sort dates in $O(N \log N)$ chronological order.
  * Linearly scans sorted consecutive dates to identify the longest unbroken daily problem-solving sequence.
  * Preserves historical peak achievement rather than resetting when the student takes a temporary rest day.

#### 5. Step-by-Step Execution
1. Student accesses `StudentLeetCode.jsx`, initiating an automatic live sync.
2. `LeetCodeService.java` calls the official GraphQL endpoint over HTTP/2.
3. `LeetCodeDAO.java` updates solved counts, acceptance rate, and computed Max Streak in MySQL `leetcode_stats`.
4. The UI renders 4 clean KPI cards (Total Solved, Maximum Streak, Acceptance Rate, Global Ranking) with zero empty grid gaps.

---

### Module 4: Placement Drive and Eligibility Management

#### 1. Description & Purpose
Enables placement officers and mentors to post recruitment drives with specific eligibility criteria. Automatically evaluates student profiles against criteria, unlocks registration links for eligible candidates, and produces detailed failure reasons for ineligible candidates.

#### 2. Core Algorithm
* **Input:** Student Profile $s$ and Company Drive specifications $d$.
* **Processing:** Evaluate the 5-dimensional characteristic indicator function:
  $$\mathcal{E}(s, d) = \mathbb{I}(\text{CGPA}_s \ge \text{MinCGPA}_d) \cdot \mathbb{I}(\text{Backlogs}_s \le \text{MaxAllowed}_d) \cdot \mathbb{I}(\text{Tenth}_s \ge 60\%) \cdot \mathbb{I}(\text{Twelfth}_s \ge 60\%) \cdot \mathbb{I}(\mathcal{C}_{\text{dept}} \cap \mathcal{C}_{\text{drive}} \neq \emptyset)$$
  * Canonical Branch Matching: Normalizes branch strings using regular expressions with word boundaries (`\b(CSE|CS)\b`, `\b(IT)\b`, `\b(ECE)\b`, `\b(AIDS)\b`). Computes set intersection between student degree/branch and drive branches.
* **Output:** Boolean `isEligible` flag, list of specific unmet criteria strings, and dynamic UI state.

#### 3. Tooling & Implementation
* **Backend:** Java 21 Regex Pattern Engine, Java Streams, MySQL `company_drives` and `applications` tables.
* **Frontend:** `UpcomingCompanies.jsx`, dynamic badge renderers, one-click application modal.

#### 4. Key Code Component
```java
// backend/src/com/campus/placement/util/EligibilityEngine.java
if (student.getCgpa() < drive.getMinCgpa()) {
    eligible = false;
    unmetReasons.add(String.format("Minimum CGPA required: %.2f (Your CGPA: %.2f)", drive.getMinCgpa(), student.getCgpa()));
}
if (student.getActiveBacklogs() > drive.getMaxBacklogsAllowed()) {
    eligible = false;
    unmetReasons.add(String.format("Active backlogs/arrears exceed allowed limit: %d active (Allowed: %d)", student.getActiveBacklogs(), drive.getMaxBacklogsAllowed()));
}
if (drive.getEligibleBranches() != null && !drive.getEligibleBranches().trim().isEmpty()) {
    Set<String> branches = Arrays.stream(drive.getEligibleBranches().split(",")).map(String::trim).collect(Collectors.toSet());
    if (!isBranchMatching(student.getDepartment(), student.getDegree(), branches)) {
        eligible = false;
        unmetReasons.add(String.format("Branch/Department not eligible: %s (Eligible: %s)", student.getDepartment(), drive.getEligibleBranches()));
    }
}
```
* **Explanation:**
  * Checks multiple criteria independently and accumulates human-readable feedback for every unmet metric.
  * Calls `isBranchMatching` to resolve abbreviations (`CSE`) with full department names (`Computer Science & Engineering`).

#### 5. Step-by-Step Execution
1. Student opens `UpcomingCompanies.jsx`, triggering `GET /api/student/dashboard`.
2. `StudentService.java` loops through drives, executing `EligibilityEngine.evaluateEligibility()`.
3. For eligible drives, the portal unlocks "Apply on Portal" or direct Google Form registration links (`gform_link`).
4. Applying submits `POST /api/student/apply`, creating an application entry with status `'APPLIED'`.

---

### Module 5: Skill Booster and Daily Challenges

#### 1. Description & Purpose
Maintains a faculty-curated daily set of exactly 6 coding and technical challenges. Tracks per-student completion status, provides direct problem links (LeetCode, HackerRank, GeeksForGeeks), and resets completion vectors automatically when new batches are published.

#### 2. Core Algorithm
* **Input:** Student ID, active batch ID, question number index $(1 \le k \le 6)$, and completion state.
* **Processing:**
  1. Retrieve active batch where `is_active = TRUE`.
  2. Inspect previous completion state for the student in `student_skill_booster_progress`.
  3. Upsert completion flag with server-side timestamp:
     $$\text{Status} \leftarrow \text{toggle}(\text{CurrentStatus}), \quad \text{Timestamp} \leftarrow \begin{cases} \text{CURRENT\_TIMESTAMP} & \text{if true} \\ \text{NULL} & \text{if false} \end{cases}$$
* **Output:** Updated question completion vector and aggregate $k/6$ progress score.

#### 3. Tooling & Implementation
* **Backend:** MySQL `skill_booster_batches`, `skill_booster_questions`, `student_skill_booster_progress`.
* **Frontend:** `SkillBoosterManagement.jsx`, optimistic UI checkbox state, animated completion bars.

#### 4. Key Code Component
```java
// backend/src/com/campus/placement/dao/SkillBoosterDAO.java
String checkSql = "SELECT is_completed FROM student_skill_booster_progress WHERE student_id = ? AND batch_id = ? AND question_number = ?";
// If row exists, update; otherwise insert new record:
if (rowExists) {
    String updateSql = "UPDATE student_skill_booster_progress SET is_completed = ?, completed_at = ? WHERE student_id = ? AND batch_id = ? AND question_number = ?";
    try (PreparedStatement ps = conn.prepareStatement(updateSql)) {
        ps.setBoolean(1, newStatus); ps.setTimestamp(2, newStatus ? now : null);
        ps.setInt(3, studentId); ps.setInt(4, batchId); ps.setInt(5, questionNumber);
        ps.executeUpdate();
    }
}
```
* **Explanation:**
  * Isolates question progress by both `student_id` and `batch_id`.
  * Allows students to check and uncheck challenge items with instant timestamp auditing.

#### 5. Step-by-Step Execution
1. Mentor publishes a 6-question challenge set via `POST /api/skill-booster/publish`.
2. Student views the active questions on their dashboard and solves problems on external coding platforms.
3. Student clicks the question checkbox, dispatching `POST /api/skill-booster/toggle`.
4. `SkillBoosterDAO.java` records completion in MySQL and increments the student's daily completion tally.

---

### Module 6: Assessment and Online Coding Practice

#### 1. Description & Purpose
Facilitates departmental and general online test scheduling, mock coding rounds, and assessment tracking. Faculty post assessment links with deadlines, and students track their progress and submission status.

#### 2. Core Algorithm
* **Input:** Assessment record $(\text{assessmentId}, \text{mentorId}, \text{title}, \text{targetDept}, \text{testLink}, \text{dueDate})$.
* **Processing:**
  1. Departmental Filtering: Query assessments where `target_dept LIKE %student_dept% OR target_dept LIKE '%ALL%'`.
  2. Idempotent Upsert: Log completion status using `ON DUPLICATE KEY UPDATE` on `(assessment_id, student_id)`.
  3. Status Transition: Toggle state between `'ASSIGNED'` and `'COMPLETED'`.
* **Output:** Real-time assessment progress cards and mentor compliance matrices.

#### 3. Tooling & Implementation
* **Backend:** Java `AssessmentDAO`, MySQL `assessments` and `student_assessments` tables.
* **Frontend:** Student dashboard assessment widget, status pills, external link navigators.

#### 4. Key Code Component
```java
// backend/src/com/campus/placement/dao/AssessmentDAO.java
public boolean toggleStudentAssessmentCompletion(int assessmentId, int studentId, boolean completed) {
    String sql = completed
        ? "INSERT INTO student_assessments (assessment_id, student_id, status, is_completed, submitted_at, completed_at) " +
          "VALUES (?, ?, 'COMPLETED', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) " +
          "ON DUPLICATE KEY UPDATE status = 'COMPLETED', is_completed = TRUE, submitted_at = CURRENT_TIMESTAMP, completed_at = CURRENT_TIMESTAMP"
        : "INSERT INTO student_assessments (assessment_id, student_id, status, is_completed, submitted_at, completed_at) " +
          "VALUES (?, ?, 'ASSIGNED', FALSE, NULL, NULL) " +
          "ON DUPLICATE KEY UPDATE status = 'ASSIGNED', is_completed = FALSE, submitted_at = NULL, completed_at = NULL";
    try (Connection conn = dbManager.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
        ps.setInt(1, assessmentId); ps.setInt(2, studentId);
        return ps.executeUpdate() > 0;
    } catch (SQLException e) { return false; }
}
```
* **Explanation:**
  * Uses MySQL `ON DUPLICATE KEY UPDATE` to avoid duplicate insertion errors.
  * Synchronizes both text status and boolean indicators with server timestamps.

#### 5. Step-by-Step Execution
1. Mentor posts assessment via `POST /api/mentor/assessment`.
2. Student views pending tests on the dashboard and completes the test via external link.
3. Student clicks "Mark Completed", triggering `POST /api/assessments/toggle`.
4. `AssessmentDAO.java` updates status to `'COMPLETED'`, immediately visible on the mentor's tracking dashboard.

---

### Module 7: Mentor and Mentee Management

#### 1. Description & Purpose
Provides faculty mentors with cohort analytics over assigned mentees. Enables monitoring of individual academic performance, live LeetCode stats, placement applications, and posting tailored mentorship feedback.

#### 2. Core Algorithm
* **Input:** Faculty Mentor ID.
* **Processing:**
  1. Retrieve all assigned mentees via `students.mentor_id`.
  2. Aggregate cohort metrics:
     $$\text{Avg CGPA} = \frac{1}{M}\sum_{i=1}^M \text{CGPA}_i, \quad \text{Total LeetCode Solved} = \sum_{i=1}^M \text{Solved}_i$$
  3. Classify application stages: Flag students as Placed (`SELECTED`) or Shortlisted (`SHORTLISTED` / `TECHNICAL_ROUND`).
  4. Fetch personalized feedback history from `mentor_feedback`.
* **Output:** Cohort analytics dashboard, mentee inspection modal, and feedback dispatch.

#### 3. Tooling & Implementation
* **Backend:** Java `MentorService`, relational joins across `students`, `applications`, and `leetcode_stats`.
* **Frontend:** `MenteeList.jsx`, `MenteeLeetCodeProgress.jsx`, search and filter controls.

#### 4. Key Code Component
```java
// backend/src/com/campus/placement/service/MentorService.java
for (Student s : mentees) {
    totalCgpa += s.getCgpa();
    if (s.getLeetCodeStats() != null) totalLcSolved += s.getLeetCodeStats().getTotalSolved();
    List<Application> sApps = applicationDAO.findByStudentId(s.getStudentId());
    boolean isSelected = sApps.stream().anyMatch(a -> "SELECTED".equalsIgnoreCase(a.getStatus()));
    boolean isShortlisted = sApps.stream().anyMatch(a -> "SHORTLISTED".equalsIgnoreCase(a.getStatus()));
    if (isSelected) placedCount++;
    else if (isShortlisted) shortlistedCount++;
}
double avgCgpa = mentees.isEmpty() ? 0.0 : Math.round((totalCgpa / mentees.size()) * 100.0) / 100.0;
```
* **Explanation:**
  * Uses Java Streams to evaluate application pipelines across all assigned mentees.
  * Calculates real-time average CGPA and placement counts without heavy database stored procedures.

#### 5. Step-by-Step Execution
1. Mentor logs in and opens `MenteeList.jsx`, firing `GET /api/mentor/dashboard`.
2. `MentorService.java` compiles mentee metrics and LeetCode figures.
3. Mentor reviews student standings and submits guidance notes via `POST /api/mentor/feedback`.
4. The system stores feedback in `mentor_feedback` and automatically generates a notification alert for the student.

---

### Module 8: Notification and Alert Management

#### 1. Description & Purpose
Delivers event-driven alerts to students regarding mentor feedback, new placement drive announcements, deadline reminders, and application stage updates with categorized filtering and unread counters.

#### 2. Core Algorithm
* **Input:** System event $(\text{userId}, \text{category}, \text{title}, \text{message}, \text{referenceId})$.
* **Processing:**
  1. Insert alert into `notifications` table with default `is_read = FALSE` and server timestamp.
  2. Client-side polling: Frontend queries `GET /api/notifications` every 20 seconds.
  3. Category Filtering: Client filters notifications by tab (`ALL`, `MENTOR_FEEDBACK`, `DRIVE_UPDATE`, `DRIVE_STATUS`).
  4. Optimistic Mark-As-Read: Client immediately marks item read in local state, then executes `POST /api/notifications/read`.
* **Output:** Real-time animated unread badge counter in navbar and slide-over notification drawer.

#### 3. Tooling & Implementation
* **Backend:** Java `NotificationController`, MySQL `notifications` table.
* **Frontend:** `NotificationPanel.jsx`, Lucide Bell icon with animated pulse badge, React hooks.

#### 4. Key Code Component
```java
// backend/src/com/campus/placement/dao/NotificationDAO.java
public int createNotification(Notification n) {
    String sql = "INSERT INTO notifications (user_id, student_id, category, type, title, message, reference_id, is_read, created_at) " +
                 "VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))";
    try (Connection conn = dbManager.getConnection();
         PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
        if (n.getUserId() != null && n.getUserId() > 0) { ps.setInt(1, n.getUserId()); ps.setInt(2, n.getUserId()); }
        else { ps.setNull(1, Types.INTEGER); ps.setNull(2, Types.INTEGER); }
        ps.setString(3, n.getCategory()); ps.setString(4, n.getCategory());
        ps.setString(5, n.getTitle()); ps.setString(6, n.getMessage());
        ps.setBoolean(8, n.isRead());
        ps.executeUpdate();
        return ps.getGeneratedKeys().next() ? ps.getGeneratedKeys().getInt(1) : 0;
    } catch (SQLException e) { return 0; }
}
```
* **Explanation:**
  * Assigns notifications to specific users or broadcasts globally if IDs are null.
  * Employs `COALESCE(?, CURRENT_TIMESTAMP)` for reliable server-side chronological sorting.

#### 5. Step-by-Step Execution
1. An action occurs (e.g., mentor leaves feedback or new drive is posted).
2. `NotificationDAO.createNotification()` inserts the record into MySQL.
3. The student's browser polls `GET /api/notifications`, receives the alert, and shows the red counter badge.
4. Student clicks the bell icon in `NotificationPanel.jsx` to view and mark alerts as read.

---

### Module 9: Database and Data Management

#### 1. Description & Purpose
Governs persistence, schema integrity, programmatic migrations, connection pooling, and initial seed data across all 14 database tables without requiring manual SQL execution on server restarts.

#### 2. Core Algorithm
* **Input:** Database connection parameters in `db.properties`.
* **Processing:**
  1. Connection Pooling: Singleton `DBConnectionManager` establishes reusable JDBC connections.
  2. Schema Verification: Queries `DatabaseMetaData` to inspect existing tables and columns.
  3. Dynamic Idempotent DDL: Executes `ALTER TABLE ... ADD COLUMN` only if the column does not already exist:
     $$\text{Check: } \text{ColumnExists}(T, C) \implies \begin{cases} \text{Skip} & \text{if true} \\ \text{ALTER TABLE } T \text{ ADD COLUMN } C & \text{if false} \end{cases}$$
  4. Compatibility Views: Creates view `drives` mirroring `company_drives` to ensure legacy SQL queries function seamlessly.
* **Output:** Healthy, validated relational database with zero missing column runtime exceptions.

#### 3. Tooling & Implementation
* **Backend:** MySQL Connector/J (`mysql-connector-j-8.3.0.jar`), Java JDBC `DatabaseMetaData`, `DatabaseInitializer.java`.
* **Config:** `backend/db.properties`.

#### 4. Key Code Component
```java
// backend/src/com/campus/placement/util/DatabaseInitializer.java
private static void addColumnIfNotExists(Connection conn, String table, String col, String typeDef) {
    try {
        DatabaseMetaData md = conn.getMetaData();
        try (ResultSet rs = md.getColumns(null, null, table, col)) {
            if (!rs.next()) {
                try (Statement stmt = conn.createStatement()) {
                    stmt.executeUpdate("ALTER TABLE " + table + " ADD COLUMN " + col + " " + typeDef + ";");
                }
            }
        }
    } catch (Exception ignored) {}
}
```
* **Explanation:**
  * Uses standard JDBC metadata inspection to inspect the active database catalog.
  * Dynamically adds missing columns on boot, making migrations completely safe and automatic.

#### 5. Step-by-Step Execution
1. Server starts and invokes `DatabaseInitializer.initialize()` before opening HTTP port 8080.
2. `DBConnectionManager.java` reads `db.properties` and connects to MySQL.
3. The initializer runs DDL creation scripts, adds missing columns, and seeds default drive/question records.
4. Confirms completion with `"Database initialization completed successfully"`, ensuring zero SQL errors during runtime.

---

### Module 10: Dashboard and Placement Readiness Analytics

#### 1. Description & Purpose
Provides students with an executive dashboard visualizing their holistic placement readiness score, GPA progress curve, daily problem-solving reminder banner, active backlogs, and target tier company preparation metrics.

#### 2. Core Algorithm
* **Input:** Student Profile $s$ and verified LeetCode stats $lc$.
* **Processing:** Compute the multi-attribute Placement Readiness Score:
  $$S_{\text{readiness}} = \operatorname{clamp}\left(5, 99, \left\lfloor S_{\text{academic}} + S_{\text{leetcode}} - P_{\text{backlog}} + 0.5 \right\rfloor\right)$$
  Where:
  $$S_{\text{academic}} = \min\left(50.0, \frac{\text{CGPA}}{10.0} \times 50.0\right)$$
  $$S_{\text{leetcode}} = \min\left(30.0, \frac{\text{Total Solved}}{350.0} \times 30.0\right) + \min\left(12.0, \frac{\text{Medium} + 2\times\text{Hard}}{200.0} \times 12.0\right) + \min\left(8.0, \frac{\text{Active Days}}{30.0} \times 8.0\right)$$
  $$P_{\text{backlog}} = 12.0 \times \text{Active Backlogs}$$
* **Output:** Normalized integer score $[5, 99]$, rendered as a radial progress ring alongside daily challenge status banners.

#### 3. Tooling & Implementation
* **Backend:** Java `EligibilityEngine.computePlacementReadinessScore`, `StudentService`.
* **Frontend:** `StudentDashboard.jsx`, Tailwind CSS gradients, Lucide React icons.

#### 4. Key Code Component
```java
// backend/src/com/campus/placement/util/EligibilityEngine.java
public static int computePlacementReadinessScore(Student student, LeetCodeStats lc) {
    if (student == null) return 0;
    double cgpaScore = Math.min(50.0, (student.getCgpa() / 10.0) * 50.0);
    double lcScore = 0.0;
    if (lc != null) {
        double solvedPts = Math.min(30.0, (lc.getTotalSolved() / 350.0) * 30.0);
        int hardAndMed = lc.getMediumSolved() + (lc.getHardSolved() * 2);
        double qualityPts = Math.min(12.0, (hardAndMed / 200.0) * 12.0);
        double streakPts = Math.min(8.0, (lc.getStreakDays() / 30.0) * 8.0);
        lcScore = solvedPts + qualityPts + streakPts;
    }
    double backlogPenalty = student.getActiveBacklogs() * 12.0;
    int total = (int) Math.round(cgpaScore + lcScore - backlogPenalty);
    return Math.max(5, Math.min(99, total));
}
```
* **Explanation:**
  * Balances academic standing (50 pts) and coding ability (50 pts) equally.
  * Awards a 2x bonus for Hard LeetCode problems to incentivize deep algorithmic problem solving.
  * Imposes a strict penalty (-12 pts per backlog) reflecting real-world tier-1 corporate recruitment restrictions.

#### 5. Step-by-Step Execution
1. Student logs in and navigates to the dashboard, triggering `GET /api/student/dashboard`.
2. `StudentService.java` pulls student transcripts and calls `EligibilityEngine.computePlacementReadinessScore()`.
3. The dashboard displays the readiness score ring, Cumulative CGPA, LeetCode Solved KPI, and Active Backlogs.
4. The daily reminder banner displays solving status:
   * **If solved today:** Displays *"✓ Today's LeetCode Challenge Completed!"* with a green *"Completed Today"* badge.
   * **If not solved today:** Displays *"Daily LeetCode coding reminder: Don't forget to solve your daily LeetCode problem today!"* with a direct *"Solve Now"* button.

---

## 📐 4. Mathematical Foundations Summary

| Metric | Mathematical Formula | Boundary / Range |
| :--- | :--- | :--- |
| **Placement Readiness Score** | $S = \operatorname{clamp}\left(5, 99, 5(\text{CGPA}) + \min(30, \frac{\text{Solved}}{350}\times 30) + \min(12, \frac{\text{M}+2\text{H}}{200}\times 12) + \min(8, \frac{\text{Days}}{30}\times 8) - 12(\text{Backlogs})\right)$ | $[5, 99]$ |
| **Cumulative GPA (CGPA)** | $\text{CGPA} = \frac{1}{N}\sum_{i=1}^N \text{GPA}_i \quad \text{rounded to 2 decimal places}$ | $[0.00, 10.00]$ |
| **Historical Max Streak** | $\text{MaxStreak} = \max_{1 \le k \le M} \text{Streak}(k) \quad \text{where } \text{Streak}(k) = \text{Streak}(k-1) + 1 \text{ if } d_k = d_{k-1} + 1\text{ day, else } 1$ | $[0, \infty)$ |
| **Multi-Constraint Eligibility**| $\mathcal{E}(s, d) = \mathbb{I}(\text{CGPA} \ge \text{MinCGPA}) \cdot \mathbb{I}(\text{Backlogs} \le \text{MaxAllowed}) \cdot \mathbb{I}(\mathcal{C}_{\text{dept}} \cap \mathcal{C}_{\text{drive}} \neq \emptyset) \cdot \mathbb{I}(\text{10th} \ge 60\%) \cdot \mathbb{I}(\text{12th} \ge 60\%)$ | $\{0, 1\}$ (Boolean) |
| **Google Tier-1 Readiness** | $\text{Score} = \min\left(100, \left\lfloor \left(0.40 \frac{\text{Total}}{400} + 0.40 \frac{\text{Medium}}{180} + 0.20 \frac{\text{Hard}}{40}\right) \times 100 \right\rfloor\right)$ | $[0\%, 100\%]$ |

---

## 🚀 5. Quickstart & Verification Guide

### 1. Database Setup
```bash
mysql -u root -p < schema.sql
```

### 2. Backend Server Launch
```powershell
cd backend
.\build.ps1   # Compiles all 46 Java classes into bin/
.\run.ps1     # Starts Java REST Server on port 8080
```
*Health Check: `curl http://localhost:8080/api/health` $\rightarrow$ `{"data":"OK","success":true}`*

### 3. Frontend Web App Launch
```powershell
cd frontend
npm install   # Installs dependencies
npm run dev   # Launches Vite development server on port 5173
```
*Access Web Portal: `http://localhost:5173`*
