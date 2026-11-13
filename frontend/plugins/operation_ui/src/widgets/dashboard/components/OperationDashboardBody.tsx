import { ApolloError } from '@apollo/client';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DashboardWidgetEmptyState,
  DashboardWidgetListSkeleton,
} from 'ui-modules';

/** Loading, error and empty handling shared by the operation tiles. */
export const OperationDashboardBody = ({
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
  const { t } = useTranslation('operation');

  if (loading && isEmpty) {
    return <DashboardWidgetListSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-2 text-sm">
        <IconAlertTriangle className="size-4 shrink-0 text-destructive" />
        <span className="flex-auto text-muted-foreground">{error.message}</span>
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t('retry')}
        </Button>
      </div>
    );
  }

  if (isEmpty) {
    return <DashboardWidgetEmptyState>{emptyLabel}</DashboardWidgetEmptyState>;
  }

  return children;
};
