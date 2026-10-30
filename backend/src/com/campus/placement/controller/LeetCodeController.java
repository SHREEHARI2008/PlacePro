package com.campus.placement.controller;

import com.campus.placement.model.LeetCodeStats;
import com.campus.placement.service.LeetCodeService;
import com.campus.placement.util.HttpUtils;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.Map;

public class LeetCodeController {
    private final LeetCodeService leetCodeService = new LeetCodeService();

    public void handle(HttpExchange exchange) throws IOException {
        if (HttpUtils.handlePreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();
        Map<String, String> params = HttpUtils.parseQueryParams(exchange.getRequestURI().getQuery());

        try {
            // GET /api/leetcode/stats?studentId=1
            if ("GET".equalsIgnoreCase(method) && path.endsWith("/stats")) {
                int studentId = Integer.parseInt(params.getOrDefault("studentId", "1"));
                LeetCodeStats stats = leetCodeService.getStatsByStudentId(studentId);
                HttpUtils.sendSuccessResponse(exchange, "LeetCode stats retrieved", stats);
            }
            // POST /api/leetcode/sync
            else if ("POST".equalsIgnoreCase(method) && path.endsWith("/sync")) {
                String body = HttpUtils.readRequestBody(exchange);
                JsonObject json = JsonParser.parseString(body).getAsJsonObject();
                int studentId = json.get("studentId").getAsInt();
                String username = json.has("username") ? json.get("username").getAsString() : "";
                LeetCodeStats stats = leetCodeService.syncLeetCodeHandle(studentId, username);
                HttpUtils.sendSuccessResponse(exchange, "LeetCode profile synced successfully", stats);
            }
            // GET /api/leetcode/leaderboard
            else if ("GET".equalsIgnoreCase(method) && path.endsWith("/leaderboard")) {
                HttpUtils.sendSuccessResponse(exchange, "Leaderboard retrieved", leetCodeService.getLeaderboard());
            }
            // GET /api/leetcode/skill-boost?studentId=1
            else if ("GET".equalsIgnoreCase(method) && path.endsWith("/skill-boost")) {
                int studentId = Integer.parseInt(params.getOrDefault("studentId", "1"));
                HttpUtils.sendSuccessResponse(exchange, "Skill boost recommendations retrieved", leetCodeService.getSkillBoostRecommendations(studentId));
            } else {
                HttpUtils.sendErrorResponse(exchange, 404, "LeetCode endpoint not found");
            }
        } catch (Exception e) {
            HttpUtils.sendErrorResponse(exchange, 500, e.getMessage());
        }
    }
}
