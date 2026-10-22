import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';

const TOKEN_KEY = 'ecohome.token';
const AuthContext = createContext(null);

// localStorage puede estar bloqueado (modo privado): nunca debe romper la app.
const store = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: (t) => { try { localStorage.setItem(TOKEN_KEY, t); } catch { /* sin persistencia */ } },
  clear: () => { try { localStorage.removeItem(TOKEN_KEY); } catch { /* nada */ } },
};

export function AuthProvider({ children }) {
  // El token vive en estado de React y se copia a localStorage para sobrevivir a F5.
  const [token, setToken] = useState(() => store.get());
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(store.get()));
  const [notice, setNotice] = useState('');   // mensaje para mostrar en el login (sesión vencida, etc.)
  const [stats, setStats] = useState(null);   // { productsCreated, label: "Nombre (N)" }

  const logout = useCallback((reason = '') => {
    store.clear();
    setToken(null);
    setUser(null);
    setStats(null);
    setNotice(reason);
  }, []);

  // Al abrir la app con un token guardado, se confirma con el backend que sigue siendo válido.
  useEffect(() => {
    if (!token || user) { setChecking(false); return undefined; }
    let cancelled = false;
    api.me(token)
      .then(({ user: u }) => { if (!cancelled) setUser(u); })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401 || err.status === 404) logout('Tu sesión venció. Inicia sesión de nuevo.');
      })
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, [token, user, logout]);

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    store.set(data.token);
    setNotice('');
    setUser(data.user);
    setToken(data.token);
    return data.user;
  }, []);

  // Contador de productos creados por el usuario autenticado (GET /users/me/stats)
  const refreshStats = useCallback(async () => {
    if (!token) return;
    try { setStats(await api.myStats(token)); } catch { /* se reintenta en el próximo cambio */ }
  }, [token]);

  useEffect(() => { if (token && user) refreshStats(); }, [token, user, refreshStats]);

  // Tras crear un producto el número cambia al instante y luego se confirma con el backend.
  const bumpStats = useCallback(() => {
    setStats((s) => (s && user ? { ...s, productsCreated: s.productsCreated + 1, label: `${user.name} (${s.productsCreated + 1})` } : s));
    refreshStats();
  }, [user, refreshStats]);

  const value = useMemo(
    () => ({ token, user, checking, notice, login, logout, stats, refreshStats, bumpStats }),
    [token, user, checking, notice, login, logout, stats, refreshStats, bumpStats]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
};
