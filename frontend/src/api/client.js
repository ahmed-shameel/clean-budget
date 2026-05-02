const BASE_URL = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const getCategories = () => request('/categories');

export const getTransactions = (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
  ).toString();
  return request(`/transactions${query ? `?${query}` : ''}`);
};

export const createTransaction = (data) =>
  request('/transactions', { method: 'POST', body: JSON.stringify(data) });

export const updateTransaction = (id, data) =>
  request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteTransaction = (id) =>
  request(`/transactions/${id}`, { method: 'DELETE' });

export const getBudgets = (month) => {
  const query = month ? `?month=${month}` : '';
  return request(`/budgets${query}`);
};

export const upsertBudget = (data) =>
  request('/budgets', { method: 'POST', body: JSON.stringify(data) });

export const deleteBudget = (id) =>
  request(`/budgets/${id}`, { method: 'DELETE' });

export const getDashboardSummary = () => request('/dashboard/summary');

export const getInsights = () => request('/insights');

// --- Profiles ---
export const getProfiles = () => request('/profiles');

export const createProfile = (data) =>
  request('/profiles', { method: 'POST', body: JSON.stringify(data) });

export const updateProfile = (id, data) =>
  request(`/profiles/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteProfile = (id) =>
  request(`/profiles/${id}`, { method: 'DELETE' });

export const getProfileBudgets = (id) => request(`/profiles/${id}/budgets`);

export const applyProfile = (id, month) =>
  request(`/profiles/${id}/apply`, { method: 'POST', body: JSON.stringify({ month }) });

// --- Reset ---
export const resetAll = () => request('/reset', { method: 'POST' });
