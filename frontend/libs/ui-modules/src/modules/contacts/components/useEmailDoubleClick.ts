import { useEffect, useRef, useState } from 'react';

const DOUBLE_CLICK_DELAY = 300;

/** Separates delayed email editing from native double-click composition. */
export const useEmailDoubleClick = (onEmailClick?: (email: string) => void) => {
  const [open, setOpen] = useState(false);
  const pendingClickRef = useRef<{
    email: string;
    timeoutId: number;
  } | null>(null);

  /** Schedules single-click editing and cancels a pending second click. */
  const handleEmailClick = (email: string) => {
    const pendingClick = pendingClickRef.current;

    if (pendingClick?.email === email) {
      window.clearTimeout(pendingClick.timeoutId);
      pendingClickRef.current = null;
      return;
    }

    if (pendingClick) {
      window.clearTimeout(pendingClick.timeoutId);
    }

    pendingClickRef.current = {
      email,
      timeoutId: window.setTimeout(() => {
        pendingClickRef.current = null;
        setOpen(true);
      }, DOUBLE_CLICK_DELAY),
    };
  };

  /** Cancels pending editing and composes mail or opens the editor as a fallback. */
  const handleEmailDoubleClick = (email: string) => {
    if (pendingClickRef.current) {
      window.clearTimeout(pendingClickRef.current.timeoutId);
      pendingClickRef.current = null;
    }
    setOpen(!onEmailClick);
    onEmailClick?.(email);
  };

  useEffect(
    () => () => {
      if (pendingClickRef.current) {
        window.clearTimeout(pendingClickRef.current.timeoutId);
      }
    },
    [],
  );

  return { open, setOpen, handleEmailClick, handleEmailDoubleClick };
};
