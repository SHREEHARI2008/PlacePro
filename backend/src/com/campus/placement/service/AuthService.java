package com.campus.placement.service;

import com.campus.placement.dao.LeetCodeDAO;
import com.campus.placement.dao.MentorDAO;
import com.campus.placement.dao.StudentDAO;
import com.campus.placement.dao.UserDAO;
import com.campus.placement.model.Mentor;
import com.campus.placement.model.Student;
import com.campus.placement.model.User;
import com.campus.placement.util.PasswordSecurity;
import com.campus.placement.util.SessionManager;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

public class AuthService {
    private final UserDAO userDAO = new UserDAO();
    private final StudentDAO studentDAO = new StudentDAO();
    private final MentorDAO mentorDAO = new MentorDAO();
    private final LeetCodeDAO leetCodeDAO = new LeetCodeDAO();
    private final LeetCodeService leetCodeService = new LeetCodeService();

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern REG_NO_PATTERN = Pattern.compile("^[A-Za-z0-9_-]{5,20}$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^(\\+?\\d{1,4}[-\\s]?)?\\d{9,12}$");

    public Map<String, Object> login(String email, String password) {
        if (email == null || password == null) return null;
        User user = userDAO.findByEmail(email.trim().toLowerCase());
        if (user == null) return null;

        if (!PasswordSecurity.verifyPassword(password.trim(), user.getPasswordHash())) {
            return null;
        }

        Integer studentId = null;
        Integer mentorId = null;

        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("avatarUrl", user.getAvatarUrl());
        response.put("phoneNumber", user.getPhoneNumber());

        if ("STUDENT".equalsIgnoreCase(user.getRole())) {
            Student student = studentDAO.findByUserId(user.getId());
            if (student != null) {
                studentId = student.getStudentId();
                response.put("studentId", student.getStudentId());
                response.put("rollNumber", student.getRollNumber());
                response.put("registerNumber", student.getRegisterNumber());
                response.put("department", student.getDepartment());
                response.put("yearSemester", student.getYearSemester());
                response.put("cgpa", student.getCgpa());
                response.put("activeBacklogs", student.getActiveBacklogs());
                response.put("leetcodeUsername", student.getLeetcodeUsername());
                response.put("leetcodeUrl", student.getLeetcodeUrl());
                response.put("gender", student.getGender());
                response.put("dateOfBirth", student.getDateOfBirth());
                response.put("campus", student.getCampus());
                response.put("batchYear", student.getBatchYear());
                response.put("degree", student.getDegree());
                response.put("mentorName", student.getMentorName());
                response.put("tenthPercentage", student.getTenthPercentage());
                response.put("twelfthPercentage", student.getTwelfthPercentage());
                response.put("diplomaPercentage", student.getDiplomaPercentage());
                response.put("undergraduateGpa", student.getUndergraduateGpa());
            }
        } else if ("MENTOR".equalsIgnoreCase(user.getRole())) {
            Mentor mentor = mentorDAO.findByUserId(user.getId());
            if (mentor != null) {
                mentorId = mentor.getMentorId();
                response.put("mentorId", mentor.getMentorId());
                response.put("mentorStaffId", mentor.getMentorStaffId());
                response.put("department", mentor.getDepartment());
                response.put("designation", mentor.getDesignation());
                response.put("cabinLocation", mentor.getCabinLocation());
                response.put("phoneNumber", user.getPhoneNumber());
            }
        }

        // Register active session in SessionManager
        String sessionToken = SessionManager.createSession(user.getId(), user.getEmail(), user.getRole(), studentId, mentorId);
        response.put("token", sessionToken);

        return response;
    }

    public Map<String, Object> register(Map<String, Object> payload) {
        String role = (String) payload.getOrDefault("role", "STUDENT");
        role = (role != null) ? role.trim().toUpperCase() : "STUDENT";

        String name = (String) payload.get("name");
        String email = payload.containsKey("email") ? ((String) payload.get("email")).toLowerCase().trim() : "";
        String password = (String) payload.get("password");

        // 1. General validations
        if (name == null || name.trim().length() < 2) {
            throw new IllegalArgumentException("Full Name is required and must be at least 2 characters long.");
        }
        if (email.isEmpty() || !EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("A valid institutional or personal email address is required (e.g., user@campus.edu).");
        }
        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException("Password is required and must be at least 6 characters long.");
        }
        if (userDAO.findByEmail(email) != null) {
            throw new IllegalArgumentException("An account with email '" + email + "' is already registered. Please sign in.");
        }

        if ("STUDENT".equals(role)) {
            // Student Registration Fields
            String registerNumber = (String) payload.get("registerNumber");
            if (registerNumber == null || registerNumber.trim().isEmpty()) {
                registerNumber = (String) payload.get("rollNumber");
            }
            if (registerNumber == null || registerNumber.trim().isEmpty()) {
                throw new IllegalArgumentException("University Register Number is required.");
            }
            registerNumber = registerNumber.trim().toUpperCase();
            if (!REG_NO_PATTERN.matcher(registerNumber).matches()) {
                throw new IllegalArgumentException("Invalid Register Number format (5-20 alphanumeric characters, e.g., 253115104088).");
            }

            // Check duplicate Register Number
            if (studentDAO.findByRegisterNumber(registerNumber) != null) {
                throw new IllegalArgumentException("Register Number '" + registerNumber + "' is already registered in PlacePro.");
            }

            String department = (String) payload.getOrDefault("department", "CSE");
            if (department == null || department.trim().isEmpty()) {
                throw new IllegalArgumentException("Department is required.");
            }

            String yearSemester = (String) payload.getOrDefault("yearSemester", "3rd Year / Sem 6");
            if (yearSemester == null || yearSemester.trim().isEmpty()) {
                yearSemester = "3rd Year / Sem 6";
            }

            String leetcodeRaw = (String) payload.get("leetcodeUrl");
            if (leetcodeRaw == null || leetcodeRaw.trim().isEmpty()) {
                leetcodeRaw = (String) payload.get("leetcodeProfile");
            }
            if (leetcodeRaw == null || leetcodeRaw.trim().isEmpty()) {
                leetcodeRaw = (String) payload.get("leetcodeHandle");
            }
            String extractedHandle = LeetCodeService.extractUsername(leetcodeRaw);
            if (extractedHandle.isEmpty()) {
                extractedHandle = "student_" + registerNumber.toLowerCase();
            }

            String phone = (String) payload.getOrDefault("phoneNumber", payload.get("mobileNumber"));
            if (phone != null && !phone.trim().isEmpty()) {
                phone = phone.trim();
                String cleanPhone = phone.replaceAll("[\\s-]", "");
                if (!PHONE_PATTERN.matcher(cleanPhone).matches()) {
                    throw new IllegalArgumentException("Please enter a valid mobile number (9-12 digits).");
                }
            } else {
                phone = "+91 9840112233";
            }

            Integer mentorId = null;
            if (payload.containsKey("mentorId") && payload.get("mentorId") != null) {
                try {
                    mentorId = ((Number) payload.get("mentorId")).intValue();
                } catch (Exception ignored) {}
            }

            // BCrypt Hashing
            String hashedPassword = PasswordSecurity.hashPassword(password);

            User user = new User();
            user.setName(name.trim());
            user.setEmail(email);
            user.setPasswordHash(hashedPassword);
            user.setRole("STUDENT");
            user.setPhoneNumber(phone);
            user.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");

            int userId = userDAO.createUser(user);
            if (userId <= 0) {
                throw new RuntimeException("Failed to create student user credentials.");
            }
            user.setId(userId);

            Student student = new Student();
            student.setId(userId);
            student.setRollNumber(registerNumber);
            student.setRegisterNumber(registerNumber);
            student.setDepartment(department.trim());
            student.setYearSemester(yearSemester.trim());
            student.setBatchYear(2026);
            student.setMentorId(mentorId);
            double cgpa = 0.00;
            if (payload.get("cgpa") != null) {
                try {
                    cgpa = Double.parseDouble(payload.get("cgpa").toString().trim());
                } catch (Exception ignored) {}
            }
            int activeBacklogs = 0;
            if (payload.get("activeBacklogs") != null) {
                try {
                    activeBacklogs = Integer.parseInt(payload.get("activeBacklogs").toString().trim());
                } catch (Exception ignored) {}
            }
            int historyOfBacklogs = 0;
            if (payload.get("historyOfBacklogs") != null) {
                try {
                    historyOfBacklogs = Integer.parseInt(payload.get("historyOfBacklogs").toString().trim());
                } catch (Exception ignored) {}
            }
            String tenth = payload.get("tenthPercentage") != null ? payload.get("tenthPercentage").toString().trim() : "0";
            String twelfth = payload.get("twelfthPercentage") != null ? payload.get("twelfthPercentage").toString().trim() : "0";
            String diploma = payload.get("diplomaPercentage") != null ? payload.get("diplomaPercentage").toString().trim() : "0";
            String ugGpa = payload.get("undergraduateGpa") != null ? payload.get("undergraduateGpa").toString().trim() : (cgpa > 0 ? String.format("%.2f", cgpa) : "0.00");
            String degree = payload.get("degree") != null ? payload.get("degree").toString().trim() : ("B.E " + department.trim());

            student.setCgpa(cgpa);
            student.setActiveBacklogs(activeBacklogs);
            student.setHistoryOfBacklogs(historyOfBacklogs);
            student.setLeetcodeUsername(extractedHandle);
            student.setLeetcodeUrl("https://leetcode.com/u/" + extractedHandle + "/");
            student.setPhoneNumber(phone);
            student.setGender("Not Specified");
            student.setDateOfBirth("");
            student.setTenthPercentage(tenth);
            student.setTwelfthPercentage(twelfth);
            student.setDiplomaPercentage(diploma);
            student.setUndergraduateGpa(ugGpa);
            student.setCollegeName("ABC College");
            student.setCampus("ABC College");
            student.setDegree(degree);
            student.setSkills("");

            int studentId = studentDAO.createStudent(student);
            if (studentId > 0) {
                // Real-time synchronization with LeetCode GraphQL directly
                try {
                    leetCodeService.syncLeetCodeHandle(studentId, extractedHandle);
                } catch (Exception e) {
                    System.err.println("Initial LeetCode sync note: " + e.getMessage());
                }
            }
        } else if ("MENTOR".equals(role)) {
            // Mentor Registration Fields
            String mentorStaffId = (String) payload.get("mentorStaffId");
            if (mentorStaffId == null || mentorStaffId.trim().isEmpty()) {
                mentorStaffId = (String) payload.get("employeeId");
            }
            if (mentorStaffId == null || mentorStaffId.trim().isEmpty()) {
                mentorStaffId = (String) payload.get("mentorId");
            }
            if (mentorStaffId == null || mentorStaffId.trim().isEmpty()) {
                throw new IllegalArgumentException("Mentor Employee ID is required (e.g., MTR-2026).");
            }
            mentorStaffId = mentorStaffId.trim().toUpperCase();

            // Check duplicate Mentor Staff ID
            if (mentorDAO.findByStaffId(mentorStaffId) != null) {
                throw new IllegalArgumentException("Mentor Employee ID '" + mentorStaffId + "' is already registered in PlacePro.");
            }

            String department = (String) payload.getOrDefault("department", "Computer Science & Engineering");
            if (department == null || department.trim().isEmpty()) {
                throw new IllegalArgumentException("Department is required.");
            }

            String mobileNumber = (String) payload.get("mobileNumber");
            if (mobileNumber == null || mobileNumber.trim().isEmpty()) {
                mobileNumber = (String) payload.get("phoneNumber");
            }
            if (mobileNumber == null || mobileNumber.trim().isEmpty()) {
                throw new IllegalArgumentException("Mobile number is required for Mentor registration.");
            }
            mobileNumber = mobileNumber.trim();
            String cleanPhone = mobileNumber.replaceAll("[\\s-]", "");
            if (!PHONE_PATTERN.matcher(cleanPhone).matches()) {
                throw new IllegalArgumentException("Please enter a valid mobile number (9-12 digits).");
            }

            // Check duplicate phone
            if (userDAO.findByPhoneNumber(mobileNumber) != null) {
                throw new IllegalArgumentException("Mobile number '" + mobileNumber + "' is already registered.");
            }

            // BCrypt Hashing
            String hashedPassword = PasswordSecurity.hashPassword(password);

            User user = new User();
            user.setName(name.trim());
            user.setEmail(email);
            user.setPasswordHash(hashedPassword);
            user.setRole("MENTOR");
            user.setPhoneNumber(mobileNumber);
            user.setAvatarUrl("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150");

            int userId = userDAO.createUser(user);
            if (userId <= 0) {
                throw new RuntimeException("Failed to create mentor user credentials.");
            }
            user.setId(userId);

            Mentor mentor = new Mentor();
            mentor.setId(userId);
            mentor.setMentorStaffId(mentorStaffId);
            mentor.setDepartment(department.trim());
            mentor.setDesignation((String) payload.getOrDefault("designation", "Faculty Mentor & Placement Coordinator"));
            mentor.setCabinLocation((String) payload.getOrDefault("cabinLocation", "Faculty Block A, Room 302"));
            mentorDAO.createMentor(mentor);
        } else {
            throw new IllegalArgumentException("Invalid role specified. Must be 'STUDENT' or 'MENTOR'.");
        }

        return login(email, password);
    }
}
