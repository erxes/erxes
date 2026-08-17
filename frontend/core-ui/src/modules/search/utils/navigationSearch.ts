import {
  INavigationActivity,
  INavigationActivityModule,
} from '@/navigation/types/NavigationActivity';
import {
  TNavigationCategoryCounts,
  TNavigationSearchItem,
  TNavigationSearchItemCategory,
} from '@/search/types/GlobalSearch';

const normalizePath = (path: string) => path.replace(/^\/+|\/+$/g, '');

const getDescription = (parts: string[]) => parts.filter(Boolean).join(' › ');

const getModuleItems = (
  activity: INavigationActivity,
  module: INavigationActivityModule,
  category: TNavigationSearchItemCategory,
  parents: string[],
): TNavigationSearchItem[] => {
  const path = normalizePath(module.path);
  const item: TNavigationSearchItem[] = path
    ? [
        {
          id: `go-to:${activity.id}:${path}`,
          activityId: activity.id,
          category,
          title: module.name,
          description: path.startsWith('settings/')
            ? `Settings › ${activity.label}`
            : getDescription([activity.label, ...parents]),
          icon: module.icon ?? activity.icon,
          path: `/${path}`,
        },
      ]
    : [];

  return [
    ...item,
    ...(module.submenus?.flatMap((submenu) =>
      getModuleItems(activity, submenu, category, [...parents, module.name]),
    ) || []),
  ];
};

const deduplicateByPath = (items: TNavigationSearchItem[]) => {
  const seenPaths = new Set<string>();

  return items.filter((item) => {
    const path = normalizePath(item.path);

    if (seenPaths.has(path)) {
      return false;
    }

    seenPaths.add(path);
    return true;
  });
};

export const buildNavigationSearchItems = (
  activities: INavigationActivity[],
  additionalItems: TNavigationSearchItem[] = [],
) => {
  const goToItems = deduplicateByPath([
    ...activities.flatMap((activity) =>
      activity.modules.flatMap((module) =>
        getModuleItems(
          activity,
          module,
          activity.kind === 'core' ? 'core-modules' : 'plugins',
          [],
        ),
      ),
    ),
    ...additionalItems,
  ]);

  const pluginItems = activities
    .filter((activity) => activity.kind === 'plugin')
    .map(
      (activity): TNavigationSearchItem => ({
        id: `plugin:${activity.id}`,
        activityId: activity.id,
        title: activity.label,
        description: `Settings › ${activity.label}`,
        icon: activity.icon,
        path: `/${normalizePath(activity.defaultPath)}`,
      }),
    );

  return { goToItems, pluginItems };
};

export const getNavigationSearchCategoryCounts = (
  items: TNavigationSearchItem[],
): TNavigationCategoryCounts => {
  const counts: TNavigationCategoryCounts = {
    navigation: items.length,
    plugins: 0,
    settings: 0,
    'core-modules': 0,
  };

  items.forEach((item) => {
    if (item.category) {
      counts[item.category] += 1;
    }
  });

  return counts;
};

export const filterNavigationSearchItems = (
  items: TNavigationSearchItem[],
  searchValue: string,
) => {
  const term = searchValue.trim().toLocaleLowerCase();

  if (!term) {
    return items;
  }

  return items.filter((item) =>
    [item.title, item.description, item.path].some((value) =>
      value?.toLocaleLowerCase().includes(term),
    ),
  );
};
