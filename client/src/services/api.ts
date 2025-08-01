import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5050/api',
  withCredentials: true,
});

export const fetchCheatingLogs = () => API.get('/cheatingLogs');
export const fetchInterviewStats = () => API.get('/interview'); // Customize this route if needed

export const fetchApplicants = () => axios.get('/api/applicants');
// export const createInterview = (data) => axios.post('/api/interviewSchedule', data);
// export const uploadResume = (file) => axios.post('/api/applicants/upload', file);
// export const addQuestion = (data) => axios.post('/api/questionAnswers', data);