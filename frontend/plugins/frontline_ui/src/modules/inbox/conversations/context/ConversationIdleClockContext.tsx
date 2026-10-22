import { createContext, useEffect, useState, type ReactNode } from 'react';

export const ConversationIdleClockContext = createContext<number | null>(null);

export const ConversationIdleClockProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let timer: number | undefined;
    const update = () => setNow(Date.now());
    const syncVisibility = () => {
      window.clearInterval(timer);
      timer = undefined;
      if (document.visibilityState === 'visible') {
        update();
        timer = window.setInterval(update, 10_000);
      }
    };
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', syncVisibility);
    };
  }, []);

  return (
    <ConversationIdleClockContext.Provider value={now}>
      {children}
    </ConversationIdleClockContext.Provider>
  );
};
