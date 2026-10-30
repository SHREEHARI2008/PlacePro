package com.campus.placement.model;

import java.sql.Timestamp;
import java.util.List;

/**
 * Student model subclassing User, matching PlacePro student attributes.
 */
public class Student extends User {
    private int studentId; // Primary key in students table
    private String registerNumber; // University Register Number
    private String rollNumber;
    private String department;
    private String yearSemester; // e.g., "3rd Year / Sem 6"
    private int batchYear;
    private Integer mentorId;
    private String mentorName;
    private double cgpa;
    private int activeBacklogs;
    private int historyOfBacklogs;
    private String leetcodeUrl; // Full LeetCode profile URL
    private String leetcodeUsername;
    private String resumeUrl;
    private String resumeDriveUrl;
    private String skills;
    private String gender;
    private String dateOfBirth;
    private String tenthPercentage;
    private String twelfthPercentage;
    private String diplomaPercentage;
    private String undergraduateGpa;
    private String collegeName;
    private String campus;
    private String degree;
    private LeetCodeStats leetCodeStats;
    private List<AcademicRecord> academicRecords;

    public Student() {
        this.role = "STUDENT";
    }

    public Student(int userId, String name, String email, String passwordHash, String avatarUrl, Timestamp createdAt,
                   int studentId, String rollNumber, String department, int batchYear, Integer mentorId,
                   double cgpa, int activeBacklogs, int historyOfBacklogs, String leetcodeUsername,
                   String resumeUrl, String skills) {
        super(userId, name, email, passwordHash, "STUDENT", avatarUrl, createdAt);
        this.studentId = studentId;
        this.rollNumber = rollNumber;
        this.registerNumber = rollNumber;
        this.department = department;
        this.batchYear = batchYear;
        this.mentorId = mentorId;
        this.cgpa = cgpa;
        this.activeBacklogs = activeBacklogs;
        this.historyOfBacklogs = historyOfBacklogs;
        this.leetcodeUsername = leetcodeUsername;
        this.resumeUrl = resumeUrl;
        this.skills = skills;
    }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public String getRegisterNumber() {
        return registerNumber != null ? registerNumber : rollNumber;
    }
    public void setRegisterNumber(String registerNumber) {
        this.registerNumber = registerNumber;
        if (this.rollNumber == null || this.rollNumber.isEmpty()) {
            this.rollNumber = registerNumber;
        }
    }

    public String getRollNumber() {
        return rollNumber != null ? rollNumber : registerNumber;
    }
    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
        if (this.registerNumber == null || this.registerNumber.isEmpty()) {
            this.registerNumber = rollNumber;
        }
    }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getYearSemester() {
        return yearSemester != null ? yearSemester : "3rd Year / Sem 6";
    }
    public void setYearSemester(String yearSemester) { this.yearSemester = yearSemester; }

    public int getBatchYear() { return batchYear; }
    public void setBatchYear(int batchYear) { this.batchYear = batchYear; }

    public Integer getMentorId() { return mentorId; }
    public void setMentorId(Integer mentorId) { this.mentorId = mentorId; }

    public String getMentorName() { return mentorName; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }

    public double getCgpa() { return cgpa; }
    public void setCgpa(double cgpa) { this.cgpa = cgpa; }

    public int getActiveBacklogs() { return activeBacklogs; }
    public void setActiveBacklogs(int activeBacklogs) { this.activeBacklogs = activeBacklogs; }

    public int getHistoryOfBacklogs() { return historyOfBacklogs; }
    public void setHistoryOfBacklogs(int historyOfBacklogs) { this.historyOfBacklogs = historyOfBacklogs; }

    public String getLeetcodeUrl() {
        if (leetcodeUrl != null && !leetcodeUrl.isEmpty()) {
            return leetcodeUrl;
        }
        if (leetcodeUsername != null && !leetcodeUsername.isEmpty()) {
            return "https://leetcode.com/u/" + leetcodeUsername;
        }
        return "";
    }
    public void setLeetcodeUrl(String leetcodeUrl) {
        this.leetcodeUrl = leetcodeUrl;
        if (leetcodeUrl != null && !leetcodeUrl.isEmpty()) {
            // Extract username if URL given
            String clean = leetcodeUrl.replaceAll("/+$", "");
            int lastSlash = clean.lastIndexOf('/');
            if (lastSlash != -1 && lastSlash < clean.length() - 1) {
                this.leetcodeUsername = clean.substring(lastSlash + 1);
            } else {
                this.leetcodeUsername = clean;
            }
        }
    }

    public String getLeetcodeUsername() { return leetcodeUsername; }
    public void setLeetcodeUsername(String leetcodeUsername) {
        this.leetcodeUsername = leetcodeUsername;
        if (this.leetcodeUrl == null || this.leetcodeUrl.isEmpty()) {
            this.leetcodeUrl = "https://leetcode.com/u/" + leetcodeUsername;
        }
    }

    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getGender() { return gender != null ? gender : "Female"; }
    public void setGender(String gender) { this.gender = gender; }

    public String getDateOfBirth() { return dateOfBirth != null ? dateOfBirth : "30-12-07"; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getTenthPercentage() { return tenthPercentage != null ? tenthPercentage : "0"; }
    public void setTenthPercentage(String tenthPercentage) { this.tenthPercentage = tenthPercentage; }

    public String getTwelfthPercentage() { return twelfthPercentage != null ? twelfthPercentage : "0"; }
    public void setTwelfthPercentage(String twelfthPercentage) { this.twelfthPercentage = twelfthPercentage; }

    public String getDiplomaPercentage() { return diplomaPercentage != null ? diplomaPercentage : "0"; }
    public void setDiplomaPercentage(String diplomaPercentage) { this.diplomaPercentage = diplomaPercentage; }

    public String getUndergraduateGpa() { return undergraduateGpa != null ? undergraduateGpa : "0.00"; }
    public void setUndergraduateGpa(String undergraduateGpa) { this.undergraduateGpa = undergraduateGpa; }

    public String getResumeDriveUrl() { return resumeDriveUrl; }
    public void setResumeDriveUrl(String resumeDriveUrl) { this.resumeDriveUrl = resumeDriveUrl; }

    public String getCollegeName() { return collegeName != null ? collegeName : "ABC College"; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }

    public String getCampus() { return campus != null ? campus : "ABC College"; }
    public void setCampus(String campus) { this.campus = campus; }

    public String getDegree() { return degree != null ? degree : "B.E CSE"; }
    public void setDegree(String degree) { this.degree = degree; }

    private int placementReadinessScore = 0;
    public int getPlacementReadinessScore() { return placementReadinessScore; }
    public void setPlacementReadinessScore(int placementReadinessScore) { this.placementReadinessScore = placementReadinessScore; }

    public String getProfileImage() { return getAvatarUrl(); }
    public void setProfileImage(String profileImage) { setAvatarUrl(profileImage); }

    public LeetCodeStats getLeetCodeStats() { return leetCodeStats; }
    public void setLeetCodeStats(LeetCodeStats leetCodeStats) { this.leetCodeStats = leetCodeStats; }

    public List<AcademicRecord> getAcademicRecords() { return academicRecords; }
    public void setAcademicRecords(List<AcademicRecord> academicRecords) { this.academicRecords = academicRecords; }
}
