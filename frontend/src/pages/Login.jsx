import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import msecBadge from '../assets/msec-badge.svg';
import {
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both your registered email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim().toLowerCase(), password);
      if (res.success) {
        if (res.user?.role === 'MENTOR') {
          navigate('/mentor/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setError(res.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err) {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4 selection:bg-[#2563eb] selection:text-white">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white p-2 shadow-xs border border-slate-200 mb-2">
            <img src={msecBadge} alt="PlacePro Shield" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign in to PlacePro
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Campus Placement Management &amp; Skill Growth Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email Field */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-700 font-semibold">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] active:scale-[0.99] text-white font-semibold text-xs tracking-wide transition-all shadow-xs flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </>
              )}
            </button>
          </form>

          {/* Registration Prompt */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have a PlacePro account?{' '}
              <Link
                to="/register"
                className="font-bold text-[#2563eb] hover:text-[#1d4ed8] hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Feature badges footer */}
        <div className="mt-8 flex items-center justify-center space-x-6 text-[11px] text-slate-400">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>BCrypt Secured</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center space-x-1.5">
            <GraduationCap className="w-4 h-4 text-slate-400" />
            <span>Role-Isolated Portals</span>
          </div>
        </div>
      </div>
    </div>
  );
}
