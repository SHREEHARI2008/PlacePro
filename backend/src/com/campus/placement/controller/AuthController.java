package com.campus.placement.controller;

import com.campus.placement.service.AuthService;
import com.campus.placement.util.HttpUtils;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class AuthController {
    private final AuthService authService = new AuthService();

    public void handle(HttpExchange exchange) throws IOException {
        if (HttpUtils.handlePreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();

        if ("POST".equalsIgnoreCase(method) && path.endsWith("/login")) {
            handleLogin(exchange);
        } else if ("POST".equalsIgnoreCase(method) && path.endsWith("/register")) {
            handleRegister(exchange);
        } else if ("POST".equalsIgnoreCase(method) && path.endsWith("/logout")) {
            handleLogout(exchange);
        } else {
            HttpUtils.sendErrorResponse(exchange, 404, "Endpoint not found");
        }
    }

    private void handleLogin(HttpExchange exchange) throws IOException {
        String body = HttpUtils.readRequestBody(exchange);
        JsonObject json = JsonParser.parseString(body).getAsJsonObject();
        String email = json.has("email") ? json.get("email").getAsString() : "";
        String password = json.has("password") ? json.get("password").getAsString() : "";

        Map<String, Object> result = authService.login(email, password);
        if (result != null) {
            HttpUtils.sendSuccessResponse(exchange, "Login successful", result);
        } else {
            HttpUtils.sendErrorResponse(exchange, 401, "Invalid email or password");
        }
    }

    private void handleRegister(HttpExchange exchange) throws IOException {
        String body = HttpUtils.readRequestBody(exchange);
        JsonObject json = JsonParser.parseString(body).getAsJsonObject();
        Map<String, Object> map = new HashMap<>();

        for (String key : json.keySet()) {
            if (json.get(key).isJsonPrimitive()) {
                if (json.get(key).getAsJsonPrimitive().isNumber()) {
                    map.put(key, json.get(key).getAsNumber());
                } else if (json.get(key).getAsJsonPrimitive().isBoolean()) {
                    map.put(key, json.get(key).getAsBoolean());
                } else {
                    map.put(key, json.get(key).getAsString());
                }
            }
        }

        try {
            Map<String, Object> result = authService.register(map);
            HttpUtils.sendSuccessResponse(exchange, "User registered successfully", result);
        } catch (Exception e) {
            HttpUtils.sendErrorResponse(exchange, 400, e.getMessage());
        }
    }

    private void handleLogout(HttpExchange exchange) throws IOException {
        String token = com.campus.placement.util.SessionManager.extractToken(exchange);
        if (token != null) {
            com.campus.placement.util.SessionManager.invalidate(token);
        }
        HttpUtils.sendSuccessResponse(exchange, "Session successfully invalidated", null);
    }
}
