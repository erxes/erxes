import { DashboardWidgetEmptyState, DashboardWidgetCard } from 'ui-modules';

import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { IconApps } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { appLastLocationState } from '@/navigation/states/appLastLocationState';
import { splitPromotedNavigationActivities } from '@/navigation/utils/promotedNavigationActivities';
import { useAtomValue } from 'jotai';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';

/** A grid of apps of one kind; each opens where the user last left it. */
export const HomeApps = ({
  emptyLabel,
  kind,
  title,
}: Readonly<{
  emptyLabel: string;
  kind: INavigationActivity['kind'];
  title: string;
}>) => {
  const activities = useNavigationActivities();
  const lastLocations = useAtomValue(appLastLocationState);
  const { promoted, rest } = splitPromotedNavigationActivities(
    activities.filter((activity) => activity.kind === kind),
  );
  const apps = [...promoted, ...rest];

  return (
    <DashboardWidgetCard title={title}>
      {apps.length === 0 ? (
        <DashboardWidgetEmptyState>{emptyLabel}</DashboardWidgetEmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {apps.map((app) => {
            const Icon = app.icon || IconApps;
            const homePath = `/${app.defaultPath.replace(/^\/+/, '')}`;

            return (
              <Link
                key={app.id}
                className="flex min-w-0 items-center gap-3 rounded-lg border border-transparent p-3 text-sm font-medium transition-colors hover:border-border hover:bg-accent/60"
                to={lastLocations[app.id] || homePath}
                state={{ appResumePath: homePath }}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="truncate">{app.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </DashboardWidgetCard>
  );
};
