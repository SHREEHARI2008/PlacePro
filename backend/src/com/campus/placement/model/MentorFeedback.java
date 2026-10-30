package com.campus.placement.model;

import java.sql.Timestamp;

public class MentorFeedback {
    private int id;
    private int mentorId;
    private String mentorName;
    private String mentorDesignation;
    private int studentId;
    private String studentName;
    private String feedbackText;
    private String focusArea; // e.g. "DSA", "Resume", "Aptitude", "Mock Interview"
    private int rating; // 1 to 5
    private Timestamp createdAt;

    public MentorFeedback() {}

    public MentorFeedback(int id, int mentorId, int studentId, String feedbackText, String focusArea, int rating, Timestamp createdAt) {
        this.id = id;
        this.mentorId = mentorId;
        this.studentId = studentId;
        this.feedbackText = feedbackText;
        this.focusArea = focusArea;
        this.rating = rating;
        this.createdAt = createdAt;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getMentorId() { return mentorId; }
    public void setMentorId(int mentorId) { this.mentorId = mentorId; }

    public String getMentorName() { return mentorName; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }

    public String getMentorDesignation() { return mentorDesignation; }
    public void setMentorDesignation(String mentorDesignation) { this.mentorDesignation = mentorDesignation; }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getFeedbackText() { return feedbackText; }
    public void setFeedbackText(String feedbackText) { this.feedbackText = feedbackText; }

    public String getFocusArea() { return focusArea; }
    public void setFocusArea(String focusArea) { this.focusArea = focusArea; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
