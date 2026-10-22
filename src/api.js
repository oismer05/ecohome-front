// Dirección del backend. Express y Socket.IO comparten puerto (3000 por defecto).
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

/** Pequeño envoltorio de fetch que lanza un Error con el mensaje que envía la API. */
async function request(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const err = new Error('No se pudo conectar con el servidor. ¿Está encendido el backend?');
    err.network = true;
    throw err;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || data.message || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  me: (token) => request('/auth/me', { token }),
  // Unidad 3: catálogo con creador y contador "Nombre (N)"
  products: (token) => request('/products', { token }),
  createProduct: (token, product) => request('/products', { method: 'POST', token, body: product }),
  myStats: (token) => request('/users/me/stats', { token }),
  creatorsStats: (token) => request('/users/stats', { token }),
};
