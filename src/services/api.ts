const API_BASE = import.meta.env.VITE_API_URL || '';

async function request<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers as Record<string, string>) };
  const res = await fetch(`${API_BASE}/api${path}`, { ...opts, headers, credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || 'Request failed');
  return data;
}

export const auth = {
  signup: (body: { name: string; email: string; password: string; role: string }) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request<{ user: { id: number; name: string; email: string; role: string } }>('/auth/me')
};

export const menu = {
  list: () => request<any[]>('/menu'),
  create: (body: any) => request('/menu', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string | number, body: any) => request(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string | number) => request(`/menu/${id}`, { method: 'DELETE' })
};

export const discounts = {
  list: () => request<any[]>('/discounts'),
  apply: (body: { menu_item_id: number; discount_percent: number }) => request('/discounts', { method: 'POST', body: JSON.stringify(body) }),
  remove: (id: string | number) => request(`/discounts/${id}`, { method: 'DELETE' })
};

export const orders = {
  list: () => request<any[]>('/orders'),
  all: () => request<any[]>('/orders/all'),
  create: (body: any) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  approve: (id: string | number) => request(`/orders/${id}/approve`, { method: 'POST' }),
  reject: (id: string | number) => request(`/orders/${id}/reject`, { method: 'POST' }),
  status: (id: string | number, status: string) => request(`/orders/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) })
};

export const notifications = {
  list: () => request<any[]>('/notifications'),
  markRead: (id: string | number) => request(`/notifications/${id}/read`, { method: 'POST' })
};
