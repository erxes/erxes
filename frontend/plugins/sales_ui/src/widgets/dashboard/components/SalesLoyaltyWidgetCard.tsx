import { IconAlertTriangle } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  DashboardWidgetCard,
  DashboardWidgetEmptyState,
  DashboardWidgetListSkeleton,
} from 'ui-modules';
import { SALES_LOYALTY_POINTS_PATH } from '../salesDashboardConfig';

/**
 * A loyalty tile's frame: the link to the Loyalty points page, and the
 * loyalty-off, loading, error and empty states before its content.
 */
export const SalesLoyaltyWidgetCard = ({
  title,
  loyaltyEnabled,
  loading,
  error,
  onRetry,
  isEmpty,
  emptyLabel,
  children,
}: {
  title: string;
  loyaltyEnabled: boolean;
  loading: boolean;
  error?: Error;
  onRetry: () => unknown;
  isEmpty: boolean;
  emptyLabel?: string;
  children: ReactNode;
}) => {
  const { t } = useTranslation('sales');

  const body = () => {
    if (!loyaltyEnabled) {
      return (
        <DashboardWidgetEmptyState>
          {t(
            'dashboard-loyalty-disabled',
            'Turn on the loyalty plugin to see points here',
          )}
        </DashboardWidgetEmptyState>
      );
    }

    if (error) {
      return (
        <div className="flex items-center gap-2 p-2 text-sm">
          <IconAlertTriangle className="size-4 shrink-0 text-destructive" />
          <span className="flex-auto text-muted-foreground">
            {t('loyalty-insights-error', 'Could not load the totals')}
          </span>
          <Button variant="secondary" size="sm" onClick={() => onRetry()}>
            {t('retry', 'Retry')}
          </Button>
        </div>
      );
    }

    if (loading) {
      return <DashboardWidgetListSkeleton />;
    }

    if (isEmpty) {
      return (
        <DashboardWidgetEmptyState>
          {emptyLabel ||
            t('dashboard-loyalty-empty', 'No points moved in these pipelines')}
        </DashboardWidgetEmptyState>
      );
    }

    return children;
  };

  return (
    <DashboardWidgetCard
      title={title}
      action={
        loyaltyEnabled && (
          <Button variant="ghost" size="sm" asChild>
            <Link to={SALES_LOYALTY_POINTS_PATH}>
              {t('dashboard-loyalty-open', 'Open')}
            </Link>
          </Button>
        )
      }
    >
      {body()}
    </DashboardWidgetCard>
  );
};
