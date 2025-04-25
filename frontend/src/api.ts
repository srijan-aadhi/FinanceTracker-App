import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/',
  withCredentials: false, // for JWT, don't use cookies
  headers: { 'Content-Type': 'application/json' },
});


function getTokenExpiry(token: string): number | null {
  try {
    const [, payload] = token.split('.');
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === 'number' ? exp * 1000 : null; // ms
  } catch {
    return null;
  }
}

function forceLogout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken'); // if you store one
  window.location.href = '/login';
}


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    if (token && config.headers) {
      // 1) abort immediately if the token is already expired
      const expMs = getTokenExpiry(token);
      if (expMs !== null && expMs < Date.now()) {
        forceLogout();
        return Promise.reject(new axios.Cancel('Token expired'));
      }

      // 2) otherwise attach it
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      forceLogout();
    }
    return Promise.reject(error);
  }
);

export default api;
