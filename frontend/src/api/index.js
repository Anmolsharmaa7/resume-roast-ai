const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("resumeRoastToken");

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error(
      "Unable to connect to the backend. Make sure the backend is running on port 5001."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

/* =========================================================
   AUTH API
   ========================================================= */

export const authApi = {
  signup: (userData) =>
    apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  me: () => apiFetch("/auth/me"),

  logout: () =>
    apiFetch("/auth/logout", {
      method: "POST",
    }),
};

/* =========================================================
   RESUME API
   ========================================================= */

export const resumeApi = {
  upload: (formData) =>
    apiFetch("/resumes/upload", {
      method: "POST",
      body: formData,
    }),

  getResumes: () =>
    apiFetch("/resumes"),

  getResume: (id) =>
    apiFetch(`/resumes/${id}`),

  analyze: (id, data) =>
    apiFetch(`/resumes/${id}/analyze`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAnalysis: (id) =>
    apiFetch(`/resumes/${id}/analysis`),

  improve: (id) =>
    apiFetch(`/resumes/${id}/improve`, {
      method: "POST",
    }),

  getVersions: (id) =>
    apiFetch(`/resumes/${id}/versions`),

  updateVersion: (id, versionId, content) =>
    apiFetch(`/resumes/${id}/versions/${versionId}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    }),

  download: async (id) => {
    const token = localStorage.getItem("resumeRoastToken");

    let response;

    try {
      response = await fetch(
        `${API_URL}/resumes/${id}/download`,
        {
          headers: {
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
        }
      );
    } catch (error) {
      throw new Error(
        "Unable to connect to the backend."
      );
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));

      throw new Error(
        data.message || "Unable to download resume."
      );
    }

    return response;
  },
};
