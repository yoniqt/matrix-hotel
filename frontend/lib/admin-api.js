const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_KEY = "admin_token";

export function getAdminToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Wraps fetch with the admin's bearer token and redirects to login on a
// 401 (missing/expired session) so every admin page doesn't have to
// duplicate that check.
export async function adminFetch(path, options = {}) {
  const token = getAdminToken();

  // FormData bodies (file uploads) need the browser to set its own
  // multipart Content-Type with boundary - forcing application/json here
  // would corrupt the request.
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body && !isFormData ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (res.status === 401) {
    clearAdminToken();
    window.location.href = "/admin/login";
    throw new Error("Not authenticated");
  }

  return res;
}
