// src/api.js
import axios from 'axios';

export const api = axios.create({
    baseURL: `https://abrasion-unbent-leotard.ngrok-free.dev/api/`,
    withCredentials: true, // MUST be true so cookies are automatically sent with every request
    headers: {
        'ngrok-skip-browser-warning': 'true' // <-- OTO KLUCZ DLA NGROKA
    }
});

// Intercept 401 Unauthorized to refresh cookies seamlessly
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const requestUrl = error.config?.url || '';
        const status = error.response?.status;

        // 1. Check if the failed request was a LOGIN attempt
        if (requestUrl.includes('token/') && status === 401) {
            return Promise.reject(error)
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Triggers backend to issue new HttpOnly cookies automatically
                await api.post('token/refresh/');
                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);
