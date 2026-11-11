import type { Session } from '@erxes/core-contract';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, ReactNode, useContext } from 'react';
import { api, isApiError } from '~/lib/api';

export const SESSION_KEY = ['session'];
export const SETUP_KEY = ['setup'];

/** Whether the installation still needs its first organisation (asked only when signed out). */
export const useSetupStatus = (enabled: boolean) =>
  useQuery({
    queryKey: SETUP_KEY,
    queryFn: () => api.auth.setupStatus(),
    enabled,
    staleTime: 60_000,
    retry: false,
  });

/** The signed-in member and organisation, or null when signed out. */
export const useSessionQuery = () =>
  useQuery({
    queryKey: SESSION_KEY,
    queryFn: async () => {
      try {
        return await api.auth.me();
      } catch (error) {
        if (isApiError(error) && error.status === 401) {
          return null;
        }

        throw error;
      }
    },
    staleTime: 60_000,
    retry: false,
  });

const SessionContext = createContext<Session | null>(null);

export const SessionProvider = ({ session, children }: { session: Session; children: ReactNode }) => (
  <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
);

/** Inside the signed-in app: the current member and organisation. */
export const useSession = (): Session => {
  const session = useContext(SessionContext);

  if (!session) {
    throw new Error('useSession() is only available inside the signed-in app');
  }

  return session;
};

/**
 * Signs out. The UI clears only after the server has cleared the HttpOnly
 * session cookie: otherwise the cookie would still work while the page says
 * "signed out". A failure throws, for the caller to show (and retry).
 */
export const useSignOut = () => {
  const client = useQueryClient();

  return async (options: { everywhere?: boolean } = {}) => {
    if (options.everywhere) await api.auth.signOutEverywhere();
    else await api.auth.signOut();

    client.clear();
    client.setQueryData(SESSION_KEY, null);
  };
};
