import axios from "axios";
import Cookies from "js-cookie";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "/api";

export const AUTH_TOKEN_KEY = "auth_token";
export const CSRF_COOKIE_KEY = "thingsnxt_csrf_token";

/**
 * Pre-configured Axios instance for application-wide API requests.
 * Configured with credentials: true for secure HttpOnly cookie management.
 */
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Essential for receiving and sending HttpOnly authentication cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach CSRF token for state-changing operations
api.interceptors.request.use(
  (config) => {
    // 1. Double-Submit Cookie CSRF protection
    const method = (config.method || "get").toLowerCase();
    if (["post", "put", "delete", "patch"].includes(method)) {
      const csrfToken =
        Cookies.get(CSRF_COOKIE_KEY) ||
        Cookies.get("csrf_token") ||
        Cookies.get("XSRF-TOKEN");
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    }

    // 2. Attach Authorization Bearer token (supports cross-origin / Vercel / PWA / mobile)
    const token =
      Cookies.get(AUTH_TOKEN_KEY) ||
      (typeof localStorage !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null);
    if (token && !config.headers.Authorization && token !== "cookie-session" && token !== "active") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Single-flight refresh token queue to prevent duplicate refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: handle automatic token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if 401 Unauthorized and not already retried
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      const isAuthRoute =
        originalRequest.url?.includes("/login") ||
        originalRequest.url?.includes("/token") ||
        originalRequest.url?.includes("/refresh");

      if (isAuthRoute) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const csrfToken =
          Cookies.get(CSRF_COOKIE_KEY) || Cookies.get("csrf_token");
        await axios.post(
          `${API_BASE}/refresh`,
          {},
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
            },
          }
        );

        processQueue(null);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        Cookies.remove(AUTH_TOKEN_KEY);
        Cookies.remove("thingsnxt_user_session");
        if (typeof localStorage !== "undefined") {
          try { localStorage.removeItem(AUTH_TOKEN_KEY); } catch {}
        }

        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.href = "/login?session_expired=true";
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

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
