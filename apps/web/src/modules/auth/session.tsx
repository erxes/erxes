import type { Session } from '@erxes/core-contract';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { isApiError, messageOf, orpc } from '@erxes/core-contract/client';

/** Whether the installation still needs its first organisation (asked only when signed out). */
export const useSetupStatus = (enabled: boolean) =>
  useQuery(
    orpc.auth.setupStatus.queryOptions({
      input: enabled ? undefined : skipToken,
      staleTime: 60_000,
      retry: false,
    }),
  );

/** The signed-in member and organisation; a 401 means signed out (`isSignedOut`). */
export const useSessionQuery = () =>
  useQuery(orpc.auth.me.queryOptions({ staleTime: 60_000, retry: false }));

export const isSignedOut = (error: unknown) => isApiError(error, 'UNAUTHORIZED');

/** Starts the app with the session a sign-in (or setup, or invitation) returned. */
export const useSignedIn = () => {
  const client = useQueryClient();

  return (session: Session) => client.setQueryData(orpc.auth.me.queryKey(), session);
};

const SessionContext = createContext<Session | null>(null);

export const SessionProvider = ({
  session,
  children,
}: {
  session: Session;
  children: ReactNode;
}) => <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;

/** Inside the signed-in app: the current member and organisation. */
export const useSession = (): Session => {
  const session = useContext(SessionContext);

  if (!session) {
    throw new Error('useSession() is only available inside the signed-in app');
  }

  return session;
};

/**
 * `can('contacts.delete')`: whether the signed-in member's role allows an
 * action (the API checks the same; this only shapes the UI).
 */
export const useCan = () => {
  const { permissions } = useSession();

  return (action: string) => permissions.includes(action);
};

/**
 * The UI clears only after the server has cleared the HttpOnly session
 * cookie: otherwise the cookie would still work while the page says
 * "signed out". Then a fresh page load drops every cache, the live stream and
 * loaded plugin UIs, and shows sign-in. A failure says the member is still signed in.
 */
const useSignOutHandlers = () => {
  const { toast } = useToast();
  const { t } = useTranslation('organization');

  return {
    onSuccess: () => window.location.assign('/'),
    onError: (error: Error) =>
      toast({
        variant: 'destructive',
        title: t('logout-failed'),
        description: `${messageOf(error)} ${t('logout-retry')}`,
      }),
  };
};

export const useSignOut = () =>
  useMutation(orpc.auth.signOut.mutationOptions(useSignOutHandlers()));

/** Ends every session on every device, this one too. */
export const useSignOutEverywhere = () =>
  useMutation(orpc.auth.signOutEverywhere.mutationOptions(useSignOutHandlers()));
