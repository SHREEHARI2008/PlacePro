package com.campus.placement.model;

public class AcademicRecord {
    private int id;
    private int studentId;
    private int semester;
    private double gpa;
    private int credits;
    private int totalSubjects;
    private int backlogs;

    public AcademicRecord() {}

    public AcademicRecord(int id, int studentId, int semester, double gpa, int credits, int totalSubjects, int backlogs) {
        this.id = id;
        this.studentId = studentId;
        this.semester = semester;
        this.gpa = gpa;
        this.credits = credits;
        this.totalSubjects = totalSubjects;
        this.backlogs = backlogs;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public double getGpa() { return gpa; }
    public void setGpa(double gpa) { this.gpa = gpa; }

    public int getCredits() { return credits; }
    public void setCredits(int credits) { this.credits = credits; }

    public int getTotalSubjects() { return totalSubjects; }
    public void setTotalSubjects(int totalSubjects) { this.totalSubjects = totalSubjects; }

    public int getBacklogs() { return backlogs; }
    public void setBacklogs(int backlogs) { this.backlogs = backlogs; }
}
