import { Button, cn } from 'erxes-ui';

import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { IconApps } from '@tabler/icons-react';
import { splitPromotedNavigationActivities } from '@/navigation/utils/promotedNavigationActivities';
import { useTranslation } from 'react-i18next';

/**
 * One tab per plugin. A core module only gets a tab while it is open; the
 * rest stay reachable through the app switcher.
 */
export const CoreTabPluginTabs = ({
  activeActivity,
  activities,
  onSelect,
}: Readonly<{
  activeActivity?: INavigationActivity;
  activities: INavigationActivity[];
  onSelect: (activity: INavigationActivity) => void;
}>) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const { promoted, rest } = splitPromotedNavigationActivities(
    activities.filter((activity) => activity.kind === 'plugin'),
  );
  const tabs = [...promoted, ...rest];

  if (activeActivity?.kind === 'core') {
    tabs.push(activeActivity);
  }

  return (
    <nav
      aria-label={t('plugins')}
      className="hide-scroll flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto"
    >
      {tabs.map((activity) => {
        const Icon = activity.icon || IconApps;
        const active = activity.id === activeActivity?.id;

        return (
          <Button
            key={activity.id}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'h-8 shrink-0 gap-1.5 px-2.5 text-sm font-medium text-muted-foreground hover:text-foreground [&>svg]:size-4!',
              active &&
                'bg-background text-foreground shadow-xs hover:bg-background',
            )}
            onClick={() => onSelect(activity)}
            type="button"
            variant="ghost"
          >
            <Icon className={cn('size-4', active && 'text-primary')} />
            <span className="truncate">{activity.label}</span>
          </Button>
        );
      })}
    </nav>
  );
};
