package com.campus.placement.controller;

import com.campus.placement.model.MentorFeedback;
import com.campus.placement.service.MentorService;
import com.campus.placement.util.HttpUtils;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.Map;

public class MentorController {
    private final MentorService mentorService = new MentorService();

    public void handle(HttpExchange exchange) throws IOException {
        if (HttpUtils.handlePreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();
        Map<String, String> params = HttpUtils.parseQueryParams(exchange.getRequestURI().getQuery());

        try {
            // GET /api/mentors or /api/mentor/all
            if ("GET".equalsIgnoreCase(method) && (path.equals("/api/mentors") || path.endsWith("/mentors") || path.endsWith("/all"))) {
                HttpUtils.sendSuccessResponse(exchange, "All registered mentors retrieved", new com.campus.placement.dao.MentorDAO().findAll());
                return;
            }

            // GET /api/mentor/dashboard?mentorId=1
            if ("GET".equalsIgnoreCase(method) && path.endsWith("/dashboard")) {
                int mentorId = Integer.parseInt(params.getOrDefault("mentorId", "1"));
                Map<String, Object> data = mentorService.getMentorDashboard(mentorId);
                if (data != null) {
                    HttpUtils.sendSuccessResponse(exchange, "Mentor dashboard retrieved", data);
                } else {
                    HttpUtils.sendErrorResponse(exchange, 404, "Mentor not found");
                }
            }
            // GET /api/mentor/profile?mentorId=1 or ?userId=1
            else if ("GET".equalsIgnoreCase(method) && path.endsWith("/profile")) {
                com.campus.placement.model.Mentor mentor = null;
                if (params.containsKey("mentorId")) {
                    mentor = mentorService.getMentorProfile(Integer.parseInt(params.get("mentorId")));
                } else if (params.containsKey("userId")) {
                    mentor = mentorService.getMentorProfileByUserId(Integer.parseInt(params.get("userId")));
                } else {
                    String token = com.campus.placement.util.SessionManager.extractToken(exchange);
                    com.campus.placement.util.SessionManager.UserSession session = com.campus.placement.util.SessionManager.getSession(token);
                    if (session != null && session.getMentorId() != null) {
                        mentor = mentorService.getMentorProfile(session.getMentorId());
                    }
                }
                if (mentor != null) {
                    Map<String, Object> dash = mentorService.getMentorDashboard(mentor.getMentorId());
                    Map<String, Object> resp = new java.util.HashMap<>();
                    resp.put("mentor", mentor);
                    resp.put("mentorId", mentor.getMentorId());
                    resp.put("id", mentor.getMentorId());
                    resp.put("userId", mentor.getId());
                    resp.put("name", mentor.getName());
                    resp.put("email", mentor.getEmail());
                    resp.put("avatarUrl", mentor.getAvatarUrl());
                    resp.put("phoneNumber", mentor.getPhoneNumber());
                    resp.put("department", mentor.getDepartment());
                    resp.put("designation", mentor.getDesignation());
                    resp.put("cabinLocation", mentor.getCabinLocation());
                    resp.put("mentorStaffId", mentor.getMentorStaffId());
                    int mCount = dash != null && dash.containsKey("menteesCount") ? ((Number) dash.get("menteesCount")).intValue() : 0;
                    int pCount = dash != null && dash.containsKey("placedCount") ? ((Number) dash.get("placedCount")).intValue() : 0;
                    int dCount = dash != null && dash.containsKey("activeDrivesCount") ? ((Number) dash.get("activeDrivesCount")).intValue() : 0;
                    double rate = mCount > 0 ? Math.round(((double) pCount / mCount) * 1000.0) / 10.0 : 0.0;
                    resp.put("menteeCount", mCount);
                    resp.put("menteesCount", mCount);
                    resp.put("placedCount", pCount);
                    resp.put("placementRate", rate);
                    resp.put("activeDrivesCount", dCount);
                    HttpUtils.sendSuccessResponse(exchange, "Mentor profile retrieved", resp);
                } else {
                    HttpUtils.sendErrorResponse(exchange, 404, "Mentor profile not found");
                }
            }
            // PUT /api/mentor/profile
            else if (("PUT".equalsIgnoreCase(method) || "POST".equalsIgnoreCase(method)) && path.endsWith("/profile")) {
                String body = HttpUtils.readRequestBody(exchange);
                com.google.gson.JsonObject json = com.google.gson.JsonParser.parseString(body).getAsJsonObject();
                int mentorId = json.has("mentorId") ? json.get("mentorId").getAsInt() :
                               json.has("id") ? json.get("id").getAsInt() : -1;
                if (mentorId <= 0) {
                    String token = com.campus.placement.util.SessionManager.extractToken(exchange);
                    com.campus.placement.util.SessionManager.UserSession session = com.campus.placement.util.SessionManager.getSession(token);
                    if (session != null && session.getMentorId() != null) {
                        mentorId = session.getMentorId();
                    }
                }
                com.campus.placement.model.Mentor current = mentorId > 0 ? mentorService.getMentorProfile(mentorId) : null;
                if (current == null) {
                    HttpUtils.sendErrorResponse(exchange, 404, "Mentor not found to update");
                    return;
                }
                String name = json.has("name") ? json.get("name").getAsString() : current.getName();
                String phone = json.has("phoneNumber") ? json.get("phoneNumber").getAsString() :
                               json.has("phone") ? json.get("phone").getAsString() : current.getPhoneNumber();
                String dept = json.has("department") ? json.get("department").getAsString() : current.getDepartment();
                String desig = json.has("designation") ? json.get("designation").getAsString() : current.getDesignation();
                String cabin = json.has("cabinLocation") ? json.get("cabinLocation").getAsString() : current.getCabinLocation();

                if (json.has("avatarUrl") || json.has("avatar")) {
                    String av = json.has("avatarUrl") ? json.get("avatarUrl").getAsString().trim() : json.get("avatar").getAsString().trim();
                    if (!av.isEmpty()) {
                        new com.campus.placement.dao.UserDAO().updateUserAvatar(current.getId(), av);
                    }
                }

                boolean ok = mentorService.updateMentorProfile(mentorId, name, phone, dept, desig, cabin);
                if (ok) {
                    com.campus.placement.model.Mentor updated = mentorService.getMentorProfile(mentorId);
                    HttpUtils.sendSuccessResponse(exchange, "Mentor profile updated successfully", updated);
                } else {
                    HttpUtils.sendErrorResponse(exchange, 400, "Failed to update mentor profile");
                }
            }
            // GET /api/mentor/mentees?mentorId=1
            else if ("GET".equalsIgnoreCase(method) && path.endsWith("/mentees")) {
                String token = com.campus.placement.util.SessionManager.extractToken(exchange);
                com.campus.placement.util.SessionManager.UserSession session = com.campus.placement.util.SessionManager.getSession(token);
                int mentorId = (session != null && session.getMentorId() != null) ? session.getMentorId() : Integer.parseInt(params.getOrDefault("mentorId", "1"));
                HttpUtils.sendSuccessResponse(exchange, "Mentees retrieved", mentorService.getMentees(mentorId));
            }
            // POST /api/mentor/feedback
            else if ("POST".equalsIgnoreCase(method) && path.endsWith("/feedback")) {
                String body = HttpUtils.readRequestBody(exchange);
                MentorFeedback fb = HttpUtils.gson.fromJson(body, MentorFeedback.class);

                String token = com.campus.placement.util.SessionManager.extractToken(exchange);
                com.campus.placement.util.SessionManager.UserSession session = com.campus.placement.util.SessionManager.getSession(token);
                int mentorId = (session != null && session.getMentorId() != null) ? session.getMentorId() : fb.getMentorId();
                fb.setMentorId(mentorId);

                // Security guard: Ensure target student is assigned to this mentor
                com.campus.placement.model.Student student = new com.campus.placement.dao.StudentDAO().findById(fb.getStudentId());
                if (student == null || student.getMentorId() == null || !student.getMentorId().equals(mentorId)) {
                    HttpUtils.sendErrorResponse(exchange, 403, "Access denied: Mentors can only submit feedback for their own assigned mentees.");
                    return;
                }

                boolean ok = mentorService.addFeedback(fb);
                if (ok) {
                    try {
                        int targetUserId = student.getId();
                        com.campus.placement.model.Mentor mentor = mentorService.getMentorProfile(fb.getMentorId());
                        String mentorName = (mentor != null && mentor.getName() != null) ? mentor.getName() : "Faculty Mentor";
                        String focus = (fb.getFocusArea() != null && !fb.getFocusArea().isEmpty()) ? fb.getFocusArea() : "Placement Review";
                        String msg = mentorName + " posted guidance on " + focus + ": \"" + fb.getFeedbackText() + "\"";

                        com.campus.placement.model.Notification notif = new com.campus.placement.model.Notification(
                                targetUserId,
                                "MENTOR_FEEDBACK",
                                "Mentor Feedback: " + focus,
                                msg,
                                fb.getId()
                        );
                        new com.campus.placement.dao.NotificationDAO().createNotification(notif);
                    } catch (Exception ex) {
                        System.err.println("Failed to send feedback notification: " + ex.getMessage());
                    }
                    HttpUtils.sendSuccessResponse(exchange, "Feedback submitted successfully", fb);
                } else {
                    HttpUtils.sendErrorResponse(exchange, 400, "Failed to submit feedback");
                }
            }
            // GET /api/mentor/feedback?mentorId=1
            else if ("GET".equalsIgnoreCase(method) && path.endsWith("/feedback")) {
                String token = com.campus.placement.util.SessionManager.extractToken(exchange);
                com.campus.placement.util.SessionManager.UserSession session = com.campus.placement.util.SessionManager.getSession(token);
                int mentorId = (session != null && session.getMentorId() != null) ? session.getMentorId() : Integer.parseInt(params.getOrDefault("mentorId", "1"));
                HttpUtils.sendSuccessResponse(exchange, "Feedback retrieved", mentorService.getFeedbackByMentor(mentorId));
            }
            // GET /api/mentors or /api/mentor/all
            else if ("GET".equalsIgnoreCase(method) && (path.endsWith("/mentors") || path.endsWith("/all") || path.equals("/api/mentors"))) {
                HttpUtils.sendSuccessResponse(exchange, "Mentors retrieved successfully", mentorService.getAllMentors());
            } else {
                HttpUtils.sendErrorResponse(exchange, 404, "Mentor endpoint not found");
            }
        } catch (Exception e) {
            HttpUtils.sendErrorResponse(exchange, 500, e.getMessage());
        }
    }
}
