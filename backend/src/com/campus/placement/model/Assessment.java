package com.campus.placement.model;

import java.sql.Timestamp;

public class Assessment {
    private int assessmentId;
    private Integer mentorId;
    private String mentorName;
    private String title;
    private String description;
    private String targetDept;
    private String testLink;
    private String dueDate;
    private Timestamp createdAt;
    private boolean completed;
    private String completedAt;
    private int completedCount;

    public Assessment() {}

    public Assessment(int assessmentId, Integer mentorId, String mentorName, String title,
                      String description, String targetDept, String testLink, String dueDate, Timestamp createdAt) {
        this.assessmentId = assessmentId;
        this.mentorId = mentorId;
        this.mentorName = mentorName;
        this.title = title;
        this.description = description;
        this.targetDept = targetDept;
        this.testLink = testLink;
        this.dueDate = dueDate;
        this.createdAt = createdAt;
    }

    public int getAssessmentId() { return assessmentId; }
    public void setAssessmentId(int assessmentId) { this.assessmentId = assessmentId; }

    public Integer getMentorId() { return mentorId; }
    public void setMentorId(Integer mentorId) { this.mentorId = mentorId; }

    public String getMentorName() { return mentorName; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTargetDept() { return targetDept; }
    public void setTargetDept(String targetDept) { this.targetDept = targetDept; }

    public String getTestLink() { return testLink; }
    public void setTestLink(String testLink) { this.testLink = testLink; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }

    public int getCompletedCount() { return completedCount; }
    public void setCompletedCount(int completedCount) { this.completedCount = completedCount; }
}
