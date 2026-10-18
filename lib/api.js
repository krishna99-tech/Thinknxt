import axios from "axios";
import Cookies from "js-cookie";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://192.168.29.139:8000";

export const AUTH_TOKEN_KEY = "auth_token";

/**
 * Pre-configured Axios instance for application-wide API requests.
 */
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get(AUTH_TOKEN_KEY);
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract standardized error message
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Extracts a human-friendly error string from Axios/FastAPI error responses.
 */
export function getErrorMessage(error, fallback = "An unexpected error occurred. Please try again.") {
  if (!error) return fallback;
  
  const detail = error.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
  }

  const message = error.response?.data?.message;
  if (typeof message === "string") return message;

  return error.message || fallback;
}

/**
 * Fetches public platform configuration (branding, maintenance state, and feature flags)
 */
export async function getPublicAppConfig() {
  try {
    const response = await api.get("/app/config");
    return response.data;
  } catch (err) {
    console.warn("Failed to fetch public platform config:", err);
    return null;
  }
}

export default api;

