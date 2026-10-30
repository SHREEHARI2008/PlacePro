import React, { useState } from 'react';
import { User, FileText, Edit3, Save, CheckCircle2 } from 'lucide-react';

export default function ProfileSummaryCard({ profile = {}, onUpdateProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name || '',
    email: profile.email || '',
    department: profile.department || 'CSE',
    cgpa: profile.cgpa || '8.75',
    resumeUrl: profile.resumeUrl || '',
    skills: profile.skills || 'Java, React, SQL, Data Structures',
    summary: profile.summary || 'Aspiring Software Development Engineer with strong problem-solving skills in DSA and web development.',
  });
  const [savedMsg, setSavedMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile(formData);
    }
    setSavedMsg('Profile and resume details updated successfully!');
    setIsEditing(false);
    setTimeout(() => setSavedMsg(''), 4000);
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 space-y-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-[#0f172a]">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0f172a]">Student Profile & Resume Dossier</h3>
            <p className="text-[11px] text-slate-500">Quick-edit portfolio details submitted to recruiter ATS</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[#0f172a] text-xs font-semibold border border-slate-200 transition-all flex items-center space-x-1.5"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
        </button>
      </div>

      {savedMsg && (
        <div className="p-3 rounded-lg bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-[#15803d] shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {isEditing ? (
        <form
          id="student-profile-form"
          name="studentProfileForm"
          action="/api/student/profile"
          method="POST"
          onSubmit={handleSubmit}
          className="space-y-4 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name-input" className="block text-slate-700 font-medium mb-1">Full Name</label>
              <input
                id="name-input"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>

            <div>
              <label htmlFor="email-input" className="block text-slate-700 font-medium mb-1">Email Address</label>
              <input
                id="email-input"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="department-input" className="block text-slate-700 font-medium mb-1">Department</label>
              <select
                id="department-input"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              >
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
              </select>
            </div>

            <div>
              <label htmlFor="cgpa-input" className="block text-slate-700 font-medium mb-1">CGPA</label>
              <input
                id="cgpa-input"
                name="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-mono"
              />
            </div>

            <div>
              <label htmlFor="resume-url-input" className="block text-slate-700 font-medium mb-1">Resume Link (PDF URL)</label>
              <input
                id="resume-url-input"
                name="resumeUrl"
                type="url"
                value={formData.resumeUrl}
                onChange={handleChange}
                placeholder="https://drive.google.com/..."
                className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-mono"
              />
            </div>
          </div>

          <div>
            <label htmlFor="skills-input" className="block text-slate-700 font-medium mb-1">Key Tech Skills (Comma Separated)</label>
            <input
              id="skills-input"
              name="skills"
              type="text"
              value={formData.skills}
              onChange={handleChange}
              placeholder="Java, Python, React, SQL..."
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-mono"
            />
          </div>

          <div>
            <label htmlFor="summary-input" className="block text-slate-700 font-medium mb-1">Professional Summary</label>
            <textarea
              id="summary-input"
              name="summary"
              rows={2}
              value={formData.summary}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#0f172a] hover:bg-slate-800 text-white font-bold transition-all flex items-center justify-center space-x-2 text-xs shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile Dossier</span>
          </button>
        </form>
      ) : (
        <div className="space-y-3.5 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-[#0f172a] text-sm">{formData.name || profile.name || 'Rahul Verma'}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                  {formData.department || profile.department || 'CSE'}
                </span>
              </div>
              <p className="text-slate-500 text-[11px] font-mono">{formData.email || profile.email || 'student@campus.edu'}</p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Verified CGPA</span>
                <span className="text-base font-bold text-[#15803d]">{formData.cgpa || profile.cgpa || '8.75'}</span>
              </div>
              {formData.resumeUrl && (
                <a
                  href={formData.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-semibold transition-all flex items-center space-x-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Resume PDF</span>
                </a>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 block uppercase mb-1">Professional Summary</span>
            <p className="text-slate-700 leading-relaxed text-xs">{formData.summary}</p>
          </div>

          <div className="flex items-center space-x-1.5 flex-wrap gap-1">
            <span className="text-[11px] font-semibold text-slate-500">Skills Tags:</span>
            {formData.skills.split(',').map((s, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {s.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
