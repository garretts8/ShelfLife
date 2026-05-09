//Connects Frontend to Backend.
//Configured HTTP client for API calls.
//Axios is a promise-based HTTP client for the browser and node.js.

import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

//Interceptor:Automatically attach JWT token to every request if it exists in localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

//Add response interceptor for error handling auth errors.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);


export default api;