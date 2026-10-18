import Cookies from "js-cookie";
import api, { API_BASE, AUTH_TOKEN_KEY } from "./api";

/**
 * Common Authentication and Session management utilities.
 */

export function getToken() {
  return Cookies.get(AUTH_TOKEN_KEY);
}

export function setToken(token, expiresDays = 1) {
  Cookies.set(AUTH_TOKEN_KEY, token, { expires: expiresDays });
}

export function removeToken() {
  Cookies.remove(AUTH_TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
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

// OAuth2 Password Flow login
export async function login(username, password) {
  const formData = new URLSearchParams();
  formData.append("username", username.trim());
  formData.append("password", password);

  const response = await api.post("/token", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const token = response.data?.access_token;
  if (token) {
    setToken(token, 1);
  }

  return response.data;
}

// User registration / sign up
export async function signup({ username, email, password, full_name, name }) {
  const cleanEmail = email.toLowerCase().trim();
  // Ensure a valid username is provided or derived from name/email
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

// Logout
export function logout(redirectUrl = "/login") {
  removeToken();
  if (typeof window !== "undefined") {
    window.location.href = redirectUrl;
  }
}
