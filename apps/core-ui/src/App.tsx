import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button, Spinner, Toaster } from 'erxes-ui';
import { Provider as JotaiProvider } from 'jotai';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import { i18n } from '~/i18n';
import { messageOf } from '~/lib/api';
import { AppRoutes } from '~/modules/app/AppRoutes';
import { ThemeEffect } from '~/modules/app/ThemeEffect';
import { SessionProvider, useSessionQuery, useSetupStatus } from '~/modules/auth/session';
import { SetupPage } from '~/modules/auth/SetupPage';
import { SignInPage } from '~/modules/auth/SignInPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

/** Signed in → the app; signed out → sign-in. */
const Screen = () => {
  const session = useSessionQuery();
  const signedOut = session.isSuccess && !session.data;
  const setup = useSetupStatus(signedOut);

  if (session.isPending || (signedOut && setup.isPending)) {
    return (
      <div className="flex h-svh items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (session.isError) {
    return (
      <div className="flex h-svh flex-col items-center justify-center gap-3 text-sm">
        <p className="text-destructive">{messageOf(session.error)}</p>
        <Button variant="outline" onClick={() => void session.refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!session.data) {
    // A new installation has no organisation yet: create it first.
    return setup.data?.required ? <SetupPage /> : <SignInPage />;
  }

  return (
    <SessionProvider session={session.data}>
      <AppRoutes />
    </SessionProvider>
  );
};

export const App = () => (
  <I18nextProvider i18n={i18n}>
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <BrowserRouter>
          <Toaster />
          <ThemeEffect />
          <Screen />
        </BrowserRouter>
      </JotaiProvider>
    </QueryClientProvider>
  </I18nextProvider>
);
