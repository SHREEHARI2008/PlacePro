package com.campus.placement.model;

import java.sql.Timestamp;

public class LeetCodeStats {
    private int id;
    private int studentId;
    private String username;
    private int totalSolved;
    private int easySolved;
    private int mediumSolved;
    private int hardSolved;
    
    // Platform totals for progress percentages
    private int totalEasyQuestions = 960;
    private int totalMediumQuestions = 2100;
    private int totalHardQuestions = 970;
    private int totalQuestions = 4030;

    private double acceptanceRate;
    private int globalRanking;
    private int streakDays;
    private int maxStreak;
    private int totalActiveDays;
    private String submissionCalendar;
    private int reputation;
    private String avatarUrl;
    private String topicStatsJson;
    private String recentSubmissionsJson;
    private String badgesJson;
    private boolean isLive = false;
    private boolean solvedToday = false;
    private Timestamp lastSyncedAt;

    public LeetCodeStats() {}

    public LeetCodeStats(int id, int studentId, String username, int totalSolved, int easySolved, int mediumSolved,
                         int hardSolved, double acceptanceRate, int globalRanking, int streakDays,
                         String topicStatsJson, Timestamp lastSyncedAt) {
        this.id = id;
        this.studentId = studentId;
        this.username = username;
        this.totalSolved = totalSolved;
        this.easySolved = easySolved;
        this.mediumSolved = mediumSolved;
        this.hardSolved = hardSolved;
        this.acceptanceRate = acceptanceRate;
        this.globalRanking = globalRanking;
        this.streakDays = streakDays;
        this.topicStatsJson = topicStatsJson;
        this.lastSyncedAt = lastSyncedAt;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public int getTotalSolved() { return totalSolved; }
    public void setTotalSolved(int totalSolved) { this.totalSolved = totalSolved; }

    public int getEasySolved() { return easySolved; }
    public void setEasySolved(int easySolved) { this.easySolved = easySolved; }

    public int getMediumSolved() { return mediumSolved; }
    public void setMediumSolved(int mediumSolved) { this.mediumSolved = mediumSolved; }

    public int getHardSolved() { return hardSolved; }
    public void setHardSolved(int hardSolved) { this.hardSolved = hardSolved; }

    public int getTotalEasyQuestions() { return totalEasyQuestions; }
    public void setTotalEasyQuestions(int totalEasyQuestions) { this.totalEasyQuestions = totalEasyQuestions; }

    public int getTotalMediumQuestions() { return totalMediumQuestions; }
    public void setTotalMediumQuestions(int totalMediumQuestions) { this.totalMediumQuestions = totalMediumQuestions; }

    public int getTotalHardQuestions() { return totalHardQuestions; }
    public void setTotalHardQuestions(int totalHardQuestions) { this.totalHardQuestions = totalHardQuestions; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public double getAcceptanceRate() { return acceptanceRate; }
    public void setAcceptanceRate(double acceptanceRate) { this.acceptanceRate = acceptanceRate; }

    public int getGlobalRanking() { return globalRanking; }
    public void setGlobalRanking(int globalRanking) { this.globalRanking = globalRanking; }

    public int getStreakDays() { return streakDays; }
    public void setStreakDays(int streakDays) { this.streakDays = streakDays; }

    public int getMaxStreak() {
        if (maxStreak > 0) return maxStreak;
        if (streakDays > 0 && maxStreak == 0) return Math.max(streakDays, computeMaxStreak(submissionCalendar, streakDays));
        return computeMaxStreak(submissionCalendar, streakDays);
    }
    public void setMaxStreak(int maxStreak) { this.maxStreak = maxStreak; }

    public int getTotalActiveDays() { return totalActiveDays; }
    public void setTotalActiveDays(int totalActiveDays) { this.totalActiveDays = totalActiveDays; }

    public String getSubmissionCalendar() { return submissionCalendar; }
    public void setSubmissionCalendar(String submissionCalendar) { this.submissionCalendar = submissionCalendar; }

    public int getReputation() { return reputation; }
    public void setReputation(int reputation) { this.reputation = reputation; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getTopicStatsJson() { return topicStatsJson; }
    public void setTopicStatsJson(String topicStatsJson) { this.topicStatsJson = topicStatsJson; }

    public String getRecentSubmissionsJson() { return recentSubmissionsJson; }
    public void setRecentSubmissionsJson(String recentSubmissionsJson) { this.recentSubmissionsJson = recentSubmissionsJson; }

    public String getBadgesJson() { return badgesJson; }
    public void setBadgesJson(String badgesJson) { this.badgesJson = badgesJson; }

    public boolean isLive() { return isLive; }
    public void setLive(boolean live) { isLive = live; }

    public boolean isSolvedToday() {
        if (solvedToday) return true;
        return computeSolvedToday(submissionCalendar);
    }

    public void setSolvedToday(boolean solvedToday) {
        this.solvedToday = solvedToday;
    }

    public static boolean computeSolvedToday(String calendarJson) {
        if (calendarJson == null || calendarJson.trim().isEmpty() || calendarJson.equals("{}")) {
            return false;
        }
        try {
            long nowSec = System.currentTimeMillis() / 1000;
            com.google.gson.JsonElement calElem = com.google.gson.JsonParser.parseString(calendarJson);
            if (calElem.isJsonObject()) {
                com.google.gson.JsonObject calObj = calElem.getAsJsonObject();
                java.time.LocalDate today = java.time.LocalDate.now();
                java.time.LocalDate yesterday = today.minusDays(1);
                for (String key : calObj.keySet()) {
                    try {
                        long timestamp = Long.parseLong(key);
                        int count = calObj.get(key).getAsInt();
                        if (count > 0 && Math.abs(nowSec - timestamp) <= 86400 * 3) {
                            java.time.LocalDate subDate = java.time.Instant.ofEpochSecond(timestamp).atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                            java.time.LocalDate subDateUtc = java.time.Instant.ofEpochSecond(timestamp).atZone(java.time.ZoneOffset.UTC).toLocalDate();
                            if (subDate.equals(today) || subDateUtc.equals(today)) {
                                return true;
                            }
                            // Also if submitted within last 24 hours
                            if (nowSec - timestamp >= 0 && nowSec - timestamp <= 86400) {
                                return true;
                            }
                        }
                    } catch (Exception ignored) {}
                }
            }
        } catch (Exception ignored) {}
        return false;
    }

    public static int computeMaxStreak(String calendarJson, int currentStreak) {
        if (calendarJson == null || calendarJson.trim().isEmpty() || calendarJson.equals("{}")) {
            return currentStreak;
        }
        try {
            com.google.gson.JsonElement elem = com.google.gson.JsonParser.parseString(calendarJson);
            if (elem.isJsonObject()) {
                com.google.gson.JsonObject obj = elem.getAsJsonObject();
                java.util.TreeSet<java.time.LocalDate> dates = new java.util.TreeSet<>();
                for (String key : obj.keySet()) {
                    try {
                        if (obj.get(key).getAsInt() > 0) {
                            long ts = Long.parseLong(key);
                            dates.add(java.time.Instant.ofEpochSecond(ts).atZone(java.time.ZoneOffset.UTC).toLocalDate());
                        }
                    } catch (Exception ignored) {}
                }
                int maxS = 0;
                int curS = 0;
                java.time.LocalDate prev = null;
                for (java.time.LocalDate d : dates) {
                    if (prev != null && d.equals(prev.plusDays(1))) {
                        curS++;
                    } else {
                        curS = 1;
                    }
                    if (curS > maxS) maxS = curS;
                    prev = d;
                }
                return Math.max(maxS, currentStreak);
            }
        } catch (Exception ignored) {}
        return currentStreak;
    }

    public Timestamp getLastSyncedAt() { return lastSyncedAt; }
    public void setLastSyncedAt(Timestamp lastSyncedAt) { this.lastSyncedAt = lastSyncedAt; }
}
