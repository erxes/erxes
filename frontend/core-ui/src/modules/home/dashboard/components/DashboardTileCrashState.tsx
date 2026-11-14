import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { FallbackProps } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

// One broken widget shows this in its own tile; the rest keep working.
export const DashboardTileCrashState = ({
  resetErrorBoundary,
}: FallbackProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'home.dashboard' });

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-background p-4 text-center text-sm text-muted-foreground">
      <IconAlertTriangle className="size-5 text-warning" />
      <span>{t('widget-crashed')}</span>
      <Button variant="secondary" size="sm" onClick={resetErrorBoundary}>
        <IconRefresh />
        {t('try-again')}
      </Button>
    </div>
  );
};
