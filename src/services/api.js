const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

let refreshPromise = null;

async function refreshAccessToken() {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) return null;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
      .then(async response => {
        if (!response.ok) return null;
        const data = await response.json();
        if (data.access) localStorage.setItem('access_token', data.access);
        return data.access || null;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function api(path, options = {}) {
  const request = async () => {
    const token = localStorage.getItem('access_token');
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  };

  let response = await request();

  // Access tokens expire. Refresh once instead of clearing the user's session
  // and making persistent billing/order data appear to have disappeared.
  if (response.status === 401 && !path.includes('/auth/token/refresh/')) {
    const access = await refreshAccessToken();
    if (access) response = await request();
  }

  if (!response.ok) {
    const text = await response.text();
    let message = text || `HTTP ${response.status}`;
    try {
      const data = JSON.parse(text);
      message = data.detail || data.message || text;
    } catch (_) {
      // Keep the raw response when it is not JSON.
    }
    throw new Error(message);
  }

  return response.status === 204 ? null : response.json();
}

export async function login(username, password) {
  const data = await api('/api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  return data;
}
