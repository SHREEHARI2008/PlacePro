package com.campus.placement.service;

import com.campus.placement.dao.ApplicationDAO;
import com.campus.placement.dao.CompanyDriveDAO;
import com.campus.placement.dao.StudentDAO;
import com.campus.placement.model.Application;
import com.campus.placement.model.CompanyDrive;
import com.campus.placement.model.Student;
import com.campus.placement.util.EligibilityEngine;

import java.util.List;

public class CompanyService {
    private final CompanyDriveDAO driveDAO = new CompanyDriveDAO();
    private final ApplicationDAO applicationDAO = new ApplicationDAO();
    private final StudentDAO studentDAO = new StudentDAO();

    public List<CompanyDrive> getAllDrives(Integer studentId) {
        List<CompanyDrive> drives = driveDAO.findAll();
        if (studentId != null) {
            Student student = studentDAO.findById(studentId);
            for (CompanyDrive d : drives) {
                if (student != null) {
                    EligibilityEngine.EligibilityResult result = EligibilityEngine.evaluateEligibility(student, d);
                    d.setEligible(result.isEligible());
                    d.setEligibilityReasons(result.getReasons());

                    Application app = applicationDAO.findByStudentAndDrive(studentId, d.getId());
                    if (app != null) {
                        d.setApplicationStatus(app.getStatus());
                    }
                }
            }
        }
        return drives;
    }

    public CompanyDrive getDriveById(int driveId) {
        return driveDAO.findById(driveId);
    }

    public int createDrive(CompanyDrive drive) {
        return driveDAO.createDrive(drive);
    }

    public boolean updateDrive(CompanyDrive drive) {
        return driveDAO.updateDrive(drive);
    }

    public boolean deleteDrive(int driveId) {
        return driveDAO.deleteDrive(driveId);
    }

    public boolean apply(int studentId, int driveId) {
        Application existing = applicationDAO.findByStudentAndDrive(studentId, driveId);
        if (existing != null) {
            return true; // Already applied
        }

        Student student = studentDAO.findById(studentId);
        CompanyDrive drive = driveDAO.findById(driveId);
        if (student == null || drive == null) {
            throw new IllegalArgumentException("Student or Company Drive does not exist.");
        }

        // Check eligibility rule before applying
        EligibilityEngine.EligibilityResult eligibility = EligibilityEngine.evaluateEligibility(student, drive);
        if (!eligibility.isEligible()) {
            throw new IllegalStateException("Student is not eligible for this company drive: " + String.join(", ", eligibility.getReasons()));
        }

        return applicationDAO.apply(studentId, driveId) > 0;
    }

    public List<Application> getStudentApplications(int studentId) {
        return applicationDAO.findByStudentId(studentId);
    }

    public List<Application> getMentorApplications(int mentorId) {
        return applicationDAO.findByMentorId(mentorId);
    }

    public List<Application> getDriveApplications(int driveId) {
        return applicationDAO.findByDriveId(driveId);
    }

    public List<Application> getDriveApplications(int driveId, Integer mentorId) {
        if (mentorId != null && mentorId > 0) {
            return applicationDAO.findByDriveIdAndMentorId(driveId, mentorId);
        }
        return applicationDAO.findByDriveId(driveId);
    }

    public List<Application> getAllApplications() {
        return applicationDAO.findAll();
    }

    public boolean updateApplicationStatus(int applicationId, String status, String remarks) {
        return applicationDAO.updateStatus(applicationId, status, remarks);
    }
}
