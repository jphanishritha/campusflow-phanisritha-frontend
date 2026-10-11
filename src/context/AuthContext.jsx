import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthAPI, tokenStore } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  // Restore the session on page refresh.
  useEffect(() => {
    let cancelled = false;
    if (!tokenStore.get()) {
      setLoading(false);
      return undefined;
    }
    AuthAPI.me()
      .then((u) => { if (!cancelled) setUser(u); })
      .catch(() => { tokenStore.clear(); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Token rejected by the API -> drop the session.
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('cf:unauthorized', onUnauthorized);
    return () => window.removeEventListener('cf:unauthorized', onUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await AuthAPI.login({ email, password });
    tokenStore.set(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await AuthAPI.register({ name, email, password });
    tokenStore.set(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout, setUser }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
