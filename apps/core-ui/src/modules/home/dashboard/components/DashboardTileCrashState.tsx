import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import type { ReactNode } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

// One broken widget shows this in its own tile; the rest keep working.
const DashboardTileCrashState = () => {
  const { t } = useTranslation('common', { keyPrefix: 'home.dashboard' });
  const { resetBoundary } = useErrorBoundary();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-background p-4 text-center text-sm text-muted-foreground">
      <IconAlertTriangle className="size-5 text-warning" />
      <span>{t('widget-crashed')}</span>
      <Button variant="secondary" size="sm" onClick={resetBoundary}>
        <IconRefresh />
        {t('try-again')}
      </Button>
    </div>
  );
};

/** Catches one tile's render error and shows its crash state. */
export const DashboardTileErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary
    onError={(error, info) =>
      console.error('[dashboard] a tile crashed', error, info.componentStack)
    }
    fallback={<DashboardTileCrashState />}
  >
    {children}
  </ErrorBoundary>
);
