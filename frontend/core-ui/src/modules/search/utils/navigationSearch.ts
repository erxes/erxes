import {
  INavigationActivity,
  INavigationActivityModule,
} from '@/navigation/types/NavigationActivity';
import { TNavigationSearchItem } from '@/search/types/GlobalSearch';

const normalizePath = (path: string) => path.replace(/^\/+|\/+$/g, '');

const getDescription = (parts: string[]) => parts.filter(Boolean).join(' › ');

const getLeafModuleItems = (
  activity: INavigationActivity,
  module: INavigationActivityModule,
  parents: string[],
): TNavigationSearchItem[] => {
  if (module.submenus?.length) {
    return module.submenus.flatMap((submenu) =>
      getLeafModuleItems(activity, submenu, [...parents, module.name]),
    );
  }

  const path = normalizePath(module.path);

  if (
    !path ||
    (activity.kind === 'plugin' && path === normalizePath(activity.defaultPath))
  ) {
    return [];
  }

  return [
    {
      id: `go-to:${activity.id}:${path}`,
      activityId: activity.id,
      title: module.name,
      description: getDescription([activity.label, ...parents]),
      icon: module.icon ?? activity.icon,
      path: `/${path}`,
    },
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
) => {
  const goToItems = deduplicateByPath(
    activities.flatMap((activity) =>
      activity.modules.flatMap((module) =>
        getLeafModuleItems(activity, module, []),
      ),
    ),
  );

  const pluginItems = activities
    .filter((activity) => activity.kind === 'plugin')
    .map(
      (activity): TNavigationSearchItem => ({
        id: `plugin:${activity.id}`,
        activityId: activity.id,
        title: activity.label,
        description: activity.modules
          .map((module) => module.name)
          .filter(Boolean)
          .join(' · '),
        icon: activity.icon,
        path: `/${normalizePath(activity.defaultPath)}`,
      }),
    );

  return { goToItems, pluginItems };
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
