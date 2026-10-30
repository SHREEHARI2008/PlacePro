package com.campus.placement.model;

import java.sql.Timestamp;

public class Notification {
    private int notificationId;
    private Integer userId;
    private String category; // 'MENTOR_FEEDBACK', 'DRIVE_UPDATE', 'DRIVE_STATUS'
    private String title;
    private String message;
    private Integer referenceId;
    private boolean isRead;
    private Timestamp createdAt;

    public Notification() {}

    public Notification(int notificationId, Integer userId, String category, String title,
                        String message, Integer referenceId, boolean isRead, Timestamp createdAt) {
        this.notificationId = notificationId;
        this.userId = userId;
        this.category = category;
        this.title = title;
        this.message = message;
        this.referenceId = referenceId;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public Notification(Integer userId, String category, String title, String message, Integer referenceId) {
        this.userId = userId;
        this.category = category;
        this.title = title;
        this.message = message;
        this.referenceId = referenceId;
        this.isRead = false;
    }

    public int getNotificationId() {
        return notificationId;
    }

    public void setNotificationId(int notificationId) {
        this.notificationId = notificationId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Integer getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Integer referenceId) {
        this.referenceId = referenceId;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
