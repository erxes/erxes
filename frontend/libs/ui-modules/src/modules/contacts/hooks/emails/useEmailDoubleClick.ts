import { useEffect, useRef, useState } from 'react';
import type { EmailDoubleClickState } from 'ui-modules/modules/contacts/types/contactEmails';

const DOUBLE_CLICK_DELAY = 500;

export const useEmailDoubleClick = (
  onEmailClick?: (email: string) => void,
): EmailDoubleClickState => {
  const [open, setOpen] = useState(false);
  const pendingClickRef = useRef<{
    email: string;
    timeoutId: number;
  } | null>(null);

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
