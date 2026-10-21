import Cookies from "js-cookie";
import api, { API_BASE, AUTH_TOKEN_KEY, CSRF_COOKIE_KEY } from "./api";

export const USER_SESSION_KEY = "thingsnxt_user_session";

/**
 * Common Authentication and Session management utilities.
 * Uses secure HttpOnly cookies set by FastAPI backend.
 */

export function isAuthenticated() {
  if (typeof window === "undefined") return false;
  return Boolean(
    Cookies.get(CSRF_COOKIE_KEY) ||
    Cookies.get(USER_SESSION_KEY) ||
    Cookies.get(AUTH_TOKEN_KEY)
  );
}

export function getToken() {
  if (!isAuthenticated()) return null;
  // Return cookie session identifier for compatibility with existing components
  return "cookie-session";
}

export function setToken(_token, expiresDays = 7) {
  // Flag indicating active authenticated session on the client
  Cookies.set(USER_SESSION_KEY, "active", { expires: expiresDays, path: "/" });
}

export function removeToken() {
  Cookies.remove(AUTH_TOKEN_KEY, { path: "/" });
  Cookies.remove(USER_SESSION_KEY, { path: "/" });
  Cookies.remove(CSRF_COOKIE_KEY, { path: "/" });
}

export function getGoogleAuthUrl() {
  return `${API_BASE}/auth/google`;
}

/**
 * Validation helpers
 */
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim());
}

export function validatePassword(password) {
  return (
    password &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
}

/**
 * Auth API Operations
 */

// Fetch current user details via session cookie
export async function getMe() {
  const response = await api.get("/me");
  return response.data;
}

// Request a short-lived (60s) single-use scoped ticket token for WebSockets
export async function getWsTicket() {
  try {
    const response = await api.post("/auth/ws-ticket");
    return response.data?.ticket || null;
  } catch {
    return null;
  }
}

// OAuth2 Password Flow login (Sets HttpOnly access & refresh cookies on response)
export async function login(username, password) {
  const formData = new URLSearchParams();
  formData.append("username", username.trim());
  formData.append("password", password);

  const response = await api.post("/token", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  // Set lightweight client session indicator (no sensitive JWT stored)
  setToken("active", 7);

  return response.data;
}

// User registration / sign up
export async function signup({ username, email, password, full_name, name }) {
  const cleanEmail = email.toLowerCase().trim();
  const cleanUsername = (
    username ||
    name?.replace(/\s+/g, "_") ||
    cleanEmail.split("@")[0]
  )
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "");

  const response = await api.post("/signup", {
    email: cleanEmail,
    username: cleanUsername.length >= 3 ? cleanUsername : `${cleanUsername}123`,
    password,
    full_name: (full_name || name || "").trim() || null,
  });
  return response.data;
}

// Request password reset email
export async function forgotPassword(email) {
  const response = await api.post("/forgot-password", {
    email: email.toLowerCase().trim(),
  });
  return response.data;
}

// Verify password reset token
export async function verifyResetToken(token) {
  const response = await api.get(`/verify-reset-token?token=${encodeURIComponent(token)}`);
  return response.data;
}

// Reset password with token
export async function resetPassword(token, newPassword) {
  const response = await api.post("/reset-password", {
    token,
    new_password: newPassword,
  });
  return response.data;
}

// Logout: Revoke server session and delete cookies
export async function logout(redirectUrl = "/login") {
  try {
    await api.post("/logout");
  } catch {
    // Continue cleanup even if server request fails
  } finally {
    removeToken();
    if (typeof window !== "undefined") {
      window.location.href = redirectUrl;
    }
  }
}
