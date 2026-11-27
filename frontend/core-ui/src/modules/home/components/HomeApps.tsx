import { DashboardWidgetEmptyState, DashboardWidgetCard } from 'ui-modules';

import { NAVIGATION_EASE } from '@/navigation/constants/navigationMotion';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { IconApps, IconArrowUpRight } from '@tabler/icons-react';
import { motion, useReducedMotion } from 'framer-motion';
import { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { appLastLocationState } from '@/navigation/states/appLastLocationState';
import { splitPromotedNavigationActivities } from '@/navigation/utils/promotedNavigationActivities';
import { useAtomValue } from 'jotai';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';

const handleCardSpotlight = (event: MouseEvent<HTMLAnchorElement>) => {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty(
    '--spotlight-x',
    `${event.clientX - rect.left}px`,
  );
  event.currentTarget.style.setProperty(
    '--spotlight-y',
    `${event.clientY - rect.top}px`,
  );
};

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
  const prefersReducedMotion = useReducedMotion();
  const { promoted, rest } = splitPromotedNavigationActivities(
    activities.filter((activity) => activity.kind === kind),
  );
  const apps = [...promoted, ...rest];

  return (
    <DashboardWidgetCard title={title}>
      {apps.length === 0 ? (
        <DashboardWidgetEmptyState>{emptyLabel}</DashboardWidgetEmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {apps.map((app, index) => {
            const Icon = app.icon || IconApps;
            const homePath = `/${app.defaultPath.replace(/^\/+/, '')}`;

            return (
              <motion.div
                key={app.id}
                initial={
                  prefersReducedMotion
                    ? false
                    : { opacity: 0, y: 10, scale: 0.98 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.28,
                  delay: Math.min(index * 0.035, 0.28),
                  ease: NAVIGATION_EASE,
                }}
              >
                <Link
                  className="ui-spotlight-card group/appcard flex min-w-0 items-center gap-3 rounded-xl border border-border/60 bg-background/70 p-3 text-sm font-medium shadow-2xs hover:border-primary/35 hover:bg-background hover:shadow-sm"
                  to={lastLocations[app.id] || homePath}
                  state={{ appResumePath: homePath }}
                  onMouseMove={handleCardSpotlight}
                >
                  <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/10 transition-[transform,background-color,color,box-shadow] duration-200 group-hover/appcard:scale-105 group-hover/appcard:bg-primary group-hover/appcard:text-primary-foreground group-hover/appcard:shadow-xs">
                    <Icon className="size-5" />
                  </span>
                  <span className="relative z-10 min-w-0 flex-1 truncate">
                    {app.label}
                  </span>
                  <IconArrowUpRight
                    aria-hidden
                    className="relative z-10 size-4 shrink-0 -translate-x-1 translate-y-1 text-muted-foreground opacity-0 transition-[transform,opacity,color] duration-200 group-hover/appcard:translate-x-0 group-hover/appcard:translate-y-0 group-hover/appcard:text-primary group-hover/appcard:opacity-100"
                  />
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardWidgetCard>
  );
};
