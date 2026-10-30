package com.campus.placement.service;

import com.campus.placement.dao.ApplicationDAO;
import com.campus.placement.dao.CompanyDriveDAO;
import com.campus.placement.dao.FeedbackDAO;
import com.campus.placement.dao.LeetCodeDAO;
import com.campus.placement.dao.MentorDAO;
import com.campus.placement.dao.StudentDAO;
import com.campus.placement.model.Application;
import com.campus.placement.model.CompanyDrive;
import com.campus.placement.model.LeetCodeStats;
import com.campus.placement.model.Mentor;
import com.campus.placement.model.MentorFeedback;
import com.campus.placement.model.Student;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MentorService {
    private final MentorDAO mentorDAO = new MentorDAO();
    private final StudentDAO studentDAO = new StudentDAO();
    private final LeetCodeDAO leetCodeDAO = new LeetCodeDAO();
    private final CompanyDriveDAO driveDAO = new CompanyDriveDAO();
    private final ApplicationDAO applicationDAO = new ApplicationDAO();
    private final FeedbackDAO feedbackDAO = new FeedbackDAO();

    public Map<String, Object> getMentorDashboard(int mentorId) {
        Mentor mentor = mentorDAO.findById(mentorId);
        if (mentor == null) return null;

        List<Student> mentees = getMentees(mentorId);
        List<CompanyDrive> drives = driveDAO.findAll();
        List<Application> allApps = applicationDAO.findAll();

        double totalCgpa = 0;
        int totalLcSolved = 0;
        int placedCount = 0;
        int shortlistedCount = 0;

        List<Map<String, Object>> menteeCards = new ArrayList<>();

        for (Student s : mentees) {
            totalCgpa += s.getCgpa();
            if (s.getLeetCodeStats() != null) {
                totalLcSolved += s.getLeetCodeStats().getTotalSolved();
            }

            // Check applications for this student
            List<Application> sApps = applicationDAO.findByStudentId(s.getStudentId());
            boolean isSelected = false;
            boolean isShortlisted = false;
            for (Application a : sApps) {
                if ("SELECTED".equalsIgnoreCase(a.getStatus())) {
                    isSelected = true;
                }
                if ("SHORTLISTED".equalsIgnoreCase(a.getStatus()) || "TECHNICAL_ROUND".equalsIgnoreCase(a.getStatus())) {
                    isShortlisted = true;
                }
            }

            if (isSelected) placedCount++;
            else if (isShortlisted) shortlistedCount++;

            Map<String, Object> card = new HashMap<>();
            card.put("student", s);
            card.put("applicationsCount", sApps.size());
            card.put("isSelected", isSelected);
            card.put("isShortlisted", isShortlisted);
            card.put("applications", sApps);
            menteeCards.add(card);
        }

        double avgCgpa = mentees.isEmpty() ? 0.0 : Math.round((totalCgpa / mentees.size()) * 100.0) / 100.0;
        int avgLc = mentees.isEmpty() ? 0 : (totalLcSolved / mentees.size());

        Map<String, Object> data = new HashMap<>();
        data.put("mentor", mentor);
        data.put("menteesCount", mentees.size());
        data.put("averageCgpa", avgCgpa);
        data.put("totalLeetCodeSolved", totalLcSolved);
        data.put("averageLeetCodeSolved", avgLc);
        data.put("placedCount", placedCount);
        data.put("shortlistedCount", shortlistedCount);
        data.put("activeDrivesCount", drives.size());
        data.put("mentees", menteeCards);
        data.put("recentDrives", drives);

        return data;
    }

    public List<Student> getMentees(int mentorId) {
        List<Student> mentees = studentDAO.findByMentorId(mentorId);
        LeetCodeService leetCodeService = new LeetCodeService();
        for (Student s : mentees) {
            LeetCodeStats stats = leetCodeDAO.findByStudentId(s.getStudentId());
            if ((stats == null || stats.getTotalSolved() == 0) && s.getLeetcodeUsername() != null && !s.getLeetcodeUsername().trim().isEmpty()) {
                try {
                    stats = leetCodeService.syncLeetCodeHandle(s.getStudentId(), s.getLeetcodeUsername());
                } catch (Exception ignored) {}
            }
            s.setLeetCodeStats(stats);
            s.setAcademicRecords(studentDAO.getAcademicRecords(s.getStudentId()));
        }
        return mentees;
    }

    public boolean addFeedback(MentorFeedback feedback) {
        return feedbackDAO.addFeedback(feedback) > 0;
    }

    public List<MentorFeedback> getFeedbackByMentor(int mentorId) {
        return feedbackDAO.findByMentorId(mentorId);
    }

    public Mentor getMentorProfile(int mentorId) {
        return mentorDAO.findById(mentorId);
    }

    public Mentor getMentorProfileByUserId(int userId) {
        return mentorDAO.findByUserId(userId);
    }

    public boolean updateMentorProfile(int mentorId, String name, String phone, String department, String designation, String cabinLocation) {
        return mentorDAO.updateMentorProfile(mentorId, name, phone, department, designation, cabinLocation);
    }

    public List<Mentor> getAllMentors() {
        return mentorDAO.findAll();
    }
}
