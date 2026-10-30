package com.campus.placement.controller;

import com.campus.placement.dao.SkillBoosterDAO;
import com.campus.placement.dao.StudentDAO;
import com.campus.placement.model.SkillBoosterBatch;
import com.campus.placement.model.SkillBoosterQuestion;
import com.campus.placement.model.Student;
import com.campus.placement.util.HttpUtils;
import com.campus.placement.util.SessionManager;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Controller handling Skill Booster endpoints:
 * - GET /api/skill-booster/current
 * - POST /api/mentor/skill-booster
 * - PATCH or POST /api/student/skill-booster/toggle
 */
public class SkillBoosterController implements HttpHandler {
    private final SkillBoosterDAO skillBoosterDAO = new SkillBoosterDAO();
    private final StudentDAO studentDAO = new StudentDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (HttpUtils.handlePreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod().toUpperCase();
        Map<String, String> params = HttpUtils.parseQueryParams(exchange.getRequestURI().getQuery());

        try {
            // 1. GET /api/skill-booster/current
            if ("GET".equals(method) && (path.endsWith("/current") || path.equals("/api/skill-booster"))) {
                int studentId = resolveStudentId(exchange, params, null);
                SkillBoosterBatch batch = skillBoosterDAO.getActiveBatch(studentId);
                if (batch != null) {
                    HttpUtils.sendSuccessResponse(exchange, "Current Skill Booster challenge retrieved", batch);
                } else {
                    HttpUtils.sendErrorResponse(exchange, 404, "No active Skill Booster challenge found");
                }
            }
            // 2. POST /api/mentor/skill-booster (publish new 6-question batch)
            else if ("POST".equals(method) && (path.endsWith("/mentor/skill-booster") || path.endsWith("/skill-booster/publish"))) {
                handlePublishBatch(exchange);
            }
            // 3. PATCH or POST /api/student/skill-booster/toggle (toggle completion)
            else if (("PATCH".equals(method) || "POST".equals(method)) && path.endsWith("/toggle")) {
                handleToggleProgress(exchange, params);
            }
            else {
                HttpUtils.sendErrorResponse(exchange, 404, "Skill Booster endpoint not found: " + method + " " + path);
            }
        } catch (IllegalArgumentException e) {
            HttpUtils.sendErrorResponse(exchange, 400, e.getMessage());
        } catch (Exception e) {
            System.err.println("SkillBoosterController error: " + e.getMessage());
            e.printStackTrace();
            HttpUtils.sendErrorResponse(exchange, 500, "Internal Server Error: " + e.getMessage());
        }
    }

    private void handlePublishBatch(HttpExchange exchange) throws IOException {
        String body = HttpUtils.readRequestBody(exchange);
        if (body == null || body.trim().isEmpty()) {
            HttpUtils.sendErrorResponse(exchange, 400, "Request body is required");
            return;
        }

        JsonObject json = JsonParser.parseString(body).getAsJsonObject();

        // Resolve mentor ID
        int mentorId = 0;
        if (json.has("mentorId") && !json.get("mentorId").isJsonNull()) {
            mentorId = json.get("mentorId").getAsInt();
        } else {
            String token = SessionManager.extractToken(exchange);
            SessionManager.UserSession session = SessionManager.getSession(token);
            if (session != null && session.getMentorId() != null) {
                mentorId = session.getMentorId();
            }
        }

        if (!json.has("questions") || !json.get("questions").isJsonArray()) {
            HttpUtils.sendErrorResponse(exchange, 400, "Field 'questions' array is required with exactly 6 questions");
            return;
        }

        JsonArray arr = json.getAsJsonArray("questions");
        if (arr.size() != 6) {
            HttpUtils.sendErrorResponse(exchange, 400, "Exactly 6 questions must be submitted. Received: " + arr.size());
            return;
        }

        List<SkillBoosterQuestion> questions = new ArrayList<>();
        for (int i = 0; i < arr.size(); i++) {
            JsonObject qObj = arr.get(i).getAsJsonObject();
            String title = "";
            if (qObj.has("title") && !qObj.get("title").isJsonNull()) {
                title = qObj.get("title").getAsString();
            } else if (qObj.has("name") && !qObj.get("name").isJsonNull()) {
                title = qObj.get("name").getAsString();
            }

            String link = "";
            if (qObj.has("problemLink") && !qObj.get("problemLink").isJsonNull()) {
                link = qObj.get("problemLink").getAsString();
            } else if (qObj.has("link") && !qObj.get("link").isJsonNull()) {
                link = qObj.get("link").getAsString();
            } else if (qObj.has("url") && !qObj.get("url").isJsonNull()) {
                link = qObj.get("url").getAsString();
            }

            if (title.trim().isEmpty()) {
                HttpUtils.sendErrorResponse(exchange, 400, "Question #" + (i + 1) + " must have a non-empty name/title.");
                return;
            }
            if (link.trim().isEmpty()) {
                HttpUtils.sendErrorResponse(exchange, 400, "Question #" + (i + 1) + " must have a valid problem link.");
                return;
            }

            questions.add(new SkillBoosterQuestion(i + 1, title.trim(), link.trim()));
        }

        SkillBoosterBatch newBatch = skillBoosterDAO.publishNewBatch(mentorId, questions);
        HttpUtils.sendSuccessResponse(exchange, "Daily Skill Booster 6-question set published successfully", newBatch);
    }

    private void handleToggleProgress(HttpExchange exchange, Map<String, String> params) throws IOException {
        String body = HttpUtils.readRequestBody(exchange);
        JsonObject json = (body != null && !body.trim().isEmpty()) ? JsonParser.parseString(body).getAsJsonObject() : new JsonObject();

        int studentId = resolveStudentId(exchange, params, json);
        if (studentId <= 0) {
            HttpUtils.sendErrorResponse(exchange, 400, "Student identification required to update Skill Booster progress");
            return;
        }

        int questionNumber = 0;
        if (json.has("questionNumber")) {
            questionNumber = json.get("questionNumber").getAsInt();
        } else if (params.containsKey("questionNumber")) {
            questionNumber = Integer.parseInt(params.get("questionNumber"));
        }

        if (questionNumber < 1 || questionNumber > 6) {
            HttpUtils.sendErrorResponse(exchange, 400, "Invalid questionNumber: must be between 1 and 6. Received: " + questionNumber);
            return;
        }

        int batchId = 0;
        if (json.has("batchId")) {
            batchId = json.get("batchId").getAsInt();
        } else if (params.containsKey("batchId")) {
            batchId = Integer.parseInt(params.get("batchId"));
        }

        Boolean requestedState = null;
        if (json.has("isCompleted") && !json.get("isCompleted").isJsonNull()) {
            requestedState = json.get("isCompleted").getAsBoolean();
        } else if (json.has("completed") && !json.get("completed").isJsonNull()) {
            requestedState = json.get("completed").getAsBoolean();
        }

        Map<String, Object> progress = skillBoosterDAO.toggleStudentProgress(studentId, batchId, questionNumber, requestedState);
        HttpUtils.sendSuccessResponse(exchange, "Skill Booster question progress updated", progress);
    }

    private int resolveStudentId(HttpExchange exchange, Map<String, String> params, JsonObject json) {
        if (json != null) {
            if (json.has("studentId") && !json.get("studentId").isJsonNull()) {
                return json.get("studentId").getAsInt();
            }
            if (json.has("userId") && !json.get("userId").isJsonNull()) {
                int uid = json.get("userId").getAsInt();
                Student s = studentDAO.findByUserId(uid);
                if (s != null) return s.getStudentId();
            }
        }

        if (params != null) {
            if (params.containsKey("studentId")) {
                try { return Integer.parseInt(params.get("studentId")); } catch (Exception ignored) {}
            }
            if (params.containsKey("userId")) {
                try {
                    int uid = Integer.parseInt(params.get("userId"));
                    Student s = studentDAO.findByUserId(uid);
                    if (s != null) return s.getStudentId();
                } catch (Exception ignored) {}
            }
        }

        String token = SessionManager.extractToken(exchange);
        if (token != null) {
            SessionManager.UserSession session = SessionManager.getSession(token);
            if (session != null) {
                if (session.getStudentId() != null && session.getStudentId() > 0) {
                    return session.getStudentId();
                }
                Student s = studentDAO.findByUserId(session.getUserId());
                if (s != null) return s.getStudentId();
            }
        }

        return -1;
    }
}
