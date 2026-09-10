// API client for NYAYAI backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("nyayai_token");
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("nyayai_token");
      localStorage.removeItem("nyayai_user");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ access_token: string; token_type: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => apiFetch<any>("/auth/me"),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
};

// Inmates
export const inmatesApi = {
  list: (params?: { search?: string; status?: string; stage?: string; skip?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    if (params?.stage) query.set("stage", params.stage);
    if (params?.skip) query.set("skip", String(params.skip));
    if (params?.limit) query.set("limit", String(params.limit));
    return apiFetch<{ total: number; items: any[] }>(`/inmates?${query}`);
  },
  get: (id: number) => apiFetch<any>(`/inmates/${id}`),
  assessment: (id: number) => apiFetch<any>(`/inmates/${id}/assessment`),
  delays: (id: number) => apiFetch<any>(`/inmates/${id}/delays`),
  actions: (id: number) => apiFetch<any>(`/inmates/${id}/actions`),
  updateStatus: (id: number, body: any) =>
    apiFetch(`/inmates/${id}/status`, { method: "PATCH", body: JSON.stringify(body) }),
  mvpRecords: (id: number) => apiFetch<any>(`/inmates/${id}/mvp-records`),
  uploadDocument: async (id: number, file: File, documentType: string, caseId?: number) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", documentType);
    if (caseId) formData.append("case_id", String(caseId));
    const res = await fetch(`${API_BASE}/inmates/${id}/documents`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Document upload failed" }));
      throw new Error(error.detail || "Document upload failed");
    }
    return res.json();
  },
};

// Analytics
export const analyticsApi = {
  dashboard: () => apiFetch<any>("/analytics/dashboard"),
  compliance: () => apiFetch<any>("/analytics/compliance"),
  delaySummary: () => apiFetch<any>("/analytics/delay-summary"),
};

// Audit
export const auditApi = {
  list: (params?: { skip?: number; limit?: number; user_email?: string; action?: string }) => {
    const query = new URLSearchParams();
    if (params?.skip) query.set("skip", String(params.skip));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.user_email) query.set("user_email", params.user_email);
    if (params?.action) query.set("action", params.action);
    return apiFetch<{ total: number; items: any[] }>(`/audit?${query}`);
  },
};
