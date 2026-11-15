// Small API client. Every call has a timeout so the page never hangs forever.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body, timeoutMs = 30000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(API_URL + path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    let data = null;
    try { data = await res.json(); } catch { /* not JSON */ }
    if (!res.ok) {
      throw new ApiError(data?.message || "Something went wrong. Please try again.", res.status);
    }
    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new ApiError("That took too long. Please try again, or pick a preset.", 408);
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError("Cannot reach the data service. Is the backend running on port 8000?", 0);
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  health: () => request("/health", { timeoutMs: 5000 }),
  cities: () => request("/cities"),
  variables: () => request("/variables"),
  presets: () => request("/presets"),
  forecast: (city, days = 3) => request(`/forecast/${city}?days=${days}`, { timeoutMs: 12000 }),
  method: () => request("/method"),
  series: (q) => request(`/series?${new URLSearchParams(q)}`),
  trend: (q) => request(`/trend?${new URLSearchParams(q)}`),
  ask: (question) => request("/ask", { method: "POST", body: { question }, timeoutMs: 60000 }),
  startCompute: (body) => request("/compute", { method: "POST", body, timeoutMs: 15000 }),
  computeStatus: (id) => request(`/compute/${id}`, { timeoutMs: 10000 }),
};
