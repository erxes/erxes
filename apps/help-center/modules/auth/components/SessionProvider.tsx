'use client';

import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { AUTH_PORTAL_LOGOUT } from '../graphql/mutations/auth';
import { AUTH_PORTAL_CURRENT_USER } from '../graphql/queries/auth';
import { sessionFromCurrentUser, type CurrentUserResponse } from '../types';
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
  updateUser: (changes: Partial<SessionUser>) => void;
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

  const { data: account } = useQuery<CurrentUserResponse>(
    AUTH_PORTAL_CURRENT_USER,
    { skip: !raw, errorPolicy: 'all' },
  );

  const signIn = useCallback((next: SessionUser, token?: string | null) => {
    writeToken(token ?? null);
    writeSession(next);
  }, []);

  const updateUser = useCallback((changes: Partial<SessionUser>) => {
    const current = parseSession(readRawSession());

    if (current) {
      writeSession({ ...current, ...changes });
    }
  }, []);

  useEffect(() => {
    const current = account?.clientPortalCurrentUser;

    if (current) {
      updateUser(sessionFromCurrentUser(current, user?.email ?? ''));
      return;
    }

    if (account) {
      writeToken(null);
      writeSession(null);
    }
  }, [account, user?.email, updateUser]);

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
    () => ({ user, ready, signIn, updateUser, signOut }),
    [user, ready, signIn, updateUser, signOut],
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
