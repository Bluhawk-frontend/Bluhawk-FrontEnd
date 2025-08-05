// api.js
import axios from "axios";
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URLL || "https://api.example.com",
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor (Optional: For adding tokens)
api.interceptors.request.use(
  (config) => {
   const token = Cookies.get('access_token'); 
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Optional: For error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error?.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;
