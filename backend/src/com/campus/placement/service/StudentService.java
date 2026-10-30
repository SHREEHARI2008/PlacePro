package com.campus.placement.service;

import com.campus.placement.dao.ApplicationDAO;
import com.campus.placement.dao.CompanyDriveDAO;
import com.campus.placement.dao.FeedbackDAO;
import com.campus.placement.dao.LeetCodeDAO;
import com.campus.placement.dao.StudentDAO;
import com.campus.placement.model.AcademicRecord;
import com.campus.placement.model.Application;
import com.campus.placement.model.CompanyDrive;
import com.campus.placement.model.LeetCodeStats;
import com.campus.placement.model.MentorFeedback;
import com.campus.placement.model.Student;
import com.campus.placement.util.EligibilityEngine;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class StudentService {
    private final StudentDAO studentDAO = new StudentDAO();
    private final LeetCodeDAO leetCodeDAO = new LeetCodeDAO();
    private final CompanyDriveDAO driveDAO = new CompanyDriveDAO();
    private final ApplicationDAO applicationDAO = new ApplicationDAO();
    private final FeedbackDAO feedbackDAO = new FeedbackDAO();

    public Map<String, Object> getDashboardData(int studentId) {
        Student student = studentDAO.findById(studentId);
        if (student == null) return null;

        LeetCodeStats lcStats = leetCodeDAO.findByStudentId(studentId);
        List<AcademicRecord> academicRecords = studentDAO.getAcademicRecords(studentId);
        List<CompanyDrive> allDrives = driveDAO.findAll();
        List<Application> myApplications = applicationDAO.findByStudentId(studentId);
        List<MentorFeedback> feedbackList = feedbackDAO.findByStudentId(studentId);

        if (lcStats == null && student.getLeetcodeUsername() != null && !student.getLeetcodeUsername().trim().isEmpty()) {
            try {
                lcStats = new LeetCodeService().syncLeetCodeHandle(studentId, student.getLeetcodeUsername());
            } catch (Exception ignored) {}
        }

        // Count eligible drives and evaluate eligibility on each
        int eligibleCount = 0;
        for (CompanyDrive d : allDrives) {
            EligibilityEngine.EligibilityResult res = EligibilityEngine.evaluateEligibility(student, d);
            d.setEligible(res.isEligible());
            d.setEligibilityReasons(res.getReasons());
            Application app = applicationDAO.findByStudentAndDrive(studentId, d.getId());
            if (app != null) {
                d.setApplicationStatus(app.getStatus());
            }
            if (res.isEligible()) {
                eligibleCount++;
            }
        }

        // Placement readiness score
        int readinessScore = EligibilityEngine.computePlacementReadinessScore(student, lcStats);

        List<com.campus.placement.model.Assessment> assessments = new com.campus.placement.dao.AssessmentDAO().findByDepartmentForStudent(student.getDepartment(), student.getStudentId());

        Map<String, Object> data = new HashMap<>();
        data.put("student", student);
        data.put("leetcodeStats", lcStats);
        data.put("academicRecords", academicRecords);
        data.put("readinessScore", readinessScore);
        data.put("totalDrivesCount", allDrives.size());
        data.put("eligibleDrivesCount", eligibleCount);
        data.put("eligibleDrives", allDrives);
        data.put("applicationsCount", myApplications.size());
        data.put("recentApplications", myApplications);
        data.put("mentorFeedback", feedbackList);
        data.put("assignedAssessments", assessments);

        return data;
    }

    public Student getProfile(int studentId) {
        Student s = studentDAO.findById(studentId);
        if (s != null) {
            s.setAcademicRecords(studentDAO.getAcademicRecords(studentId));
            s.setLeetCodeStats(leetCodeDAO.findByStudentId(studentId));
        }
        return s;
    }

    public boolean updateProfile(Student student) {
        return studentDAO.updateStudent(student);
    }

    public boolean saveAcademicRecord(AcademicRecord record) {
        boolean ok = studentDAO.addOrUpdateAcademicRecord(record);
        if (ok) {
            // Recalculate average CGPA
            List<AcademicRecord> records = studentDAO.getAcademicRecords(record.getStudentId());
            if (!records.isEmpty()) {
                double sum = 0;
                int backlogs = 0;
                for (AcademicRecord r : records) {
                    sum += r.getGpa();
                    backlogs += r.getBacklogs();
                }
                double avg = Math.round((sum / records.size()) * 100.0) / 100.0;
                Student s = studentDAO.findById(record.getStudentId());
                if (s != null) {
                    s.setCgpa(avg);
                    s.setActiveBacklogs(backlogs);
                    studentDAO.updateStudent(s);
                }
            }
        }
        return ok;
    }
}
