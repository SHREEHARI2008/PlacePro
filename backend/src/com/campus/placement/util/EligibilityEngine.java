package com.campus.placement.util;

import com.campus.placement.model.CompanyDrive;
import com.campus.placement.model.LeetCodeStats;
import com.campus.placement.model.Student;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class EligibilityEngine {

    public static class EligibilityResult {
        private final boolean eligible;
        private final boolean isEligible;
        private final List<String> reasons;
        private final double skillMatchPercentage;

        public EligibilityResult(boolean isEligible, List<String> reasons, double skillMatchPercentage) {
            this.eligible = isEligible;
            this.isEligible = isEligible;
            this.reasons = reasons != null ? reasons : new ArrayList<>();
            this.skillMatchPercentage = skillMatchPercentage;
        }

        public boolean isEligible() { return eligible; }
        public boolean getEligible() { return eligible; }
        public List<String> getReasons() { return reasons; }
        public List<String> getUnmetReasons() { return reasons; }
        public double getSkillMatchPercentage() { return skillMatchPercentage; }
    }

    public static EligibilityResult evaluateEligibility(Student student, CompanyDrive drive) {
        List<String> unmetReasons = new ArrayList<>();
        boolean eligible = true;

        if (student == null) {
            unmetReasons.add("Student profile not found.");
            return new EligibilityResult(false, unmetReasons, 0.0);
        }

        // 1. CGPA Criterion (Only record reason if criterion is unmet)
        if (student.getCgpa() < drive.getMinCgpa()) {
            eligible = false;
            unmetReasons.add(String.format("Minimum CGPA required: %.2f (Your CGPA: %.2f)", drive.getMinCgpa(), student.getCgpa()));
        }

        // 2. Backlog Criterion (Only record reason if active backlogs exceed maximum allowed)
        if (student.getActiveBacklogs() > drive.getMaxBacklogsAllowed()) {
            eligible = false;
            unmetReasons.add(String.format("Active backlogs/arrears exceed allowed limit: %d active (Allowed: %d)", student.getActiveBacklogs(), drive.getMaxBacklogsAllowed()));
        }

        // 3. Branch / Department Criterion (Bidirectional canonical branch matching)
        if (drive.getEligibleBranches() != null && !drive.getEligibleBranches().trim().isEmpty()) {
            Set<String> branches = Arrays.stream(drive.getEligibleBranches().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toSet());

            if (!isBranchMatching(student.getDepartment(), student.getDegree(), branches)) {
                eligible = false;
                String studentDept = student.getDepartment() != null ? student.getDepartment().trim() : "Not specified";
                unmetReasons.add(String.format("Branch/Department not eligible: %s (Eligible: %s)", studentDept, drive.getEligibleBranches()));
            }
        }

        // 4. 10th Percentage Criterion
        if (student.getTenthPercentage() != null && !student.getTenthPercentage().trim().isEmpty()) {
            try {
                double tenth = Double.parseDouble(student.getTenthPercentage().replace("%", "").trim());
                if (tenth > 0 && tenth < 60.0) {
                    eligible = false;
                    unmetReasons.add(String.format("10th percentage below required threshold: %.1f%% (Required: >= 60.0%%)", tenth));
                }
            } catch (Exception ignored) {}
        }

        // 5. 12th Percentage Criterion
        if (student.getTwelfthPercentage() != null && !student.getTwelfthPercentage().trim().isEmpty()) {
            try {
                double twelfth = Double.parseDouble(student.getTwelfthPercentage().replace("%", "").trim());
                if (twelfth > 0 && twelfth < 60.0) {
                    eligible = false;
                    unmetReasons.add(String.format("12th percentage below required threshold: %.1f%% (Required: >= 60.0%%)", twelfth));
                }
            } catch (Exception ignored) {}
        }

        return new EligibilityResult(eligible, unmetReasons, 100.0);
    }

    private static Set<String> getCanonicalBranchCodes(String text) {
        Set<String> codes = new HashSet<>();
        if (text == null || text.trim().isEmpty()) {
            codes.add("ALL");
            return codes;
        }
        String upper = text.toUpperCase().trim();
        if (upper.contains("ALL") || upper.contains("ANY") || upper.contains("OPEN TO ALL")) {
            codes.add("ALL");
            return codes;
        }

        // CSE / Computer Science / IT / Software
        if (upper.contains("COMPUTER") || upper.contains("COMPUTING") || upper.contains("SOFTWARE")
                || upper.matches(".*\\b(CSE|CS)\\b.*")) {
            codes.add("CSE");
        }
        // IT / Information Technology
        if (upper.contains("INFORMATION TECH") || upper.contains("INFO TECH")
                || upper.matches(".*\\b(IT)\\b.*")) {
            codes.add("IT");
        }
        // ECE / Electronics & Communication
        if (upper.contains("ELECTRONIC") || upper.contains("COMMUNICATION")
                || upper.matches(".*\\b(ECE|ETC|E&C)\\b.*")) {
            codes.add("ECE");
        }
        // EEE / Electrical & Electronics
        if (upper.contains("ELECTRICAL")
                || upper.matches(".*\\b(EEE|E&E)\\b.*")) {
            codes.add("EEE");
        }
        // MECH / Mechanical
        if (upper.contains("MECHANIC") || upper.contains("AUTOMOBILE") || upper.contains("AUTO")
                || upper.matches(".*\\b(MECH)\\b.*")) {
            codes.add("MECH");
        }
        // AIDS / AI & Data Science
        if (upper.contains("ARTIFICIAL") || upper.contains("DATA SCIENCE") || upper.contains("MACHINE LEARNING")
                || upper.matches(".*\\b(AIDS|AIML|AI|DS|ML)\\b.*")) {
            codes.add("AIDS");
        }
        // CIVIL / Civil Engineering
        if (upper.contains("CIVIL") || upper.matches(".*\\b(CIVIL)\\b.*")) {
            codes.add("CIVIL");
        }

        if (codes.isEmpty()) {
            codes.add(upper);
        }
        return codes;
    }

    public static boolean isBranchMatching(String studentDept, String studentDegree, Set<String> allowedBranches) {
        if (allowedBranches == null || allowedBranches.isEmpty()) return true;

        String studentCombined = ((studentDept != null ? studentDept : "") + " " + (studentDegree != null ? studentDegree : "")).trim();
        Set<String> studentCodes = getCanonicalBranchCodes(studentCombined);
        if (studentCodes.contains("ALL")) return true;

        String studentUpper = studentCombined.toUpperCase();

        for (String b : allowedBranches) {
            if (b == null || b.trim().isEmpty()) continue;
            String bUpper = b.trim().toUpperCase();

            if ("ALL".equals(bUpper) || "ANY".equals(bUpper) || "ALL BRANCHES".equals(bUpper)) return true;

            // Bidirectional substring match
            if (!studentUpper.isEmpty() && (studentUpper.contains(bUpper) || bUpper.contains(studentUpper))) {
                return true;
            }

            Set<String> driveCodes = getCanonicalBranchCodes(bUpper);
            if (driveCodes.contains("ALL")) return true;

            // Overlap check
            for (String code : studentCodes) {
                if (driveCodes.contains(code)) {
                    return true;
                }
            }
        }
        return false;
    }

    public static int computePlacementReadinessScore(Student student, LeetCodeStats lc) {
        if (student == null) return 0;

        // 1. CGPA component (max 50 pts)
        double cgpaScore = Math.min(50.0, (student.getCgpa() / 10.0) * 50.0);

        // 2. LeetCode component (max 50 pts)
        double lcScore = 0.0;
        if (lc != null) {
            // Target benchmark: 350+ solved gives max problem points
            double solvedPts = Math.min(30.0, (lc.getTotalSolved() / 350.0) * 30.0);
            // Quality bonus: medium + hard ratio
            int hardAndMed = lc.getMediumSolved() + (lc.getHardSolved() * 2);
            double qualityPts = Math.min(12.0, (hardAndMed / 200.0) * 12.0);
            // Streak points
            double streakPts = Math.min(8.0, (lc.getStreakDays() / 30.0) * 8.0);
            lcScore = solvedPts + qualityPts + streakPts;
        }

        // Backlog penalty (-12 per backlog)
        double backlogPenalty = student.getActiveBacklogs() * 12.0;

        int total = (int) Math.round(cgpaScore + lcScore - backlogPenalty);
        return Math.max(5, Math.min(99, total));
    }
}
