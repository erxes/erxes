import { hashKey, MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { orpc } from '@erxes/core-contract/client';
import { isSignedOut } from '~/modules/auth/session';

const SESSION_KEY = orpc.auth.me.queryKey();

/**
 * Checks the sign-in again. When it has ended, the app shows sign-in on this
 * page, and the member is back on it once they sign in, instead of a page of
 * errors that only a reload fixes.
 */
export const recheckSession = () =>
  queryClient.invalidateQueries({ queryKey: SESSION_KEY, exact: true });

/** Any call core refuses with "sign in to continue" (the session check itself excepted). */
const onSignedOut = (error: Error, queryHash?: string) => {
  if (isSignedOut(error) && queryHash !== hashKey(SESSION_KEY)) void recheckSession();
};

export const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({ onError: (error, query) => onSignedOut(error, query.queryHash) }),
  mutationCache: new MutationCache({ onError: (error) => onSignedOut(error) }),
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});
