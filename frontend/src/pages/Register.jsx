import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import msecBadge from '../assets/msec-badge.svg';
import {
  Lock,
  Mail,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  UserCheck,
  Shield,
  Phone,
  Code2,
  Hash,
  GraduationCap,
  Building2,
  Calendar
} from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Segmented Pill state: 'STUDENT' or 'MENTOR'
  const [selectedRole, setSelectedRole] = useState('STUDENT');

  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Student specific fields
  const [registerNumber, setRegisterNumber] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [yearSemester, setYearSemester] = useState('3rd Year / Sem 6');
  const [leetcodeUrl, setLeetcodeUrl] = useState('');

  // Mentor specific fields
  const [mentorEmployeeId, setMentorEmployeeId] = useState('');
  const [mentorDepartment, setMentorDepartment] = useState('Computer Science & Engineering');
  const [mobileNumber, setMobileNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password strength calculation (0 - 4)
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-slate-200', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Full Name is required.');
      return;
    }

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please provide a valid institutional or personal email address (e.g. user@institution.edu).');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    let payload = {
      role: selectedRole,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
    };

    if (selectedRole === 'STUDENT') {
      if (!registerNumber.trim()) {
        setError('University Register Number is required.');
        return;
      }
      if (!leetcodeUrl.trim()) {
        setError('LeetCode profile handle or URL is required.');
        return;
      }
      payload = {
        ...payload,
        registerNumber: registerNumber.trim().toUpperCase(),
        department: department,
        yearSemester: yearSemester,
        leetcodeUrl: leetcodeUrl.trim(),
      };
    } else {
      if (!mentorEmployeeId.trim()) {
        setError('Mentor Employee ID is required (e.g., MTR-2026).');
        return;
      }
      if (!mobileNumber.trim()) {
        setError('Mobile number is required for faculty verification.');
        return;
      }
      payload = {
        ...payload,
        mentorStaffId: mentorEmployeeId.trim().toUpperCase(),
        mentorId: mentorEmployeeId.trim().toUpperCase(),
        department: mentorDepartment,
        mobileNumber: mobileNumber.trim(),
      };
    }

    setLoading(true);
    try {
      const res = await register(payload);
      if (res.success) {
        if (res.user?.role === 'MENTOR') {
          navigate('/mentor/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setError(res.error || 'Registration failed. Please review your details.');
      }
    } catch (err) {
      setError('Failed to complete account registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4 py-8 selection:bg-[#2563eb] selection:text-white">
      <div className="w-full max-w-lg">
        {/* Brand Header */}
        <div className="text-center mb-6 space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white p-2 shadow-xs border border-slate-200 mb-1">
            <img src={msecBadge} alt="PlacePro Shield" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create your PlacePro Account
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Choose your academic role to setup your personalized workspace
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-5">
          {/* Segmented Pill Control for Role Switching */}
          <div className="p-1 rounded-xl bg-slate-100 border border-slate-200/80 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('STUDENT');
                setError('');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                selectedRole === 'STUDENT'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className={`w-4 h-4 ${selectedRole === 'STUDENT' ? 'text-[#2563eb]' : 'text-slate-400'}`} />
              <span>Student Registration</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('MENTOR');
                setError('');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                selectedRole === 'MENTOR'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className={`w-4 h-4 ${selectedRole === 'MENTOR' ? 'text-amber-500' : 'text-slate-400'}`} />
              <span>Faculty Mentor</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* 1. Full Name */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={selectedRole === 'STUDENT' ? 'e.g. Sreehari Nair' : 'e.g. Dr. Arvind Sharma'}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-all font-medium"
                />
              </div>
            </div>

            {/* ROLE-SPECIFIC FIELDS: STUDENT */}
            {selectedRole === 'STUDENT' && (
              <>
                {/* 2. University Register Number */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    University Register Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={registerNumber}
                      onChange={(e) => setRegisterNumber(e.target.value)}
                      placeholder="e.g. 253115104088"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-all font-mono"
                    />
                  </div>
                </div>

                {/* 3 & 4. Department and Year/Semester */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-all font-medium"
                    >
                      <option value="CSE">Computer Science (CSE)</option>
                      <option value="IT">Information Tech (IT)</option>
                      <option value="ECE">Electronics (ECE)</option>
                      <option value="EEE">Electrical (EEE)</option>
                      <option value="AIDS">AI & Data Science (AIDS)</option>
                      <option value="MECH">Mechanical (MECH)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Year / Semester <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={yearSemester}
                      onChange={(e) => setYearSemester(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-all font-medium"
                    >
                      <option value="1st Year / Sem 1">1st Year / Sem 1</option>
                      <option value="1st Year / Sem 2">1st Year / Sem 2</option>
                      <option value="2nd Year / Sem 3">2nd Year / Sem 3</option>
                      <option value="2nd Year / Sem 4">2nd Year / Sem 4</option>
                      <option value="3rd Year / Sem 5">3rd Year / Sem 5</option>
                      <option value="3rd Year / Sem 6">3rd Year / Sem 6</option>
                      <option value="4th Year / Sem 7">4th Year / Sem 7</option>
                      <option value="4th Year / Sem 8">4th Year / Sem 8</option>
                    </select>
                  </div>
                </div>

                {/* 5. LeetCode Profile URL or Handle */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    LeetCode Profile URL or Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Code2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={leetcodeUrl}
                      onChange={(e) => setLeetcodeUrl(e.target.value)}
                      placeholder="https://leetcode.com/u/your_handle/ or your_handle"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-all font-mono"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    PlacePro will connect to LeetCode's live GraphQL service to sync your verified problem counts and streaks.
                  </span>
                </div>
              </>
            )}

            {/* ROLE-SPECIFIC FIELDS: MENTOR */}
            {selectedRole === 'MENTOR' && (
              <>
                {/* 2. Mentor Employee ID */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Mentor Employee / Staff ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={mentorEmployeeId}
                      onChange={(e) => setMentorEmployeeId(e.target.value)}
                      placeholder="e.g. MTR-2026"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-all font-mono"
                    />
                  </div>
                </div>

                {/* 3. Department */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={mentorDepartment}
                      onChange={(e) => setMentorDepartment(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-all font-medium"
                    >
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                      <option value="Electrical & Electronics">Electrical & Electronics</option>
                      <option value="Placement & Training Cell">Placement & Training Cell</option>
                    </select>
                  </div>
                </div>

                {/* 4. Mobile Number */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Faculty Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+91 9840123456"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-all font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 6. Email Address */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Institutional / Personal Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-all font-mono"
                />
              </div>
            </div>

            {/* 7. Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Password Security:</span>
                  <span className="font-bold text-slate-700">{strengthLabels[strength]}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`rounded-full transition-colors ${
                        strength >= step ? strengthColors[strength] : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] active:scale-[0.99] text-white font-semibold text-xs tracking-wide transition-all shadow-xs flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </>
              )}
            </button>
          </form>

          {/* Navigation link back to login */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have a registered account?{' '}
              <Link
                to="/login"
                className="font-bold text-[#2563eb] hover:text-[#1d4ed8] hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
