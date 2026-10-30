package com.campus.placement.controller;

import com.campus.placement.dao.LeetCodeDAO;
import com.campus.placement.dao.MentorDAO;
import com.campus.placement.dao.StudentDAO;
import com.campus.placement.dao.UserDAO;
import com.campus.placement.model.AcademicRecord;
import com.campus.placement.model.LeetCodeStats;
import com.campus.placement.model.Mentor;
import com.campus.placement.model.Student;
import com.campus.placement.model.User;
import com.campus.placement.util.HttpUtils;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class UserController {
    private final UserDAO userDAO = new UserDAO();
    private final StudentDAO studentDAO = new StudentDAO();
    private final MentorDAO mentorDAO = new MentorDAO();
    private final LeetCodeDAO leetCodeDAO = new LeetCodeDAO();

    public void handle(HttpExchange exchange) throws IOException {
        if (HttpUtils.handlePreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();
        Map<String, String> params = HttpUtils.parseQueryParams(exchange.getRequestURI().getQuery());

        try {
            if ("GET".equalsIgnoreCase(method) && path.endsWith("/profile")) {
                handleGetProfile(exchange, params);
            } else if ("PUT".equalsIgnoreCase(method) && path.endsWith("/profile")) {
                handleUpdateProfile(exchange, params);
            } else {
                HttpUtils.sendErrorResponse(exchange, 404, "User endpoint not found");
            }
        } catch (Exception e) {
            e.printStackTrace();
            HttpUtils.sendErrorResponse(exchange, 500, "Internal error: " + e.getMessage());
        }
    }

    private void handleGetProfile(HttpExchange exchange, Map<String, String> params) throws IOException {
        int studentId = -1;
        int userId = -1;

        if (params.containsKey("studentId")) {
            studentId = Integer.parseInt(params.get("studentId"));
        } else if (params.containsKey("userId")) {
            userId = Integer.parseInt(params.get("userId"));
        }

        Student student = null;
        if (studentId > 0) {
            student = studentDAO.findById(studentId);
        } else if (userId > 0) {
            student = studentDAO.findByUserId(userId);
        } else {
            // Default to first student (e.g. PRITHIGA A or Rahul)
            List<Student> all = studentDAO.findAll();
            if (!all.isEmpty()) {
                student = all.get(all.size() - 1); // latest or PRITHIGA A
            }
        }

        if (student == null) {
            HttpUtils.sendErrorResponse(exchange, 404, "Student profile not found");
            return;
        }

        LeetCodeStats lc = leetCodeDAO.findByStudentId(student.getStudentId());
        List<AcademicRecord> academics = studentDAO.getAcademicRecords(student.getStudentId());
        Mentor mentor = null;
        if (student.getMentorId() != null) {
            mentor = mentorDAO.findById(student.getMentorId());
        }

        Map<String, Object> data = new HashMap<>();
        data.put("student", student);
        data.put("leetcodeStats", lc);
        data.put("academicRecords", academics);
        data.put("mentor", mentor);

        HttpUtils.sendSuccessResponse(exchange, "Unified profile retrieved", data);
    }

    private void handleUpdateProfile(HttpExchange exchange, Map<String, String> params) throws IOException {
        String body = HttpUtils.readRequestBody(exchange);
        JsonObject json = JsonParser.parseString(body).getAsJsonObject();

        int studentId = -1;
        if (json.has("studentId")) {
            studentId = json.get("studentId").getAsInt();
        } else if (params.containsKey("studentId")) {
            studentId = Integer.parseInt(params.get("studentId"));
        } else if (json.has("id")) {
            studentId = json.get("id").getAsInt();
        }

        Student student = studentId > 0 ? studentDAO.findById(studentId) : null;
        if (student == null && json.has("userId")) {
            student = studentDAO.findByUserId(json.get("userId").getAsInt());
        }

        if (student == null) {
            HttpUtils.sendErrorResponse(exchange, 404, "Student profile not found to update");
            return;
        }

        String name = json.has("name") ? json.get("name").getAsString() : student.getName();
        String phone = json.has("phoneNumber") ? json.get("phoneNumber").getAsString() :
                       json.has("phone") ? json.get("phone").getAsString() : student.getPhoneNumber();

        if (json.has("gender")) student.setGender(json.get("gender").getAsString());
        if (json.has("dateOfBirth")) student.setDateOfBirth(json.get("dateOfBirth").getAsString());
        if (json.has("tenthPercentage")) student.setTenthPercentage(json.get("tenthPercentage").getAsString());
        if (json.has("twelfthPercentage")) student.setTwelfthPercentage(json.get("twelfthPercentage").getAsString());
        if (json.has("diplomaPercentage")) student.setDiplomaPercentage(json.get("diplomaPercentage").getAsString());
        if (json.has("undergraduateGpa")) student.setUndergraduateGpa(json.get("undergraduateGpa").getAsString());
        if (json.has("collegeName")) student.setCollegeName(json.get("collegeName").getAsString());
        if (json.has("campus")) student.setCampus(json.get("campus").getAsString());
        if (json.has("degree")) student.setDegree(json.get("degree").getAsString());

        // LeetCode handle is locked and immutable from user profile update
        // student.leetcodeUsername remains as registered

        if (json.has("resumeDriveUrl")) {
            student.setResumeDriveUrl(json.get("resumeDriveUrl").getAsString().trim());
        } else if (json.has("resumeUrl")) {
            student.setResumeDriveUrl(json.get("resumeUrl").getAsString().trim());
        }

        if (json.has("mentorId")) {
            if (json.get("mentorId").isJsonNull()) {
                student.setMentorId(null);
            } else {
                student.setMentorId(json.get("mentorId").getAsInt());
            }
        }
        if (json.has("avatarUrl")) {
            student.setAvatarUrl(json.get("avatarUrl").getAsString().trim());
        } else if (json.has("avatar")) {
            student.setAvatarUrl(json.get("avatar").getAsString().trim());
        }

        if (json.has("skills")) student.setSkills(json.get("skills").getAsString());

        boolean ok = studentDAO.updateFullProfile(student, name, phone);
        if (ok) {
            Student updated = studentDAO.findById(student.getStudentId());
            HttpUtils.sendSuccessResponse(exchange, "Personal profile updated successfully", updated);
        } else {
            HttpUtils.sendErrorResponse(exchange, 400, "Failed to update profile");
        }
    }
}
