const API_BASE = import.meta.env.VITE_API_URL || "";

/**
 * Helper function to make API requests to the backend.
 * In development, VITE_API_URL is empty, so it uses relative paths (proxied by Vite).
 * In production, VITE_API_URL is set to the Railway URL, routing directly to the backend.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Ensure we don't have double slashes if API_BASE is misconfigured with a trailing slash
  const cleanBaseUrl = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const fullUrl = `${cleanBaseUrl}${endpoint}`;
  
  // Log the absolute URL to the console to help debug routing/CORS issues
  console.log(`[Frontend Fetch Debug] Executing request to: ${fullUrl}`);
  
  return fetch(fullUrl, options);
}
