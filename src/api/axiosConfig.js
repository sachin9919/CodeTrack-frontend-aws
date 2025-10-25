// frontend/src/api/axiosConfig.js

import axios from 'axios';

// Determine the base URL.
// In production (Amplify), this is process.env.VITE_API_URL (Render URL).
// In development (local machine), this defaults to localhost.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    // All subsequent calls will use this base URL.
    // Example: api.post('/user/signup') becomes https://codetrack-backend-aws.onrender.com/api/user/signup
    baseURL: BASE_URL + '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;

// hello minor fix