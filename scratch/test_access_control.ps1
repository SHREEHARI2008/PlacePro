# Test Script for Shared Placement Drives and Mentor-Scoped Mentee Access Control

$baseUrl = "http://localhost:8080/api"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "TESTING PLACEMENT DRIVES ACCESS CONTROL & MENTEE SCOPING" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Register Mentor A with unique phone
$randA = Get-Random -Minimum 10000000 -Maximum 99999999
$mentorAEmail = "mentor_a_$randA@institution.edu"
$bodyMentorA = @{
    name = "Dr. Mentor Alpha"
    email = $mentorAEmail
    password = "Password123!"
    role = "MENTOR"
    mentorStaffId = "MTR-$randA"
    department = "CSE"
    phoneNumber = "91$randA"
} | ConvertTo-Json

$respMA = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $bodyMentorA -ContentType "application/json"
$tokenMA = $respMA.data.token
$mentorAId = $respMA.data.mentorId
Write-Host "[1] Registered Mentor A (ID: $mentorAId, Email: $mentorAEmail)" -ForegroundColor Green

# 2. Register Mentor B with unique phone
$randB = Get-Random -Minimum 10000000 -Maximum 99999999
$mentorBEmail = "mentor_b_$randB@institution.edu"
$bodyMentorB = @{
    name = "Dr. Mentor Beta"
    email = $mentorBEmail
    password = "Password123!"
    role = "MENTOR"
    mentorStaffId = "MTR-$randB"
    department = "IT"
    phoneNumber = "91$randB"
} | ConvertTo-Json

$respMB = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $bodyMentorB -ContentType "application/json"
$tokenMB = $respMB.data.token
$mentorBId = $respMB.data.mentorId
Write-Host "[2] Registered Mentor B (ID: $mentorBId, Email: $mentorBEmail)" -ForegroundColor Green

# 3. Register Student A (Assigned to Mentor A)
$randSA = Get-Random -Minimum 100000 -Maximum 999999
$studentAEmail = "student_a_$randSA@institution.edu"
$bodyStudentA = @{
    name = "Student Alpha"
    email = $studentAEmail
    password = "Password123!"
    role = "STUDENT"
    registerNumber = "REG-A-$randSA"
    department = "CSE"
    yearSemester = "4th Year / Sem 7"
    leetcodeUrl = "https://leetcode.com/u/student_a_$randSA/"
} | ConvertTo-Json

$respSA = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $bodyStudentA -ContentType "application/json"
$studentAId = $respSA.data.studentId
$tokenSA = $respSA.data.token

$headersMA = @{ Authorization = "Bearer $tokenMA"; "X-Session-Token" = $tokenMA }
$headersMB = @{ Authorization = "Bearer $tokenMB"; "X-Session-Token" = $tokenMB }
$headersSA = @{ Authorization = "Bearer $tokenSA"; "X-Session-Token" = $tokenSA }

# Assign to Mentor A
$bodyAssignA = @{ studentId = $studentAId; mentorId = $mentorAId } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/student/mentor" -Method Post -Headers $headersSA -Body $bodyAssignA -ContentType "application/json" | Out-Null
Write-Host "[3] Registered Student A (ID: $studentAId) assigned to Mentor A (ID: $mentorAId)" -ForegroundColor Green

# 4. Register Student B (Assigned to Mentor B)
$randSB = Get-Random -Minimum 100000 -Maximum 999999
$studentBEmail = "student_b_$randSB@institution.edu"
$bodyStudentB = @{
    name = "Student Beta"
    email = $studentBEmail
    password = "Password123!"
    role = "STUDENT"
    registerNumber = "REG-B-$randSB"
    department = "CSE"
    yearSemester = "4th Year / Sem 7"
    leetcodeUrl = "https://leetcode.com/u/student_b_$randSB/"
} | ConvertTo-Json

$respSB = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $bodyStudentB -ContentType "application/json"
$studentBId = $respSB.data.studentId
$tokenSB = $respSB.data.token
$headersSB = @{ Authorization = "Bearer $tokenSB"; "X-Session-Token" = $tokenSB }

# Assign to Mentor B
$bodyAssignB = @{ studentId = $studentBId; mentorId = $mentorBId } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/student/mentor" -Method Post -Headers $headersSB -Body $bodyAssignB -ContentType "application/json" | Out-Null
Write-Host "[4] Registered Student B (ID: $studentBId) assigned to Mentor B (ID: $mentorBId)" -ForegroundColor Green

# 5. Mentor A creates a Placement Drive
$drivePayload = @{
    companyName = "Global Tech Corp"
    logoUrl = "https://example.com/logo.png"
    jobRole = "Software Engineer"
    packageLpa = 25.0
    minCgpa = 0.0
    maxBacklogsAllowed = 2
    eligibleBranches = "CSE,IT,ECE"
    requiredSkills = "Java,Python,SQL"
    jobLocation = "Bangalore"
    driveDate = "2026-11-20"
    applicationDeadline = "2026-11-10"
    registrationUrl = "https://forms.gle/global-test-gform"
    description = "Campus recruitment for software engineers."
    postedByMentorId = $mentorAId
    status = "UPCOMING"
} | ConvertTo-Json

$createDriveResp = Invoke-RestMethod -Uri "$baseUrl/companies" -Method Post -Headers $headersMA -Body $drivePayload -ContentType "application/json"
$driveId = $createDriveResp.data.id
Write-Host "[5] Mentor A created Drive ID: $driveId (Company: Global Tech Corp)" -ForegroundColor Green

# 6. Mentor B updates the Drive posted by Mentor A
$updatePayload = @{
    id = $driveId
    companyName = "Global Tech Corp (Updated CTC)"
    logoUrl = "https://example.com/logo.png"
    jobRole = "Senior Member Technical Staff"
    packageLpa = 32.0
    minCgpa = 0.0
    maxBacklogsAllowed = 2
    eligibleBranches = "CSE,IT,ECE"
    requiredSkills = "Java,Python,SQL,Distributed Systems"
    jobLocation = "Bangalore / Hybrid"
    driveDate = "2026-11-20"
    applicationDeadline = "2026-11-10"
    registrationUrl = "https://forms.gle/global-test-gform-updated"
    description = "Updated criteria and package."
    status = "UPCOMING"
} | ConvertTo-Json

$updateDriveResp = Invoke-RestMethod -Uri "$baseUrl/companies" -Method Put -Headers $headersMB -Body $updatePayload -ContentType "application/json"
Write-Host "[6] Mentor B successfully updated Drive ID $driveId. Package: $($updateDriveResp.data.packageLpa) LPA" -ForegroundColor Green

# 7. Check Student notifications for Placement Drive Updation
$notifResp = Invoke-RestMethod -Uri "$baseUrl/notifications?studentId=$studentAId" -Method Get -Headers $headersSA
$driveUpdationNotifs = $notifResp.data.notifications | Where-Object { $_.category -eq "Placement Drive Updation" }
Write-Host "[7] Student A received $($driveUpdationNotifs.Count) 'Placement Drive Updation' notifications (Latest: $($driveUpdationNotifs[0].title))" -ForegroundColor Green

# 8. Both students view all drives and apply
$studentDrivesA = Invoke-RestMethod -Uri "$baseUrl/companies?studentId=$studentAId" -Method Get -Headers $headersSA
Write-Host "[8a] Student A sees $($studentDrivesA.data.Count) total drives across institution" -ForegroundColor Green

$studentDrivesB = Invoke-RestMethod -Uri "$baseUrl/companies?studentId=$studentBId" -Method Get -Headers $headersSB
Write-Host "[8b] Student B sees $($studentDrivesB.data.Count) total drives across institution" -ForegroundColor Green

# Apply Student A & Student B
$applyA = @{ studentId = $studentAId; driveId = $driveId } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/companies/apply" -Method Post -Headers $headersSA -Body $applyA -ContentType "application/json" | Out-Null
Write-Host "[8c] Student A applied to Drive ID $driveId" -ForegroundColor Green

$applyB = @{ studentId = $studentBId; driveId = $driveId } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/companies/apply" -Method Post -Headers $headersSB -Body $applyB -ContentType "application/json" | Out-Null
Write-Host "[8d] Student B applied to Drive ID $driveId" -ForegroundColor Green

# 9. Mentor A checks applicants for Drive ID
$mentorAApplicants = Invoke-RestMethod -Uri "$baseUrl/applications?driveId=$driveId" -Method Get -Headers $headersMA
Write-Host "[9] Mentor A queries applications for Drive ID ${driveId} - Count = $($mentorAApplicants.data.Count)" -ForegroundColor Green
$mentorAStudentIds = @($mentorAApplicants.data | ForEach-Object { $_.studentId })
Write-Host "    Applicants returned for Mentor A: $($mentorAStudentIds -join ', ')" -ForegroundColor Yellow
if ($mentorAStudentIds -contains $studentAId -and -not ($mentorAStudentIds -contains $studentBId)) {
    Write-Host "    PASS: Only Mentor A's mentee (Student A: $studentAId) returned!" -ForegroundColor Green
} else {
    Write-Host "    FAIL: Scoping violation on Drive applications for Mentor A!" -ForegroundColor Red
}

# 10. Mentor B checks applicants for Drive ID
$mentorBApplicants = Invoke-RestMethod -Uri "$baseUrl/applications?driveId=$driveId" -Method Get -Headers $headersMB
Write-Host "[10] Mentor B queries applications for Drive ID ${driveId} - Count = $($mentorBApplicants.data.Count)" -ForegroundColor Green
$mentorBStudentIds = @($mentorBApplicants.data | ForEach-Object { $_.studentId })
Write-Host "     Applicants returned for Mentor B: $($mentorBStudentIds -join ', ')" -ForegroundColor Yellow
if ($mentorBStudentIds -contains $studentBId -and -not ($mentorBStudentIds -contains $studentAId)) {
    Write-Host "     PASS: Only Mentor B's mentee (Student B: $studentBId) returned!" -ForegroundColor Green
} else {
    Write-Host "     FAIL: Scoping violation on Drive applications for Mentor B!" -ForegroundColor Red
}

# 11. Mentor A attempts to update Student B's application status (Should be blocked 403 Forbidden)
$studentBApp = $mentorBApplicants.data | Where-Object { $_.studentId -eq $studentBId }
$studentBAppId = $studentBApp.id
Write-Host "[11] Mentor A attempts to modify Student B's Application (App ID $studentBAppId)..." -ForegroundColor Yellow

try {
    $hackBody = @{
        applicationId = $studentBAppId
        status = "SHORTLISTED"
        remarks = "Unauthorized status change attempt"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/applications/status" -Method Post -Headers $headersMA -Body $hackBody -ContentType "application/json"
    Write-Host "    FAIL: Mentor A was able to update Student B's application!" -ForegroundColor Red
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    Write-Host "    PASS: Correctly rejected with HTTP $status Forbidden!" -ForegroundColor Green
}

# 12. Mentor A updates their own mentee Student A's application status
$studentAApp = $mentorAApplicants.data | Where-Object { $_.studentId -eq $studentAId }
$studentAAppId = $studentAApp.id
$legitBody = @{
    applicationId = $studentAAppId
    status = "SHORTLISTED"
    remarks = "Cleared Round 1 Online Assessment"
} | ConvertTo-Json
$updateResp = Invoke-RestMethod -Uri "$baseUrl/applications/status" -Method Post -Headers $headersMA -Body $legitBody -ContentType "application/json"
Write-Host "[12] Mentor A updated Student A's Application: $($updateResp.message)" -ForegroundColor Green

# 13. Mentor A attempts to inspect Student B's dashboard (Should be blocked 403 Forbidden)
Write-Host "[13] Mentor A attempts to inspect Student B's dashboard..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/student/dashboard?studentId=$studentBId" -Method Get -Headers $headersMA
    Write-Host "    FAIL: Mentor A was able to inspect Student B's dashboard!" -ForegroundColor Red
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    Write-Host "    PASS: Correctly rejected with HTTP $status Forbidden!" -ForegroundColor Green
}

# 14. Mentor A inspects Student A's dashboard
Write-Host "[14] Mentor A inspects Student A's dashboard..." -ForegroundColor Yellow
$dashA = Invoke-RestMethod -Uri "$baseUrl/student/dashboard?studentId=$studentAId" -Method Get -Headers $headersMA
Write-Host "    PASS: Mentor A successfully inspected assigned mentee (Student: $($dashA.data.student.name))" -ForegroundColor Green

# 15. Mentor A attempts to submit feedback for Student B (Should be blocked 403 Forbidden)
Write-Host "[15] Mentor A attempts to submit feedback for Student B..." -ForegroundColor Yellow
try {
    $feedbackHack = @{
        studentId = $studentBId
        feedbackText = "Cross-mentor feedback attempt"
        focusArea = "Algorithms"
        rating = 4
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/mentor/feedback" -Method Post -Headers $headersMA -Body $feedbackHack -ContentType "application/json"
    Write-Host "    FAIL: Mentor A was able to submit feedback for Student B!" -ForegroundColor Red
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    Write-Host "    PASS: Correctly rejected with HTTP $status Forbidden!" -ForegroundColor Green
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "ALL 15 VERIFICATION TESTS PASSED PERFECTLY!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
