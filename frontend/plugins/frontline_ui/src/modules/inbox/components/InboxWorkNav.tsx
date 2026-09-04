import {
  IconAt,
  IconClockExclamation,
  IconUserCheck,
  IconUserOff,
} from '@tabler/icons-react';
import {
  Badge,
  NavigationMenuGroup,
  Sidebar,
  Skeleton,
  cn,
  useMultiQueryState,
} from 'erxes-ui';
import type { ElementType } from 'react';
import { useTranslation } from 'react-i18next';

import { useInboxWorkCounts } from '@/inbox/conversations/hooks/useConversationCounts';
import {
  CLEARED_INBOX_NAVIGATION_FILTERS,
  INBOX_NAVIGATION_FILTER_KEYS,
  TInboxNavigationFilters,
  TInboxNavigationFilterValues,
} from '@/inbox/types/InboxNavigation';

type WorkFilterKey =
  | 'participating'
  | 'mentioned'
  | 'unassigned'
  | 'awaitingResponse';

const WORK_ITEMS: Array<{
  filterKey: WorkFilterKey;
  icon: ElementType;
  label: string;
}> = [
  {
    filterKey: 'participating',
    icon: IconUserCheck,
    label: 'assigned-to-me',
  },
  { filterKey: 'mentioned', icon: IconAt, label: 'mentions' },
  { filterKey: 'unassigned', icon: IconUserOff, label: 'unassigned' },
  {
    filterKey: 'awaitingResponse',
    icon: IconClockExclamation,
    label: 'awaiting-response',
  },
];

export const InboxWorkNav = () => {
  const { t } = useTranslation('frontline');
  const { counts, error, loading } = useInboxWorkCounts();
  const [filters, setFilters] = useMultiQueryState<TInboxNavigationFilters>(
    INBOX_NAVIGATION_FILTER_KEYS,
  );

  const selectFilter = (filterKey: WorkFilterKey) => {
    const nextFilters: TInboxNavigationFilterValues = {
      ...CLEARED_INBOX_NAVIGATION_FILTERS,
    };

    if (!filters[filterKey]) {
      nextFilters[filterKey] = true;
    }

    setFilters(nextFilters);
  };

  return (
    <NavigationMenuGroup
      name={t('work-queue', { defaultValue: 'Work queue' })}
    >
      {loading && (
        <div className="flex flex-col gap-2 px-2 py-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-24" />
        </div>
      )}
      {!loading && error && (
        <div className="px-2 py-3 text-xs text-destructive">{t('error')}</div>
      )}
      {!loading &&
        !error &&
        WORK_ITEMS.map(({ filterKey, icon: Icon, label }) => {
          const isActive = Boolean(filters[filterKey]);
          const count = counts[filterKey];

          return (
            <Sidebar.MenuItem key={filterKey}>
              <Sidebar.MenuButton
                aria-pressed={isActive}
                isActive={isActive}
                onClick={() => selectFilter(filterKey)}
              >
                <Icon
                  className={cn(
                    'text-accent-foreground',
                    isActive && 'text-primary',
                  )}
                />
                <span className="min-w-0 flex-1 truncate capitalize">
                  {label === 'mentions'
                    ? t(label, { defaultValue: 'Mentions' })
                    : t(label)}
                </span>
                {count > 0 && (
                  <Badge
                    variant={isActive ? 'default' : 'secondary'}
                    className="ml-auto h-5 min-w-5 justify-center border-0 px-1 text-xs tabular-nums"
                  >
                    {count}
                  </Badge>
                )}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          );
        })}
    </NavigationMenuGroup>
  );
};
