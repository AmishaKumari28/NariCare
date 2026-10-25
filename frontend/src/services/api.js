
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export async function apiRequest(endpoint, options = {}) {
  const token = sessionStorage.getItem("sakhi_token");

  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    sessionStorage.removeItem("sakhi_token");
    sessionStorage.removeItem("sakhi_user");

    window.location.replace("/login");

    throw new Error("Your session has expired. Please log in again.");
  }

  if (!response.ok) {
    let message = "Something went wrong.";

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Use the default error message.
    }

    throw new Error(message);
  }

  return response.json();
}
