import axios from 'axios';

const API_URL = 'https://softwarera-backend.onrender.com/api/users/';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const login = (credentials) => {
  return axiosInstance.post('login', credentials);
};

const register = (userData) => {
  return axiosInstance.post('register', userData);
};

const authService = {
  login,
  register,
};

export default authService;