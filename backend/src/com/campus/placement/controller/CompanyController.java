package com.campus.placement.controller;

import com.campus.placement.model.CompanyDrive;
import com.campus.placement.service.CompanyService;
import com.campus.placement.util.HttpUtils;
import com.campus.placement.util.SessionManager;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.Map;

public class CompanyController {
    private final CompanyService companyService = new CompanyService();

    public void handle(HttpExchange exchange) throws IOException {
        if (HttpUtils.handlePreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();
        Map<String, String> params = HttpUtils.parseQueryParams(exchange.getRequestURI().getQuery());

        try {
            // GET /api/companies (with optional ?studentId=1 or session token)
            if ("GET".equalsIgnoreCase(method) && path.endsWith("/companies")) {
                Integer studentId = null;
                if (params.containsKey("studentId")) {
                    try {
                        int parsed = Integer.parseInt(params.get("studentId"));
                        if (parsed > 0) studentId = parsed;
                    } catch (NumberFormatException ignored) {}
                }
                if (studentId == null) {
                    String token = SessionManager.extractToken(exchange);
                    SessionManager.UserSession session = SessionManager.getSession(token);
                    if (session != null && session.getStudentId() != null && session.getStudentId() > 0) {
                        studentId = session.getStudentId();
                    }
                }
                HttpUtils.sendSuccessResponse(exchange, "Drives retrieved", companyService.getAllDrives(studentId));
            }
            // POST /api/companies (Create new company drive)
            else if ("POST".equalsIgnoreCase(method) && path.endsWith("/companies")) {
                String body = HttpUtils.readRequestBody(exchange);
                CompanyDrive drive = HttpUtils.gson.fromJson(body, CompanyDrive.class);
                int id = companyService.createDrive(drive);
                if (id > 0) {
                    drive.setId(id);
                    try {
                        String msg = "New recruitment drive announced for " + drive.getJobRole() + " at " + drive.getCompanyName()
                                + ". CTC: " + drive.getPackageLpa() + " LPA | Location: " + drive.getJobLocation()
                                + " | Min CGPA: " + drive.getMinCgpa();
                        com.campus.placement.model.Notification notif = new com.campus.placement.model.Notification(
                                null, // broadcast to all students
                                "Placement Drive Updation",
                                "New Drive: " + drive.getCompanyName() + " (" + drive.getPackageLpa() + " LPA)",
                                msg,
                                id
                        );
                        new com.campus.placement.dao.NotificationDAO().createNotification(notif);
                    } catch (Exception ex) {
                        System.err.println("Failed to send drive creation notification: " + ex.getMessage());
                    }
                    HttpUtils.sendSuccessResponse(exchange, "Placement drive posted successfully", drive);
                } else {
                    HttpUtils.sendErrorResponse(exchange, 400, "Failed to post placement drive");
                }
            }
            // PUT /api/companies (Update existing company drive)
            else if ("PUT".equalsIgnoreCase(method) && path.endsWith("/companies")) {
                String body = HttpUtils.readRequestBody(exchange);
                CompanyDrive drive = HttpUtils.gson.fromJson(body, CompanyDrive.class);
                boolean ok = companyService.updateDrive(drive);
                if (ok) {
                    try {
                        String msg = "Recruitment drive details updated for " + drive.getCompanyName()
                                + " (" + drive.getJobRole() + "). CTC: " + drive.getPackageLpa() + " LPA | Min CGPA: " + drive.getMinCgpa();
                        com.campus.placement.model.Notification notif = new com.campus.placement.model.Notification(
                                null, // broadcast to all students
                                "Placement Drive Updation",
                                "Drive Updated: " + drive.getCompanyName(),
                                msg,
                                drive.getId()
                        );
                        new com.campus.placement.dao.NotificationDAO().createNotification(notif);
                    } catch (Exception ex) {
                        System.err.println("Failed to send drive update notification: " + ex.getMessage());
                    }
                    HttpUtils.sendSuccessResponse(exchange, "Placement drive updated successfully", drive);
                } else {
                    HttpUtils.sendErrorResponse(exchange, 400, "Failed to update placement drive");
                }
            }
            // POST /api/companies/apply
            else if ("POST".equalsIgnoreCase(method) && path.endsWith("/companies/apply")) {
                String body = HttpUtils.readRequestBody(exchange);
                JsonObject json = JsonParser.parseString(body).getAsJsonObject();
                int studentId = json.get("studentId").getAsInt();
                int driveId = json.get("driveId").getAsInt();
                try {
                    boolean ok = companyService.apply(studentId, driveId);
                    if (ok) {
                        HttpUtils.sendSuccessResponse(exchange, "Application submitted successfully", null);
                    } else {
                        HttpUtils.sendErrorResponse(exchange, 400, "Failed to submit application");
                    }
                } catch (IllegalStateException | IllegalArgumentException e) {
                    HttpUtils.sendErrorResponse(exchange, 400, e.getMessage());
                }
            }
            // GET /api/applications (with optional ?studentId=1 or ?mentorId=2 or ?driveId=3)
            else if ("GET".equalsIgnoreCase(method) && path.endsWith("/applications")) {
                String token = SessionManager.extractToken(exchange);
                SessionManager.UserSession session = SessionManager.getSession(token);
                Integer sessionMentorId = (session != null && session.getMentorId() != null && session.getMentorId() > 0) ? session.getMentorId() : null;
                Integer sessionStudentId = (session != null && session.getStudentId() != null && session.getStudentId() > 0) ? session.getStudentId() : null;

                if (params.containsKey("studentId")) {
                    int studentId = Integer.parseInt(params.get("studentId"));
                    // Security guard: If a mentor is logged in, ensure student is their assigned mentee
                    if (sessionMentorId != null) {
                        com.campus.placement.model.Student s = new com.campus.placement.dao.StudentDAO().findById(studentId);
                        if (s == null || s.getMentorId() == null || !s.getMentorId().equals(sessionMentorId)) {
                            HttpUtils.sendErrorResponse(exchange, 403, "Access denied: Mentors can only view applications for their own assigned mentees.");
                            return;
                        }
                    } else if (sessionStudentId != null && sessionStudentId != studentId) {
                        HttpUtils.sendErrorResponse(exchange, 403, "Access denied: Students can only view their own applications.");
                        return;
                    }
                    HttpUtils.sendSuccessResponse(exchange, "Applications retrieved", companyService.getStudentApplications(studentId));
                } else if (params.containsKey("driveId")) {
                    int driveId = Integer.parseInt(params.get("driveId"));
                    // If requester is a mentor, strictly scope to their assigned mentees
                    Integer filterMentorId = sessionMentorId;
                    if (filterMentorId == null && params.containsKey("mentorId")) {
                        try {
                            filterMentorId = Integer.parseInt(params.get("mentorId"));
                        } catch (NumberFormatException ignored) {}
                    }
                    if (filterMentorId != null) {
                        HttpUtils.sendSuccessResponse(exchange, "Mentor candidates retrieved for drive", companyService.getDriveApplications(driveId, filterMentorId));
                    } else {
                        HttpUtils.sendSuccessResponse(exchange, "Drive applicants retrieved", companyService.getDriveApplications(driveId));
                    }
                } else if (params.containsKey("mentorId")) {
                    int mentorId = Integer.parseInt(params.get("mentorId"));
                    // If mentor is logged in, always enforce their own session mentorId
                    if (sessionMentorId != null) {
                        mentorId = sessionMentorId;
                    }
                    HttpUtils.sendSuccessResponse(exchange, "Mentor candidates retrieved", companyService.getMentorApplications(mentorId));
                } else {
                    if (sessionMentorId != null) {
                        HttpUtils.sendSuccessResponse(exchange, "Mentor candidates retrieved", companyService.getMentorApplications(sessionMentorId));
                    } else if (sessionStudentId != null) {
                        HttpUtils.sendSuccessResponse(exchange, "Student applications retrieved", companyService.getStudentApplications(sessionStudentId));
                    } else {
                        HttpUtils.sendSuccessResponse(exchange, "All applications retrieved", companyService.getAllApplications());
                    }
                }
            }
            // POST /api/applications/status (Mentor updates candidate status)
            else if ("POST".equalsIgnoreCase(method) && path.endsWith("/applications/status")) {
                String body = HttpUtils.readRequestBody(exchange);
                JsonObject json = JsonParser.parseString(body).getAsJsonObject();
                int applicationId = json.get("applicationId").getAsInt();
                String status = json.get("status").getAsString();
                String remarks = json.has("remarks") ? json.get("remarks").getAsString() : "";
                
                com.campus.placement.model.Application app = new com.campus.placement.dao.ApplicationDAO().findById(applicationId);
                if (app == null) {
                    HttpUtils.sendErrorResponse(exchange, 404, "Application not found");
                    return;
                }

                // Security guard: Ensure logged-in mentor only updates applications of their own assigned mentees
                String token = SessionManager.extractToken(exchange);
                SessionManager.UserSession session = SessionManager.getSession(token);
                if (session != null && session.getMentorId() != null) {
                    com.campus.placement.model.Student s = new com.campus.placement.dao.StudentDAO().findById(app.getStudentId());
                    if (s == null || s.getMentorId() == null || !s.getMentorId().equals(session.getMentorId())) {
                        HttpUtils.sendErrorResponse(exchange, 403, "Access denied: Mentors can only update placement statuses for their own assigned mentees.");
                        return;
                    }
                }

                boolean ok = companyService.updateApplicationStatus(applicationId, status, remarks);
                if (ok) {
                    try {
                        com.campus.placement.model.Student s = new com.campus.placement.dao.StudentDAO().findById(app.getStudentId());
                        int targetUserId = (s != null) ? s.getId() : app.getStudentId();
                        String company = (app.getCompanyName() != null) ? app.getCompanyName() : "Company Drive";
                        String role = (app.getJobRole() != null) ? app.getJobRole() : "Candidate";
                        String msg = "Your application for " + role + " at " + company 
                                + " has been updated to [" + status + "]"
                                + (remarks != null && !remarks.trim().isEmpty() ? ". Remarks: " + remarks.trim() : ".");

                        com.campus.placement.model.Notification notif = new com.campus.placement.model.Notification(
                                targetUserId,
                                "DRIVE_STATUS",
                                "Application Status: " + company + " (" + status + ")",
                                msg,
                                app.getDriveId()
                        );
                        new com.campus.placement.dao.NotificationDAO().createNotification(notif);
                    } catch (Exception ex) {
                        System.err.println("Failed to send status update notification: " + ex.getMessage());
                    }
                    HttpUtils.sendSuccessResponse(exchange, "Application status updated to " + status, null);
                } else {
                    HttpUtils.sendErrorResponse(exchange, 400, "Failed to update application status");
                }
            } else {
                HttpUtils.sendErrorResponse(exchange, 404, "Company/Application endpoint not found");
            }
        } catch (Exception e) {
            HttpUtils.sendErrorResponse(exchange, 500, e.getMessage());
        }
    }
}
