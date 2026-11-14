import { paths } from '~/lib/paths';
import { IconApps } from '@tabler/icons-react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { type NavApp, useNavApps } from '~/modules/navigation/apps';
import { useAppTabs } from '~/modules/navigation/useAppTabs';
import { DashboardWidgetCard, DashboardWidgetEmptyState } from './DashboardWidgetCard';

// A plain click resumes where the user left the app (as its top bar tab does);
// modified clicks keep the link's own behaviour (new tab, …).
const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

/** A grid of apps of one kind; each opens where the user last left it. */
export const HomeApps = ({
  emptyLabel,
  kind,
  title,
}: Readonly<{
  emptyLabel: string;
  kind: NavApp['kind'];
  title: string;
}>) => {
  const allApps = useNavApps();
  const { open } = useAppTabs(allApps);
  const apps = allApps.filter((app) => app.kind === kind);

  return (
    <DashboardWidgetCard title={title}>
      {apps.length === 0 ? (
        <DashboardWidgetEmptyState>{emptyLabel}</DashboardWidgetEmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {apps.map((app) => {
            const Icon = app.icon || IconApps;

            return (
              <Link
                key={app.id}
                className="flex min-w-0 items-center gap-3 rounded-lg border border-transparent p-3 text-sm font-medium transition-colors hover:border-border hover:bg-accent/60"
                to={paths.app(app.path)}
                onClick={(event) => {
                  if (isPlainClick(event)) {
                    event.preventDefault();
                    open(app);
                  }
                }}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-text">
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
