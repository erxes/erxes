import { useEffect } from 'react';

/** Closing or reloading the tab with unsaved changes asks first. */
export const useLeaveWarning = (dirty: boolean) =>
  useEffect(() => {
    if (!dirty) return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();

    window.addEventListener('beforeunload', warn);

    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
