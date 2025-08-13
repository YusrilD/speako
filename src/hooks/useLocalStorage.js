import { useEffect, useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initialValue;
    } catch {
      const raw = localStorage.getItem(key);
      return raw !== null ? raw : initialValue;
    }
  });

  useEffect(() => {
    try {
      const value =
        typeof state === "string" ? state : JSON.stringify(state);
      localStorage.setItem(key, value);
    } catch {
    }
  }, [key, state]);

  return [state, setState];
}
