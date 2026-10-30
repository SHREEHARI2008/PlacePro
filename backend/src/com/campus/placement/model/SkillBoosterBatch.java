package com.campus.placement.model;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

/**
 * Model representing a global active batch of 6 daily challenge questions in Skill Booster.
 */
public class SkillBoosterBatch {
    private int id;
    private Integer updatedByMentorId;
    private String updatedByMentorName;
    private boolean isActive;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    private List<SkillBoosterQuestion> questions = new ArrayList<>();
    private int completedCount;
    private int totalCount = 6;
    private int progressPercentage;

    public SkillBoosterBatch() {}

    public SkillBoosterBatch(int id, Integer updatedByMentorId, String updatedByMentorName, boolean isActive, Timestamp createdAt, Timestamp updatedAt) {
        this.id = id;
        this.updatedByMentorId = updatedByMentorId;
        this.updatedByMentorName = updatedByMentorName;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public Integer getUpdatedByMentorId() { return updatedByMentorId; }
    public void setUpdatedByMentorId(Integer updatedByMentorId) { this.updatedByMentorId = updatedByMentorId; }

    public String getUpdatedByMentorName() { return updatedByMentorName; }
    public void setUpdatedByMentorName(String updatedByMentorName) { this.updatedByMentorName = updatedByMentorName; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }

    public List<SkillBoosterQuestion> getQuestions() { return questions; }
    public void setQuestions(List<SkillBoosterQuestion> questions) {
        this.questions = questions;
        if (questions != null) {
            this.totalCount = questions.size();
        }
    }

    public int getCompletedCount() { return completedCount; }
    public void setCompletedCount(int completedCount) {
        this.completedCount = completedCount;
        if (this.totalCount > 0) {
            this.progressPercentage = (int) Math.round(((double) completedCount / this.totalCount) * 100.0);
        } else {
            this.progressPercentage = 0;
        }
    }

    public int getTotalCount() { return totalCount; }
    public void setTotalCount(int totalCount) { this.totalCount = totalCount; }

    public int getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(int progressPercentage) { this.progressPercentage = progressPercentage; }
}
