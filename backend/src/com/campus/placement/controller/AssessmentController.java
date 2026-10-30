package com.campus.placement.controller;

import com.campus.placement.dao.AssessmentDAO;
import com.campus.placement.model.Assessment;
import com.campus.placement.util.HttpUtils;
import com.campus.placement.util.SessionManager;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public class AssessmentController {
    private final AssessmentDAO assessmentDAO = new AssessmentDAO();

    public void handle(HttpExchange exchange) throws IOException {
        if (HttpUtils.handlePreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();
        Map<String, String> params = HttpUtils.parseQueryParams(exchange.getRequestURI().getQuery());

        try {
            // GET /api/assessments
            if ("GET".equalsIgnoreCase(method)) {
                List<Assessment> list;
                if (params.containsKey("studentId")) {
                    int studentId = Integer.parseInt(params.get("studentId"));
                    if (params.containsKey("department") || params.containsKey("dept")) {
                        String dept = params.containsKey("department") ? params.get("department") : params.get("dept");
                        list = assessmentDAO.findByDepartmentForStudent(dept, studentId);
                    } else {
                        list = assessmentDAO.findStudentAssessments(studentId);
                    }
                } else if (params.containsKey("mentorId")) {
                    int mentorId = Integer.parseInt(params.get("mentorId"));
                    list = assessmentDAO.findByMentorIdWithStats(mentorId);
                } else if (params.containsKey("department") || params.containsKey("dept")) {
                    String dept = params.containsKey("department") ? params.get("department") : params.get("dept");
                    list = assessmentDAO.findByDepartment(dept);
                } else {
                    list = assessmentDAO.findAll();
                }
                HttpUtils.sendSuccessResponse(exchange, "Assessments retrieved", list);
            }
            // POST /api/assessments or /api/assessments/toggle-completion
            else if ("POST".equalsIgnoreCase(method)) {
                String body = HttpUtils.readRequestBody(exchange);
                JsonObject json = JsonParser.parseString(body).getAsJsonObject();

                // Check for toggle-completion
                if (path.endsWith("/toggle-completion") || path.endsWith("/complete") || (json.has("assessmentId") && json.has("completed"))) {
                    int assessmentId = json.get("assessmentId").getAsInt();
                    int studentId = json.has("studentId") ? json.get("studentId").getAsInt() : -1;
                    if (studentId <= 0) {
                        String token = SessionManager.extractToken(exchange);
                        SessionManager.UserSession session = SessionManager.getSession(token);
                        if (session != null && session.getStudentId() != null) {
                            studentId = session.getStudentId();
                        }
                    }
                    if (studentId <= 0) {
                        HttpUtils.sendErrorResponse(exchange, 400, "Valid student ID is required for marking completion.");
                        return;
                    }
                    boolean completed = json.get("completed").getAsBoolean();
                    boolean ok = assessmentDAO.toggleStudentAssessmentCompletion(assessmentId, studentId, completed);
                    if (ok) {
                        JsonObject resp = new JsonObject();
                        resp.addProperty("assessmentId", assessmentId);
                        resp.addProperty("studentId", studentId);
                        resp.addProperty("completed", completed);
                        HttpUtils.sendSuccessResponse(exchange, "Assessment completion status updated successfully", resp);
                    } else {
                        HttpUtils.sendErrorResponse(exchange, 400, "Failed to update assessment completion status.");
                    }
                    return;
                }

                String title = json.has("title") ? json.get("title").getAsString().trim() : "";
                String testLink = json.has("testLink") ? json.get("testLink").getAsString().trim() : "";
                String dueDate = json.has("dueDate") ? json.get("dueDate").getAsString().trim() : "";
                String targetDept = json.has("targetDept") ? json.get("targetDept").getAsString().trim() : "All Departments";
                String description = json.has("description") ? json.get("description").getAsString().trim() : "";

                if (title.isEmpty()) {
                    HttpUtils.sendErrorResponse(exchange, 400, "Assessment Title is required.");
                    return;
                }
                if (testLink.isEmpty() || (!testLink.startsWith("http://") && !testLink.startsWith("https://"))) {
                    HttpUtils.sendErrorResponse(exchange, 400, "A valid assessment URL is required (e.g. https://hackerrank.com/...).");
                    return;
                }
                if (dueDate.isEmpty()) {
                    HttpUtils.sendErrorResponse(exchange, 400, "Due date & time is required.");
                    return;
                }

                Integer mentorId = null;
                if (json.has("mentorId")) {
                    mentorId = json.get("mentorId").getAsInt();
                } else {
                    String token = SessionManager.extractToken(exchange);
                    SessionManager.UserSession session = SessionManager.getSession(token);
                    if (session != null && session.getMentorId() != null) {
                        mentorId = session.getMentorId();
                    }
                }

                Assessment a = new Assessment();
                a.setTitle(title);
                a.setTestLink(testLink);
                a.setDueDate(dueDate);
                a.setTargetDept(targetDept);
                a.setDescription(description);
                a.setMentorId(mentorId);

                int id = assessmentDAO.createAssessment(a);
                if (id > 0) {
                    a.setAssessmentId(id);
                    HttpUtils.sendSuccessResponse(exchange, "Assessment published successfully", a);
                } else {
                    HttpUtils.sendErrorResponse(exchange, 500, "Failed to save assessment to database.");
                }
            }
            // DELETE /api/assessments?id=1
            else if ("DELETE".equalsIgnoreCase(method)) {
                int assessmentId = -1;
                if (params.containsKey("id")) {
                    assessmentId = Integer.parseInt(params.get("id"));
                } else if (params.containsKey("assessmentId")) {
                    assessmentId = Integer.parseInt(params.get("assessmentId"));
                }

                if (assessmentId <= 0) {
                    HttpUtils.sendErrorResponse(exchange, 400, "Valid assessment ID is required.");
                    return;
                }

                boolean ok = assessmentDAO.deleteAssessment(assessmentId);
                if (ok) {
                    HttpUtils.sendSuccessResponse(exchange, "Assessment deleted successfully", assessmentId);
                } else {
                    HttpUtils.sendErrorResponse(exchange, 404, "Assessment not found or could not be deleted.");
                }
            } else {
                HttpUtils.sendErrorResponse(exchange, 405, "Method not allowed");
            }
        } catch (Exception e) {
            e.printStackTrace();
            HttpUtils.sendErrorResponse(exchange, 500, "Internal error: " + e.getMessage());
        }
    }
}
