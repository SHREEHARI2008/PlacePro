import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token to all outgoing requests
api.interceptors.request.use(
  (config) => {
    try {
      const saved = localStorage.getItem('cpms_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.token) {
          config.headers['Authorization'] = `Bearer ${parsed.token}`;
          config.headers['X-Session-Token'] = parsed.token;
        }
      }
    } catch (e) {
      console.error('Error attaching auth token:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 / 403 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Session expired or unauthenticated. Redirecting to login...');
      localStorage.removeItem('cpms_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403 && error.response?.data?.redirect) {
      console.warn('Forbidden access, redirecting to authorized workspace:', error.response.data.redirect);
      window.location.href = error.response.data.redirect;
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
};

export const studentAPI = {
  getDashboard: (studentId) => api.get(`/student/dashboard?studentId=${studentId}`),
  getProfile: (studentId) => api.get(`/student/profile?studentId=${studentId}`),
  updateProfile: (data) => api.post('/student/profile', data),
  saveAcademicRecord: (data) => api.post('/student/academics', data),
  updateMentor: (studentId, mentorId) => api.post('/student/mentor', { studentId, mentorId }),
  updateResume: (studentId, resumeDriveUrl) => api.post('/student/resume', { studentId, resumeDriveUrl }),
};

export const companyAPI = {
  getCompanies: (studentId) => api.get(studentId ? `/companies?studentId=${studentId}` : '/companies'),
  postCompany: (data) => api.post('/companies', data),
  updateCompany: (data) => api.put('/companies', data),
  applyCompany: (studentId, driveId) => api.post('/companies/apply', { studentId, driveId }),
  getApplications: (params) => {
    const qParts = [];
    if (params?.studentId) qParts.push(`studentId=${encodeURIComponent(params.studentId)}`);
    if (params?.driveId) qParts.push(`driveId=${encodeURIComponent(params.driveId)}`);
    if (params?.mentorId) qParts.push(`mentorId=${encodeURIComponent(params.mentorId)}`);
    const query = qParts.length > 0 ? `?${qParts.join('&')}` : '';
    return api.get(`/applications${query}`);
  },
  updateApplicationStatus: (applicationId, status, remarks) => 
    api.post('/applications/status', { applicationId, status, remarks }),
};

export const leetcodeAPI = {
  getStats: (studentId) => api.get(`/leetcode/stats?studentId=${studentId}`),
  syncProfile: (studentId, username) => api.post('/leetcode/sync', { studentId, username }),
  getLeaderboard: () => api.get('/leetcode/leaderboard'),
  getSkillBoost: (studentId) => api.get(`/leetcode/skill-boost?studentId=${studentId}`),
};

export const userAPI = {
  getProfile: (params) => {
    let q = '';
    if (params?.studentId) q = `?studentId=${params.studentId}`;
    else if (params?.userId) q = `?userId=${params.userId}`;
    return api.get(`/user/profile${q}`);
  },
  updateProfile: (data) => api.put('/user/profile', data),
};

export const mentorAPI = {
  getMentors: () => api.get('/mentors'),
  getDashboard: (mentorId) => api.get(`/mentor/dashboard?mentorId=${mentorId}`),
  getProfile: (params) => {
    let q = '';
    if (params?.mentorId) q = `?mentorId=${params.mentorId}`;
    else if (params?.userId) q = `?userId=${params.userId}`;
    return api.get(`/mentor/profile${q}`);
  },
  updateProfile: (data) => api.put('/mentor/profile', data),
  getMentees: (mentorId) => api.get(`/mentor/mentees?mentorId=${mentorId}`),
  addFeedback: (data) => api.post('/mentor/feedback', data),
  getFeedback: (mentorId) => api.get(`/mentor/feedback?mentorId=${mentorId}`),
};

export const assessmentAPI = {
  getAssessments: (params) => {
    const qParts = [];
    if (params?.department) qParts.push(`department=${encodeURIComponent(params.department)}`);
    if (params?.mentorId) qParts.push(`mentorId=${encodeURIComponent(params.mentorId)}`);
    if (params?.studentId) qParts.push(`studentId=${encodeURIComponent(params.studentId)}`);
    const q = qParts.length > 0 ? `?${qParts.join('&')}` : '';
    return api.get(`/assessments${q}`);
  },
  createAssessment: (data) => api.post('/assessments', data),
  deleteAssessment: (id) => api.delete(`/assessments?id=${encodeURIComponent(id)}`),
  toggleAssessmentCompletion: (data) => api.post('/assessments/toggle-completion', data),
  getStudentAssessments: (studentId) => api.get(`/assessments?studentId=${encodeURIComponent(studentId)}`),
};

export const notificationAPI = {
  getNotifications: (params) => {
    const qParts = [];
    if (params?.userId) qParts.push(`userId=${encodeURIComponent(params.userId)}`);
    if (params?.studentId) qParts.push(`studentId=${encodeURIComponent(params.studentId)}`);
    const q = qParts.length > 0 ? `?${qParts.join('&')}` : '';
    return api.get(`/notifications${q}`);
  },
  markAsRead: (notificationId) => api.post('/notifications/read', { notificationId }),
  markAllAsRead: (userId) => api.post('/notifications/read-all', { userId }),
  createNotification: (data) => api.post('/notifications', data),
};

export const skillBoosterAPI = {
  getCurrent: (params) => {
    const qParts = [];
    if (params?.studentId) qParts.push(`studentId=${encodeURIComponent(params.studentId)}`);
    if (params?.userId) qParts.push(`userId=${encodeURIComponent(params.userId)}`);
    const q = qParts.length > 0 ? `?${qParts.join('&')}` : '';
    return api.get(`/skill-booster/current${q}`);
  },
  publishBatch: (data) => api.post('/mentor/skill-booster', data),
  toggleQuestion: (data) => api.post('/student/skill-booster/toggle', data),
};

export default api;
