package com.campus.placement.model;

import java.sql.Timestamp;

/**
 * Base User model demonstrating Encapsulation and Inheritance.
 */
public class User {
    protected int id;
    protected String name;
    protected String email;
    protected String passwordHash;
    protected String role; // "STUDENT" or "MENTOR"
    protected String avatarUrl;
    protected String phoneNumber;
    protected Timestamp createdAt;

    public User() {}

    public User(int id, String name, String email, String passwordHash, String role, String avatarUrl, Timestamp createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.avatarUrl = avatarUrl;
        this.createdAt = createdAt;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
