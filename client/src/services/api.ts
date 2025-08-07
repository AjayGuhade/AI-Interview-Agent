// import axios from 'axios';

// const API = axios.create({
//   baseURL: 'http://localhost:5050/api',
//   withCredentials: true,
// });

// export const fetchCheatingLogs = () => API.get('/cheatingLogs');
// export const fetchInterviewStats = () => API.get('/interview'); // Customize this route if needed

// export const fetchApplicants = () => axios.get('/api/applicants');
// // export const createInterview = (data) => axios.post('/api/interviewSchedule', data);
// // export const uploadResume = (file) => axios.post('/api/applicants/upload', file);
// // export const addQuestion = (data) => axios.post('/api/questionAnswers', data);



// import axios from 'axios';

// const API = axios.create({
//   baseURL: 'http://localhost:5050/api',
//   withCredentials: true,
// });

// export const fetchCheatingLogs = () => API.get('/cheatingLogs');
// export const fetchInterviewStats = () => API.get('/interview'); // Customize this route if needed

// export const fetchApplicants = () => axios.get('/api/applicants');
// // export const createInterview = (data) => axios.post('/api/interviewSchedule', data);
// // export const uploadResume = (file) => axios.post('/api/applicants/upload', file);
// // export const addQuestion = (data) => axios.post('/api/questionAnswers', data);


// src/services/api.ts
const BASE_URL = "http://localhost:5050/api"; // Change this for staging/prod

// --- Generic API Request Function ---
const request = async (endpoint: string, method = "GET", body?: any) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  // If you use JWT token
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || res.statusText);
  }

  return res.json();
};



// ---- Multipart Form Request ----
const formRequest = async (endpoint: string, method = "POST", body: FormData) => {
  const headers: Record<string, string> = {};

  // Add token if available
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || res.statusText);
  }

  return res.json();
};

// ---- Modular Endpoints ----

// Auth APIs
export const AuthAPI = {
  login: (email: string, password: string) =>
    request("/users/login", "POST", { Email: email, Password: password }),

  register: (data: any) => request("/users/register", "POST", data),
};

// User APIs
export const UserAPI = {
  getProfile: (userId: string) => request(`/users/${userId}`, "GET"),
  updateProfile: (userId: string, data: any) =>
    request(`/users/${userId}`, "PUT", data),
};

// Drive APIs

export const DriveAPI = {
  getAllDrives: () => request("/project-recruitment", "GET"),
  getDriveById: (id: string) => request(`/project-recruitment/${id}`, "GET"),
  createDrive: (data: any) => request("/project-recruitment", "POST", data),


  // createDrive: (data: any) => request("/drives", "POST", data),
  // getAllDrives: () => request("/drives", "GET"),
  // getDriveById: (id: string) => request(`/drives/${id}`, "GET"),
  uploadDrive: (formData: FormData) => formRequest("/drive/upload", "POST", formData),

};
// Interview APIs


// Drive APIs
export const DriveAPI2 = {
  getDriveById: (id: string) => request(`/project-recruitment/${id}`, "GET"),
  getAllDrives: () => request("/project-recruitment", "GET"),
};

// Applicants APIs


// Email APIs
export const EmailAPI = {
  sendEmail: (applicantId: string, emailData: any) =>
    request("/send-email", "POST", { applicantId, emailData }),
};
export const CompanyAPI = {
  getAllCompanies: () => request("/companies", "GET"),
};

// api.ts
// export const InterviewAPI = {

// };
export const InterviewAPI = {
  startInterview: (data: any) => request("/interview/start", "POST", data),
  submitAnswer: (data: any) => request("/interview/answer", "POST", data),
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);

    const res = await fetch(`${BASE_URL}/upload-resume`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || `Upload failed with status ${res.status}`);
    }

    return res.json();
  },

  sendChatAnswer: async (
    sessionId: string,
    answer: string,
    interviewDuration: number,
    currentTimeElapsed: number
  ) => {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        answer,
        interviewDuration,
        currentTimeElapsed,
      }),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to get next question');
    }

    return res.json();
  },
};
// In src/services/api.ts

export const ApplicantAPI = {
  getByDrive: (driveId: string) => request(`/applicants/byRecruitmentDrive/${driveId}`),

  getByMeetingId: (meetingId: string) =>
    request(`/applicant/by-meeting/${meetingId}`, "GET"),
  getApplicantsByDrive: (driveId: string) =>
    request(`/applicants/byRecruitmentDrive/${driveId}`, "GET"),
};
