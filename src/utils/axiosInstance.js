import axios from 'axios';

let baseURL = import.meta.env.VITE_REACT_APP_BASE_URL;

// Fallback to default if env variable is not set
if (!baseURL) {
  baseURL = 'http://localhost:3000/api';
  console.warn('VITE_REACT_APP_BASE_URL not set, using default:', baseURL);
}

const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log error for debugging
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error.config.url);
    } else if (error.message === 'Network Error') {
      console.error('Network Error - Backend might be down or CORS issue:', error.config.url);
    } else if (!error.response) {
      console.error('No response from server:', error.config?.url, error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
