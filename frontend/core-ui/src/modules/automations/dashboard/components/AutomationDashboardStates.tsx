import {
  DashboardWidgetEmptyState,
  DashboardWidgetListSkeleton,
} from 'ui-modules';
import { ApolloError } from '@apollo/client';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

const AutomationDashboardError = ({
  error,
  onRetry,
}: {
  error: ApolloError;
  onRetry: () => void;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="flex items-center gap-2 p-2 text-sm">
      <IconAlertTriangle className="size-4 shrink-0 text-destructive" />
      <span className="flex-auto text-muted-foreground">{error.message}</span>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        {t('stats-retry')}
      </Button>
    </div>
  );
};

/** Loading, error and empty handling shared by the automation widgets. */
export const AutomationDashboardBody = ({
  loading,
  error,
  onRetry,
  isEmpty,
  emptyLabel,
  children,
}: {
  loading: boolean;
  error?: ApolloError;
  onRetry: () => void;
  isEmpty: boolean;
  emptyLabel: string;
  children: ReactNode;
}) => {
  if (loading && isEmpty) {
    return <DashboardWidgetListSkeleton />;
  }

  if (error) {
    return <AutomationDashboardError error={error} onRetry={onRetry} />;
  }

  if (isEmpty) {
    return <DashboardWidgetEmptyState>{emptyLabel}</DashboardWidgetEmptyState>;
  }

  return <>{children}</>;
};
