package com.campus.placement.controller;

import com.campus.placement.model.AcademicRecord;
import com.campus.placement.model.Student;
import com.campus.placement.service.StudentService;
import com.campus.placement.util.HttpUtils;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.Map;

public class StudentController {
    private final StudentService studentService = new StudentService();

    public void handle(HttpExchange exchange) throws IOException {
        if (HttpUtils.handlePreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();
        Map<String, String> params = HttpUtils.parseQueryParams(exchange.getRequestURI().getQuery());

        try {
            if ("GET".equalsIgnoreCase(method) && path.endsWith("/dashboard")) {
                int studentId = Integer.parseInt(params.getOrDefault("studentId", "1"));
                String token = com.campus.placement.util.SessionManager.extractToken(exchange);
                com.campus.placement.util.SessionManager.UserSession session = com.campus.placement.util.SessionManager.getSession(token);
                if (session != null && session.getMentorId() != null) {
                    Student s = studentService.getProfile(studentId);
                    if (s == null || s.getMentorId() == null || !s.getMentorId().equals(session.getMentorId())) {
                        HttpUtils.sendErrorResponse(exchange, 403, "Access denied: Mentors can only inspect their own assigned mentees.");
                        return;
                    }
                } else if (session != null && session.getStudentId() != null && session.getStudentId() != studentId) {
                    HttpUtils.sendErrorResponse(exchange, 403, "Access denied: Students can only view their own dashboard.");
                    return;
                }
                Map<String, Object> data = studentService.getDashboardData(studentId);
                if (data != null) {
                    HttpUtils.sendSuccessResponse(exchange, "Dashboard retrieved", data);
                } else {
                    HttpUtils.sendErrorResponse(exchange, 404, "Student not found");
                }
            } else if ("GET".equalsIgnoreCase(method) && path.endsWith("/profile")) {
                int studentId = Integer.parseInt(params.getOrDefault("studentId", "1"));
                String token = com.campus.placement.util.SessionManager.extractToken(exchange);
                com.campus.placement.util.SessionManager.UserSession session = com.campus.placement.util.SessionManager.getSession(token);
                if (session != null && session.getMentorId() != null) {
                    Student s = studentService.getProfile(studentId);
                    if (s == null || s.getMentorId() == null || !s.getMentorId().equals(session.getMentorId())) {
                        HttpUtils.sendErrorResponse(exchange, 403, "Access denied: Mentors can only inspect their own assigned mentees.");
                        return;
                    }
                } else if (session != null && session.getStudentId() != null && session.getStudentId() != studentId) {
                    HttpUtils.sendErrorResponse(exchange, 403, "Access denied: Students can only view their own profile.");
                    return;
                }
                Student student = studentService.getProfile(studentId);
                if (student != null) {
                    HttpUtils.sendSuccessResponse(exchange, "Profile retrieved", student);
                } else {
                    HttpUtils.sendErrorResponse(exchange, 404, "Student not found");
                }
            }
 else if ("POST".equalsIgnoreCase(method) && path.endsWith("/profile")) {
                String body = HttpUtils.readRequestBody(exchange);
                Student s = HttpUtils.gson.fromJson(body, Student.class);
                boolean ok = studentService.updateProfile(s);
                if (ok) {
                    HttpUtils.sendSuccessResponse(exchange, "Profile updated successfully", s);
                } else {
                    HttpUtils.sendErrorResponse(exchange, 400, "Failed to update profile");
                }
            } else if ("POST".equalsIgnoreCase(method) && path.endsWith("/academics")) {
                String body = HttpUtils.readRequestBody(exchange);
                AcademicRecord rec = HttpUtils.gson.fromJson(body, AcademicRecord.class);
                boolean ok = studentService.saveAcademicRecord(rec);
                if (ok) {
                    HttpUtils.sendSuccessResponse(exchange, "Academic record saved", rec);
                } else {
                    HttpUtils.sendErrorResponse(exchange, 400, "Failed to save academic record");
                }
            } else if (("PUT".equalsIgnoreCase(method) || "POST".equalsIgnoreCase(method)) && path.endsWith("/mentor")) {
                String body = HttpUtils.readRequestBody(exchange);
                JsonObject json = JsonParser.parseString(body).getAsJsonObject();
                int studentId = json.has("studentId") ? json.get("studentId").getAsInt() : -1;
                Integer mentorId = null;
                if (json.has("mentorId") && !json.get("mentorId").isJsonNull()) {
                    mentorId = json.get("mentorId").getAsInt();
                }
                if (studentId <= 0) {
                    HttpUtils.sendErrorResponse(exchange, 400, "studentId is required.");
                    return;
                }
                boolean ok = new com.campus.placement.dao.StudentDAO().updateMentor(studentId, mentorId);
                if (ok) {
                    HttpUtils.sendSuccessResponse(exchange, "Assigned mentor updated successfully", mentorId);
                } else {
                    HttpUtils.sendErrorResponse(exchange, 400, "Failed to update assigned mentor");
                }
            } else if (("PUT".equalsIgnoreCase(method) || "POST".equalsIgnoreCase(method)) && path.endsWith("/resume")) {
                String body = HttpUtils.readRequestBody(exchange);
                JsonObject json = JsonParser.parseString(body).getAsJsonObject();
                int studentId = json.has("studentId") ? json.get("studentId").getAsInt() : -1;
                String resumeDriveUrl = json.has("resumeDriveUrl") ? json.get("resumeDriveUrl").getAsString().trim() : "";
                if (studentId <= 0) {
                    HttpUtils.sendErrorResponse(exchange, 400, "studentId is required.");
                    return;
                }
                if (resumeDriveUrl.isEmpty() || (!resumeDriveUrl.startsWith("http://") && !resumeDriveUrl.startsWith("https://"))) {
                    HttpUtils.sendErrorResponse(exchange, 400, "A valid resume URL starting with https:// is required.");
                    return;
                }
                boolean ok = new com.campus.placement.dao.StudentDAO().updateResumeDriveUrl(studentId, resumeDriveUrl);
                if (ok) {
                    HttpUtils.sendSuccessResponse(exchange, "Resume drive link updated successfully", resumeDriveUrl);
                } else {
                    HttpUtils.sendErrorResponse(exchange, 400, "Failed to save resume drive link");
                }
            } else {
                HttpUtils.sendErrorResponse(exchange, 404, "Student endpoint not found");
            }
        } catch (Exception e) {
            HttpUtils.sendErrorResponse(exchange, 500, e.getMessage());
        }
    }
}
