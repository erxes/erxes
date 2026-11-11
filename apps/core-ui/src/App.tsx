import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button, Spinner, Toaster } from 'erxes-ui';
import { Provider as JotaiProvider } from 'jotai';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { messageOf } from '~/lib/api';
import { AppRoutes } from '~/modules/app/AppRoutes';
import { ThemeEffect } from '~/modules/app/ThemeEffect';
import { SessionProvider, useSessionQuery, useSetupStatus } from '~/modules/auth/session';
import { AcceptInvitationPage, ForgotPasswordPage, ResetPasswordPage } from '~/modules/auth/AccountLinkPages';
import { SetupPage } from '~/modules/auth/SetupPage';
import { SignInPage } from '~/modules/auth/SignInPage';
import './i18n';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

/** Signed in → the app; signed out → sign-in. */
/** Links from emails work signed in or not: they sign in when done. */
const LINK_PAGES = new Set(['/reset-password', '/accept-invitation']);

const Screen = () => {
  const { pathname } = useLocation();
  const session = useSessionQuery();
  const signedOut = session.isSuccess && !session.data;
  const setup = useSetupStatus(signedOut);

  if (LINK_PAGES.has(pathname)) {
    return pathname === '/reset-password' ? <ResetPasswordPage /> : <AcceptInvitationPage />;
  }

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
        <Button variant="outline" onClick={() => session.refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!session.data) {
    // A new installation has no organisation yet: create it first.
    if (setup.data?.required) return <SetupPage />;

    return (
      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="*" element={<SignInPage />} />
      </Routes>
    );
  }

  return (
    <SessionProvider session={session.data}>
      <AppRoutes />
    </SessionProvider>
  );
};

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <JotaiProvider>
      <BrowserRouter>
        <Toaster />
        <ThemeEffect />
        <Screen />
      </BrowserRouter>
    </JotaiProvider>
  </QueryClientProvider>
);
