package com.campus.placement.model;

import java.sql.Timestamp;

public class Application {
    private int id;
    private int studentId;
    private int driveId;
    private Timestamp appliedAt;
    private String status; // "APPLIED", "SHORTLISTED", "TECHNICAL_ROUND", "HR_ROUND", "SELECTED", "REJECTED"
    private String mentorRemarks;
    private Timestamp updatedAt;

    // Joined fields
    private String studentName;
    private String studentRoll;
    private String studentEmail;
    private String studentDepartment;
    private double studentCgpa;
    private int studentActiveBacklogs;
    private String studentSkills;
    private String studentResumeUrl;
    private String studentLeetcode;
    private int studentLeetcodeTotalSolved;

    private String companyName;
    private String jobRole;
    private double packageLpa;
    private String companyLogo;

    public Application() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public int getDriveId() { return driveId; }
    public void setDriveId(int driveId) { this.driveId = driveId; }

    public Timestamp getAppliedAt() { return appliedAt; }
    public void setAppliedAt(Timestamp appliedAt) { this.appliedAt = appliedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMentorRemarks() { return mentorRemarks; }
    public void setMentorRemarks(String mentorRemarks) { this.mentorRemarks = mentorRemarks; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentRoll() { return studentRoll; }
    public void setStudentRoll(String studentRoll) { this.studentRoll = studentRoll; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getStudentDepartment() { return studentDepartment; }
    public void setStudentDepartment(String studentDepartment) { this.studentDepartment = studentDepartment; }

    public double getStudentCgpa() { return studentCgpa; }
    public void setStudentCgpa(double studentCgpa) { this.studentCgpa = studentCgpa; }

    public int getStudentActiveBacklogs() { return studentActiveBacklogs; }
    public void setStudentActiveBacklogs(int studentActiveBacklogs) { this.studentActiveBacklogs = studentActiveBacklogs; }

    public String getStudentSkills() { return skillsClean(studentSkills); }
    public void setStudentSkills(String studentSkills) { this.studentSkills = studentSkills; }

    public String getStudentResumeUrl() { return studentResumeUrl; }
    public void setStudentResumeUrl(String studentResumeUrl) { this.studentResumeUrl = studentResumeUrl; }

    public String getStudentLeetcode() { return studentLeetcode; }
    public void setStudentLeetcode(String studentLeetcode) { this.studentLeetcode = studentLeetcode; }

    public int getStudentLeetcodeTotalSolved() { return studentLeetcodeTotalSolved; }
    public void setStudentLeetcodeTotalSolved(int studentLeetcodeTotalSolved) { this.studentLeetcodeTotalSolved = studentLeetcodeTotalSolved; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getJobRole() { return jobRole; }
    public void setJobRole(String jobRole) { this.jobRole = jobRole; }

    public double getPackageLpa() { return packageLpa; }
    public void setPackageLpa(double packageLpa) { this.packageLpa = packageLpa; }

    public String getCompanyLogo() { return companyLogo; }
    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }

    private String skillsClean(String s) {
        return s == null ? "" : s;
    }
}
