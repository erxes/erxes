import { Toaster } from 'erxes-ui';

import { AppRouter } from './AppRoutes';

import { AppErrorBoundary } from '@/error-handler/components/AppErrorBoundary';
import { AppI18nWrapper } from '~/providers/i18next-provider';
import { Provider as JotaiProvider } from 'jotai';
import { ThemeEffect } from '@/app/effect-components/ThemeEffect';
import { PageTracker } from 'react-page-tracker';

export function App() {
  return (
    <JotaiProvider>
      <AppI18nWrapper>
        <Toaster />
        <AppErrorBoundary>
          <AppRouter />
        </AppErrorBoundary>
        <ThemeEffect />
        <PageTracker />
      </AppI18nWrapper>
    </JotaiProvider>
  );
}
