import { Button } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { UserAvatar } from '~/components/UserAvatar';
import { HOME_NS } from '../i18n';
import {
  DashboardWidgetCard,
  DashboardWidgetEmptyState,
  DashboardWidgetListSkeleton,
} from './DashboardWidgetCard';

export type THomeRecordRow = {
  id: string;
  name: string;
  avatarUrl: string | null;
  detail?: string | null;
  meta?: ReactNode;
  to: string;
};

/** A dashboard tile listing records, each opening its detail. */
export const HomeRecordList = ({
  title,
  viewAllTo,
  emptyLabel,
  rows,
  loading,
  error,
}: {
  title: string;
  viewAllTo: string;
  emptyLabel: string;
  rows: THomeRecordRow[];
  loading: boolean;
  error: boolean;
}) => {
  const { t } = useTranslation(HOME_NS);

  const renderContent = () => {
    if (loading) {
      return <DashboardWidgetListSkeleton />;
    }

    if (error) {
      return <DashboardWidgetEmptyState>{t('error')}</DashboardWidgetEmptyState>;
    }

    if (rows.length === 0) {
      return <DashboardWidgetEmptyState>{emptyLabel}</DashboardWidgetEmptyState>;
    }

    return (
      <ul className="flex flex-col gap-0.5">
        {rows.map((row) => (
          <li key={row.id}>
            <Link
              className="flex h-10 min-w-0 items-center gap-2 rounded-md px-2 text-sm hover:bg-accent/60"
              to={row.to}
            >
              <UserAvatar name={row.name} src={row.avatarUrl} className="size-6 shrink-0" />
              <span className="truncate font-medium">{row.name}</span>
              {row.detail && (
                <span className="truncate text-xs text-muted-foreground">{row.detail}</span>
              )}
              {row.meta && (
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">{row.meta}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <DashboardWidgetCard
      title={title}
      action={
        <Button asChild size="sm" variant="ghost">
          <Link to={viewAllTo}>{t('view-all')}</Link>
        </Button>
      }
    >
      {renderContent()}
    </DashboardWidgetCard>
  );
};
