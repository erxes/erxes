import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Component, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// One broken widget shows this in its own tile; the rest keep working.
const DashboardTileCrashState = ({ onRetry }: { onRetry: () => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'home.dashboard' });

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-background p-4 text-center text-sm text-muted-foreground">
      <IconAlertTriangle className="size-5 text-warning" />
      <span>{t('widget-crashed')}</span>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        <IconRefresh />
        {t('try-again')}
      </Button>
    </div>
  );
};

/** Catches one tile's render error and shows its crash state. */
export class DashboardTileErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override render() {
    return this.state.failed ? (
      <DashboardTileCrashState onRetry={() => this.setState({ failed: false })} />
    ) : (
      this.props.children
    );
  }
}
