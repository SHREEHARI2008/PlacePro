package com.campus.placement.controller;

import com.campus.placement.util.HttpUtils;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;

public class ApiRouter implements HttpHandler {
    private final AuthController authController = new AuthController();
    private final StudentController studentController = new StudentController();
    private final CompanyController companyController = new CompanyController();
    private final LeetCodeController leetCodeController = new LeetCodeController();
    private final MentorController mentorController = new MentorController();
    private final UserController userController = new UserController();
    private final AssessmentController assessmentController = new AssessmentController();
    private final NotificationController notificationController = new NotificationController();
    private final SkillBoosterController skillBoosterController = new SkillBoosterController();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (HttpUtils.handlePreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();
        System.out.printf("[%s] %s %s%n", method, path, exchange.getRequestURI().getQuery() != null ? "?" + exchange.getRequestURI().getQuery() : "");

        try {
            // 1. Check if public route
            boolean isPublic = path.startsWith("/api/auth/login") ||
                               path.startsWith("/api/auth/register") ||
                               "/api/health".equals(path) ||
                               path.equals("/api/mentors") ||
                               path.equals("/api/mentor/all") ||
                               path.startsWith("/api/notifications") ||
                               path.startsWith("/api/skill-booster") ||
                               path.startsWith("/api/leetcode/leaderboard");

            if (!isPublic && !path.startsWith("/api/auth/logout")) {
                String token = com.campus.placement.util.SessionManager.extractToken(exchange);
                com.campus.placement.util.SessionManager.UserSession session = com.campus.placement.util.SessionManager.getSession(token);

                // Check authentication
                if (session == null) {
                    // Send 401 Unauthorized
                    exchange.getResponseHeaders().set("Content-Type", "application/json");
                    String errJson = "{\"success\":false,\"error\":\"Authentication required. Please sign in.\",\"redirect\":\"/login\"}";
                    byte[] bytes = errJson.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                    exchange.sendResponseHeaders(401, bytes.length);
                    try (java.io.OutputStream os = exchange.getResponseBody()) {
                        os.write(bytes);
                    }
                    return;
                }

                // Check role authorization
                if (path.startsWith("/api/mentor") && !path.equals("/api/mentors") && !path.equals("/api/mentor/all")) {
                    if (!"MENTOR".equalsIgnoreCase(session.getRole())) {
                        exchange.getResponseHeaders().set("Content-Type", "application/json");
                        String errJson = "{\"success\":false,\"error\":\"Access Denied: Only Mentors can access Mentor Workspace tools.\",\"redirect\":\"/student/dashboard\"}";
                        byte[] bytes = errJson.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                        exchange.sendResponseHeaders(403, bytes.length);
                        try (java.io.OutputStream os = exchange.getResponseBody()) {
                            os.write(bytes);
                        }
                        return;
                    }
                } else if (path.startsWith("/api/student")) {
                    if ("MENTOR".equalsIgnoreCase(session.getRole())) {
                        boolean isInspectionRoute = path.equals("/api/student/dashboard") || path.equals("/api/student/profile") || path.equals("/api/student/academics");
                        if (!isInspectionRoute || !"GET".equalsIgnoreCase(method)) {
                            exchange.getResponseHeaders().set("Content-Type", "application/json");
                            String errJson = "{\"success\":false,\"error\":\"Access Denied: Mentors cannot modify Student Workspace directly.\",\"redirect\":\"/mentor/dashboard\"}";
                            byte[] bytes = errJson.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                            exchange.sendResponseHeaders(403, bytes.length);
                            try (java.io.OutputStream os = exchange.getResponseBody()) {
                                os.write(bytes);
                            }
                            return;
                        }
                    }
                } else if (path.startsWith("/api/assessments") && !path.endsWith("/toggle-completion") && ("POST".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method))) {
                    if (!"MENTOR".equalsIgnoreCase(session.getRole())) {
                        exchange.getResponseHeaders().set("Content-Type", "application/json");
                        String errJson = "{\"success\":false,\"error\":\"Access Denied: Only Mentors can post or delete assessments.\",\"redirect\":\"/student/dashboard\"}";
                        byte[] bytes = errJson.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                        exchange.sendResponseHeaders(403, bytes.length);
                        try (java.io.OutputStream os = exchange.getResponseBody()) {
                            os.write(bytes);
                        }
                        return;
                    }
                }
            }

            if (path.startsWith("/api/auth")) {
                authController.handle(exchange);
            } else if (path.startsWith("/api/user")) {
                userController.handle(exchange);
            } else if (path.equals("/api/mentor/skill-booster")) {
                skillBoosterController.handle(exchange);
            } else if (path.startsWith("/api/mentors") || path.startsWith("/api/mentor")) {
                mentorController.handle(exchange);
            } else if (path.startsWith("/api/student/skill-booster")) {
                skillBoosterController.handle(exchange);
            } else if (path.startsWith("/api/student")) {
                studentController.handle(exchange);
            } else if (path.startsWith("/api/skill-booster")) {
                skillBoosterController.handle(exchange);
            } else if (path.startsWith("/api/companies") || path.startsWith("/api/applications")) {
                companyController.handle(exchange);
            } else if (path.startsWith("/api/leetcode")) {
                leetCodeController.handle(exchange);
            } else if (path.startsWith("/api/assessments")) {
                assessmentController.handle(exchange);
            } else if (path.startsWith("/api/notifications")) {
                notificationController.handle(exchange);
            } else if ("/api/health".equals(path)) {
                HttpUtils.sendSuccessResponse(exchange, "Campus Placement API is running smoothly", "OK");
            } else {
                HttpUtils.sendErrorResponse(exchange, 404, "API route not found: " + path);
            }
        } catch (Exception e) {
            e.printStackTrace();
            HttpUtils.sendErrorResponse(exchange, 500, "Internal Server Error: " + e.getMessage());
        }
    }
}
