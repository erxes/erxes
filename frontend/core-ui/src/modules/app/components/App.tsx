import { useEffect } from 'react';

import { Toaster } from 'erxes-ui';

import { AppRouter } from './AppRoutes';

import { AppErrorBoundary } from '@/error-handler/components/AppErrorBoundary';
import { pageHistoryState } from '@/app/states/pageHistoryState';
import { AppI18nWrapper } from '~/providers/i18next-provider';
import { Provider as JotaiProvider, useSetAtom } from 'jotai';
import { ThemeEffect } from '@/app/effect-components/ThemeEffect';

const PageHistoryTracker = () => {
  const setPageHistory = useSetAtom(pageHistoryState);

  useEffect(() => {
    const recordPath = () => {
      setPageHistory((prev) => {
        const path = window.location.pathname;

        if (prev[prev.length - 1] === path) return prev;

        return [...prev.slice(-49), path];
      });
    };

    recordPath();

    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(
      window.history,
    );

    window.history.pushState = (
      data: unknown,
      title: string,
      url?: string | URL | null,
    ) => {
      originalPushState(data, title, url);
      recordPath();
    };

    window.history.replaceState = (
      data: unknown,
      title: string,
      url?: string | URL | null,
    ) => {
      originalReplaceState(data, title, url);
      recordPath();
    };

    window.addEventListener('popstate', recordPath);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', recordPath);
    };
  }, [setPageHistory]);

  return null;
};

export function App() {
  return (
    <JotaiProvider>
      <AppI18nWrapper>
        <Toaster />
        <AppErrorBoundary>
          <PageHistoryTracker />
          <AppRouter />
        </AppErrorBoundary>
        <ThemeEffect />
      </AppI18nWrapper>
    </JotaiProvider>
  );
}
