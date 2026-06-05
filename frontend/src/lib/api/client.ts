import axios from "axios";

// Direct cross-origin calls to the Laravel backend.
// CORS is configured on the backend to allow requests from the frontend origin.
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api",
  headers: {
    "Accept": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true,
});



apiClient.interceptors.request.use((config) => {
  if (typeof document === 'undefined') return config;  // SSR guard

  const cookies = document.cookie.split(';');
  const xsrfCookie = cookies.find(c => c.trim().startsWith('XSRF-TOKEN='));
  
  if (xsrfCookie) {
    const rawValue = xsrfCookie.split('=').slice(1).join('=').trim();
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(rawValue);
  }
  
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      const url: string = originalRequest.url ?? "";
      if (!url.includes("/auth/")) {
        const { useAuthStore } = await import("@/stores/authStore");
        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
