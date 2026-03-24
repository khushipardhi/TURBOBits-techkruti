import { useEffect, useRef } from 'react';

export function usePolling(callback, intervalMs = 10000) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    savedCallback.current(); // initial call
    const id = setInterval(() => savedCallback.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}
