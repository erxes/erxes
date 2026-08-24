'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  parseSession,
  readRawSession,
  SESSION_EVENT,
  writeSession,
  type SessionUser,
} from './session';

type SessionContextValue = {
  user: SessionUser | null;
  /** False while rendering on the server and during hydration. */
  ready: boolean;
  signIn: (user: SessionUser) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(SESSION_EVENT, onStoreChange);

  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(SESSION_EVENT, onStoreChange);
  };
};

const subscribeNever = () => () => {};

/**
 * Session for the portal shell, backed by browser storage. Swapping in the
 * erxes client portal auth calls only touches `signIn`/`signOut` and the
 * snapshot source — consumers keep using `useSession()`.
 */
export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const raw = useSyncExternalStore(
    subscribe,
    readRawSession,
    () => null,
  );
  const ready = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  const user = useMemo(() => parseSession(raw), [raw]);

  const signIn = useCallback((next: SessionUser) => writeSession(next), []);
  const signOut = useCallback(() => writeSession(null), []);

  const value = useMemo<SessionContextValue>(
    () => ({ user, ready, signIn, signOut }),
    [user, ready, signIn, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = (): SessionContextValue => {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used inside <SessionProvider>');
  }

  return context;
};
