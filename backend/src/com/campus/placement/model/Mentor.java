package com.campus.placement.model;

import java.sql.Timestamp;

/**
 * Mentor model subclassing User, matching PlacePro mentor attributes.
 */
public class Mentor extends User {
    private int mentorId; // Primary key in mentors table
    private String mentorStaffId; // Mentor ID / Staff code e.g. "MTR-2026"
    private String department;
    private String designation;
    private String cabinLocation;
    private int menteeCount;

    public Mentor() {
        this.role = "MENTOR";
    }

    public Mentor(int userId, String name, String email, String passwordHash, String avatarUrl, Timestamp createdAt,
                  int mentorId, String department, String designation, String cabinLocation) {
        super(userId, name, email, passwordHash, "MENTOR", avatarUrl, createdAt);
        this.mentorId = mentorId;
        this.department = department;
        this.designation = designation;
        this.cabinLocation = cabinLocation;
    }

    public int getMentorId() { return mentorId; }
    public void setMentorId(int mentorId) { this.mentorId = mentorId; }

    public String getMentorStaffId() {
        if (mentorStaffId != null && !mentorStaffId.isEmpty()) {
            return mentorStaffId;
        }
        return "MTR-" + (100 + mentorId);
    }
    public void setMentorStaffId(String mentorStaffId) { this.mentorStaffId = mentorStaffId; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getCabinLocation() { return cabinLocation; }
    public void setCabinLocation(String cabinLocation) { this.cabinLocation = cabinLocation; }

    public int getMenteeCount() { return menteeCount; }
    public void setMenteeCount(int menteeCount) { this.menteeCount = menteeCount; }
}
