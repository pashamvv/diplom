import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
  withCredentials: false,
});
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Server not responding");
      return Promise.reject(error);
    }

    const status = error.response.status;
    const currentPath = window.location.pathname;

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (currentPath !== "/login") window.location.href = "/login";
    }

    if (status === 403) {
      alert("У вас нет прав доступа");
      if (currentPath !== "/") window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;