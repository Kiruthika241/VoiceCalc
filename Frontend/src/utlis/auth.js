// src/utlis/auth.js

export function saveAuth(user, token) {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
}

export function getCurrentUser() {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem("token");
}

export function isLoggedIn() {
  // 👉 user is considered logged in only if token exists
  return !!getToken();
}

export function clearAuth() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}
