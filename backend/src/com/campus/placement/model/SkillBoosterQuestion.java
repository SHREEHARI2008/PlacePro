package com.campus.placement.model;

import java.sql.Timestamp;

/**
 * Model representing a single daily challenge question in a Skill Booster batch.
 */
public class SkillBoosterQuestion {
    private int id;
    private int batchId;
    private int questionNumber; // 1 to 6
    private String title;
    private String problemLink;
    private Timestamp createdAt;
    private boolean isCompleted;
    private Timestamp completedAt;

    public SkillBoosterQuestion() {}

    public SkillBoosterQuestion(int questionNumber, String title, String problemLink) {
        this.questionNumber = questionNumber;
        this.title = title;
        this.problemLink = problemLink;
    }

    public SkillBoosterQuestion(int id, int batchId, int questionNumber, String title, String problemLink, Timestamp createdAt) {
        this.id = id;
        this.batchId = batchId;
        this.questionNumber = questionNumber;
        this.title = title;
        this.problemLink = problemLink;
        this.createdAt = createdAt;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getBatchId() { return batchId; }
    public void setBatchId(int batchId) { this.batchId = batchId; }

    public int getQuestionNumber() { return questionNumber; }
    public void setQuestionNumber(int questionNumber) { this.questionNumber = questionNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getProblemLink() { return problemLink; }
    public void setProblemLink(String problemLink) { this.problemLink = problemLink; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) { isCompleted = completed; }

    public Timestamp getCompletedAt() { return completedAt; }
    public void setCompletedAt(Timestamp completedAt) { this.completedAt = completedAt; }
}
