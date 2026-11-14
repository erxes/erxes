import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button, Spinner, Toaster } from 'erxes-ui';
import { useQueryState } from 'nuqs';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { CrashBoundary } from '~/components/CrashBoundary';
import { messageOf } from '@erxes/core-contract/client';
import { paths } from '~/lib/paths';
import { lazyNamed } from '~/lib/lazyNamed';
import { ThemeEffect } from '~/modules/app/ThemeEffect';
import {
  isSignedOut,
  SessionProvider,
  useSessionQuery,
  useSetupStatus,
} from '~/modules/auth/session';
import { SignInPage } from '~/modules/auth/SignInPage';
import { i18n } from './i18n';

// Sign-in is the first page signed out; the app and the rarer pages load when needed.
const AppRoutes = lazyNamed(() => import('~/modules/app/AppRoutes'), 'AppRoutes');
const SetupPage = lazyNamed(() => import('~/modules/auth/SetupPage'), 'SetupPage');

const ForgotPasswordPage = lazyNamed(
  () => import('~/modules/auth/AccountLinkPages'),
  'ForgotPasswordPage',
);

const ResetPasswordPage = lazyNamed(
  () => import('~/modules/auth/AccountLinkPages'),
  'ResetPasswordPage',
);

const AcceptInvitationPage = lazyNamed(
  () => import('~/modules/auth/AccountLinkPages'),
  'AcceptInvitationPage',
);

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

/** Links from emails work signed in or not: they sign in when done. */
const LINK_PAGES = new Set<string>([paths.resetPassword, paths.acceptInvitation]);

const FullScreenSpinner = () => (
  <div className="flex h-svh items-center justify-center">
    <Spinner />
  </div>
);

const FullScreenError = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
  <div role="alert" className="flex h-svh flex-col items-center justify-center gap-3 text-sm">
    <p className="text-destructive">{messageOf(error)}</p>
    <Button variant="outline" onClick={onRetry}>
      Try again
    </Button>
  </div>
);

/** Signed out: create the first organisation on a new installation, else sign in. */
const SignedOut = () => {
  const setup = useSetupStatus(true);

  if (setup.isPending) return <FullScreenSpinner />;

  if (setup.isError) {
    return <FullScreenError error={setup.error} onRetry={() => void setup.refetch()} />;
  }

  if (setup.data.required) return <SetupPage />;

  return (
    <Routes>
      <Route path={paths.forgotPassword} element={<ForgotPasswordPage />} />
      <Route path="*" element={<SignInPage />} />
    </Routes>
  );
};

/** Signed in → the app; signed out → sign-in. */
const Screen = () => {
  const { pathname } = useLocation();
  const session = useSessionQuery();
  const [next] = useQueryState('next');

  if (LINK_PAGES.has(pathname)) {
    return pathname === paths.resetPassword ? <ResetPasswordPage /> : <AcceptInvitationPage />;
  }

  if (session.isPending) return <FullScreenSpinner />;

  if (isSignedOut(session.error)) return <SignedOut />;

  if (session.isError) {
    return <FullScreenError error={session.error} onRetry={() => void session.refetch()} />;
  }

  // Signed in on the way to "Sign in with erxes": continue to the app that asked.

  if (next?.startsWith('/core/v1/oauth/authorize?')) {
    window.location.assign(next);

    return <FullScreenSpinner />;
  }

  return (
    <SessionProvider session={session.data}>
      <AppRoutes />
    </SessionProvider>
  );
};

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      {/* Jotai runs on its default store, which i18n also reads the saved language from. */}
      <BrowserRouter>
        {/* Query state goes through the router (not shallow), so useLocation sees it and
              history state such as the side panel's tabs survives; a change adds a history entry. */}
        <NuqsAdapter defaultOptions={{ shallow: false, history: 'push' }}>
          <Toaster />
          <ThemeEffect />
          <CrashBoundary scope="app">
            <Suspense fallback={<FullScreenSpinner />}>
              <Screen />
            </Suspense>
          </CrashBoundary>
        </NuqsAdapter>
      </BrowserRouter>
    </I18nextProvider>
  </QueryClientProvider>
);
