package com.campus.placement.util;

import com.sun.net.httpserver.HttpExchange;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Enterprise session manager for strict role & session guarding.
 */
public class SessionManager {
    public static class UserSession {
        private final String token;
        private final int userId;
        private final String email;
        private final String role;
        private final Integer studentId;
        private final Integer mentorId;
        private final long createdAt;
        private long lastAccessTime;

        public UserSession(String token, int userId, String email, String role, Integer studentId, Integer mentorId) {
            this.token = token;
            this.userId = userId;
            this.email = email;
            this.role = role != null ? role.toUpperCase() : "STUDENT";
            this.studentId = studentId;
            this.mentorId = mentorId;
            this.createdAt = System.currentTimeMillis();
            this.lastAccessTime = this.createdAt;
        }

        public String getToken() { return token; }
        public int getUserId() { return userId; }
        public String getEmail() { return email; }
        public String getRole() { return role; }
        public Integer getStudentId() { return studentId; }
        public Integer getMentorId() { return mentorId; }
        public long getCreatedAt() { return createdAt; }
        public long getLastAccessTime() { return lastAccessTime; }

        public void touch() {
            this.lastAccessTime = System.currentTimeMillis();
        }
    }

    private static final Map<String, UserSession> SESSIONS = new ConcurrentHashMap<>();

    public static String createSession(int userId, String email, String role, Integer studentId, Integer mentorId) {
        String token = "placepro_" + UUID.randomUUID().toString().replace("-", "");
        UserSession session = new UserSession(token, userId, email, role, studentId, mentorId);
        SESSIONS.put(token, session);
        return token;
    }

    public static UserSession getSession(String token) {
        if (token == null || token.trim().isEmpty()) return null;
        UserSession s = SESSIONS.get(token.trim());
        if (s != null) {
            s.touch();
        }
        return s;
    }

    public static void invalidate(String token) {
        if (token != null) {
            SESSIONS.remove(token.trim());
        }
    }

    public static String extractToken(HttpExchange exchange) {
        // 1. Authorization header: Bearer <token>
        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return authHeader.substring(7).trim();
        }

        // 2. Custom header: X-Session-Token
        String customHeader = exchange.getRequestHeaders().getFirst("X-Session-Token");
        if (customHeader != null && !customHeader.trim().isEmpty()) {
            return customHeader.trim();
        }

        // 3. Query parameter: ?token=...
        String query = exchange.getRequestURI().getQuery();
        if (query != null) {
            Map<String, String> qp = HttpUtils.parseQueryParams(query);
            if (qp.containsKey("token")) {
                return qp.get("token");
            }
        }

        return null;
    }
}
