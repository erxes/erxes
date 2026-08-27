'use client';

import { useApolloClient, useMutation } from '@apollo/client/react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { AUTH_PORTAL_LOGOUT } from '../graphql/mutations/auth';
import {
  parseSession,
  readRawSession,
  readToken,
  SESSION_EVENT,
  writeSession,
  writeToken,
  type SessionUser,
} from '../utils/session';

type SessionContextValue = {
  user: SessionUser | null;
  ready: boolean;
  signIn: (user: SessionUser, token?: string | null) => void;
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

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const client = useApolloClient();
  const [logout] = useMutation(AUTH_PORTAL_LOGOUT);
  const raw = useSyncExternalStore(subscribe, readRawSession, () => null);
  const ready = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  const user = useMemo(() => parseSession(raw), [raw]);

  const signIn = useCallback((next: SessionUser, token?: string | null) => {
    writeToken(token ?? null);
    writeSession(next);
  }, []);

  /*
   * The local session is dropped straight away so the UI never lags behind the
   * click; the portal is told afterwards, with the token this session was still
   * holding, and the cache is emptied of anything that was read as this user.
   */
  const signOut = useCallback(() => {
    const token = readToken();

    writeToken(null);
    writeSession(null);

    void logout({
      context: token ? { headers: { 'client-auth-token': token } } : undefined,
    })
      .catch(() => undefined)
      .finally(() => {
        void client.clearStore();
      });
  }, [client, logout]);

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
