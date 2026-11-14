import { AppErrorBoundary } from '@/error-handler/components/AppErrorBoundary';
import { AppI18nWrapper } from '~/providers/i18next-provider';
import { AppRouter } from './AppRoutes';
import { Provider as JotaiProvider } from 'jotai';
import { PageTracker } from 'react-page-tracker';
import { ThemeEffect } from '@/app/effect-components/ThemeEffect';
import { Toaster } from 'erxes-ui';

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
