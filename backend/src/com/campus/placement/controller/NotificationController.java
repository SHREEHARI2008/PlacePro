package com.campus.placement.controller;

import com.campus.placement.dao.NotificationDAO;
import com.campus.placement.dao.StudentDAO;
import com.campus.placement.model.Notification;
import com.campus.placement.model.Student;
import com.campus.placement.util.HttpUtils;
import com.campus.placement.util.SessionManager;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller / Servlet for Notification alerts & status tracking.
 */
public class NotificationController implements HttpHandler {
    private final NotificationDAO notificationDAO = new NotificationDAO();
    private final StudentDAO studentDAO = new StudentDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (HttpUtils.handlePreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();
        Map<String, String> params = HttpUtils.parseQueryParams(exchange.getRequestURI().getQuery());

        try {
            // Resolve target user ID from query param, studentId, or session token
            int resolvedUserId = resolveUserId(exchange, params);

            // GET /api/notifications
            if ("GET".equalsIgnoreCase(method)) {
                List<Notification> notifications = notificationDAO.getNotificationsByUserId(resolvedUserId);
                int unreadCount = notificationDAO.getUnreadCount(resolvedUserId);

                Map<String, Object> data = new HashMap<>();
                data.put("notifications", notifications);
                data.put("unreadCount", unreadCount);

                HttpUtils.sendSuccessResponse(exchange, "Notifications retrieved successfully", data);
            }
            // POST /api/notifications/read (mark single notification as read)
            else if ("POST".equalsIgnoreCase(method) && path.endsWith("/read")) {
                String body = HttpUtils.readRequestBody(exchange);
                int notificationId = 0;
                if (body != null && !body.trim().isEmpty()) {
                    JsonObject json = JsonParser.parseString(body).getAsJsonObject();
                    if (json.has("notificationId")) {
                        notificationId = json.get("notificationId").getAsInt();
                    }
                }
                if (notificationId <= 0 && params.containsKey("notificationId")) {
                    notificationId = Integer.parseInt(params.get("notificationId"));
                }

                if (notificationId > 0) {
                    boolean ok = notificationDAO.markAsRead(notificationId);
                    int remainingUnread = notificationDAO.getUnreadCount(resolvedUserId);
                    Map<String, Object> res = new HashMap<>();
                    res.put("notificationId", notificationId);
                    res.put("unreadCount", remainingUnread);
                    HttpUtils.sendSuccessResponse(exchange, "Notification marked as read", res);
                } else {
                    HttpUtils.sendErrorResponse(exchange, 400, "Valid notificationId is required");
                }
            }
            // POST /api/notifications/read-all (mark all notifications for user as read)
            else if ("POST".equalsIgnoreCase(method) && path.endsWith("/read-all")) {
                boolean ok = notificationDAO.markAllAsRead(resolvedUserId);
                Map<String, Object> res = new HashMap<>();
                res.put("userId", resolvedUserId);
                res.put("unreadCount", 0);
                HttpUtils.sendSuccessResponse(exchange, "All notifications marked as read", res);
            }
            // POST /api/notifications (create a notification)
            else if ("POST".equalsIgnoreCase(method)) {
                String body = HttpUtils.readRequestBody(exchange);
                Notification n = HttpUtils.gson.fromJson(body, Notification.class);
                int id = notificationDAO.createNotification(n);
                if (id > 0) {
                    n.setNotificationId(id);
                    HttpUtils.sendSuccessResponse(exchange, "Notification created successfully", n);
                } else {
                    HttpUtils.sendErrorResponse(exchange, 400, "Failed to create notification");
                }
            } else {
                HttpUtils.sendErrorResponse(exchange, 404, "Notification endpoint not found: " + path);
            }
        } catch (Exception e) {
            e.printStackTrace();
            HttpUtils.sendErrorResponse(exchange, 500, "Internal Server Error: " + e.getMessage());
        }
    }

    private int resolveUserId(HttpExchange exchange, Map<String, String> params) {
        if (params.containsKey("userId")) {
            try {
                return Integer.parseInt(params.get("userId"));
            } catch (Exception ignored) {}
        }
        if (params.containsKey("studentId")) {
            try {
                int sId = Integer.parseInt(params.get("studentId"));
                Student s = studentDAO.findById(sId);
                if (s != null) {
                    return s.getId(); // user_id in users table
                }
                return sId;
            } catch (Exception ignored) {}
        }

        // Try extracting from session
        String token = SessionManager.extractToken(exchange);
        SessionManager.UserSession session = SessionManager.getSession(token);
        if (session != null) {
            return session.getUserId();
        }
        return 0; // Broadcast / default
    }
}
