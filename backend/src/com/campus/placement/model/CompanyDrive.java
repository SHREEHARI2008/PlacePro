package com.campus.placement.model;

import java.sql.Date;
import java.sql.Timestamp;
import java.util.List;

public class CompanyDrive {
    private int id;
    private String companyName;
    private String logoUrl;
    private String jobRole;
    private double packageLpa;
    private double minCgpa;
    private int maxBacklogsAllowed;
    private String eligibleBranches; // comma separated: CSE,IT,ECE,EEE
    private String requiredSkills;   // comma separated: Java,Python,SQL,DSA
    private String jobLocation;
    private Date driveDate;
    private Date applicationDeadline;
    private String description;
    private String registrationUrl;
    private Integer postedByMentorId;
    private String status; // "UPCOMING", "ONGOING", "COMPLETED"
    private Timestamp createdAt;
    
    // Auxiliary / Calculated fields for current student context
    private int applicantCount;
    private boolean eligible;
    private boolean isEligible;
    private List<String> eligibilityReasons;
    private String applicationStatus; // null if not applied, or "APPLIED", "SHORTLISTED", etc.

    public CompanyDrive() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getJobRole() { return jobRole; }
    public void setJobRole(String jobRole) { this.jobRole = jobRole; }

    public double getPackageLpa() { return packageLpa; }
    public void setPackageLpa(double packageLpa) { this.packageLpa = packageLpa; }

    public double getMinCgpa() { return minCgpa; }
    public void setMinCgpa(double minCgpa) { this.minCgpa = minCgpa; }

    public int getMaxBacklogsAllowed() { return maxBacklogsAllowed; }
    public void setMaxBacklogsAllowed(int maxBacklogsAllowed) { this.maxBacklogsAllowed = maxBacklogsAllowed; }

    public String getEligibleBranches() { return eligibleBranches; }
    public void setEligibleBranches(String eligibleBranches) { this.eligibleBranches = eligibleBranches; }

    public String getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(String requiredSkills) { this.requiredSkills = requiredSkills; }

    public String getJobLocation() { return jobLocation; }
    public void setJobLocation(String jobLocation) { this.jobLocation = jobLocation; }

    public Date getDriveDate() { return driveDate; }
    public void setDriveDate(Date driveDate) { this.driveDate = driveDate; }

    public Date getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(Date applicationDeadline) { this.applicationDeadline = applicationDeadline; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getRegistrationUrl() { return registrationUrl; }
    public void setRegistrationUrl(String registrationUrl) { this.registrationUrl = registrationUrl; }

    public Integer getPostedByMentorId() { return postedByMentorId; }
    public void setPostedByMentorId(Integer postedByMentorId) { this.postedByMentorId = postedByMentorId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public int getApplicantCount() { return applicantCount; }
    public void setApplicantCount(int applicantCount) { this.applicantCount = applicantCount; }

    public boolean isEligible() { return eligible; }
    public boolean getEligible() { return eligible; }
    public void setEligible(boolean eligible) { 
        this.eligible = eligible; 
        this.isEligible = eligible; 
    }

    public List<String> getEligibilityReasons() { return eligibilityReasons; }
    public void setEligibilityReasons(List<String> eligibilityReasons) { this.eligibilityReasons = eligibilityReasons; }

    public String getApplicationStatus() { return applicationStatus; }
    public void setApplicationStatus(String applicationStatus) { this.applicationStatus = applicationStatus; }
}
