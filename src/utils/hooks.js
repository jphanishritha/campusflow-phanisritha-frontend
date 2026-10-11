import { useCallback, useEffect, useRef, useState } from 'react';
import { errMsg } from '../api/client.js';

/** Loads data from an async function and exposes loading/error/reload. */
export function useFetch(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      setData(await fnRef.current());
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, deps);

  return { data, setData, loading, error, reload: load };
}

export function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
