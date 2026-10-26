// Single place for talking to the backend. Set VITE_API_URL to the API's base
// (e.g. https://your-api.up.railway.app) in Vercel; vite.config.ts normalises it.
export const API_BASE: string = import.meta.env.VITE_API_ORIGIN;

const TOKEN_KEY = 'spa_token';

export const tokenStore = {
  get: () => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set: (t: string | null) => {
    try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* private mode */ }
  },
};

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function api<T = unknown>(path: string, options: { method?: string; body?: unknown; query?: Record<string, string | number | undefined> } = {}): Promise<T> {
  const url = new URL(`${API_BASE}/api${path}`);
  for (const [k, v] of Object.entries(options.query ?? {})) {
    if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
  }
  const headers: Record<string, string> = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(url, { method: options.method ?? (options.body !== undefined ? 'POST' : 'GET'), headers, body: options.body !== undefined ? JSON.stringify(options.body) : undefined });
  } catch {
    throw new ApiError('Could not reach the server. Check your internet connection and try again.', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) {
      tokenStore.set(null);
      window.dispatchEvent(new Event('spa:signed-out'));
    }
    throw new ApiError((data as { error?: string }).error || 'Something went wrong. Please try again.', res.status);
  }
  return data as T;
}
