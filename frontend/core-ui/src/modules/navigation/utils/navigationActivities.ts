import {
  INavigationActivity,
  INavigationActivityModule,
} from '@/navigation/types/NavigationActivity';

const normalizePath = (path: string) => {
  let startIndex = 0;
  let endIndex = path.length;

  while (startIndex < endIndex && path[startIndex] === '/') {
    startIndex += 1;
  }

  while (endIndex > startIndex && path[endIndex - 1] === '/') {
    endIndex -= 1;
  }

  return path.slice(startIndex, endIndex);
};

const getModulePaths = (module: INavigationActivityModule): string[] => [
  normalizePath(module.path),
  ...(module.submenus?.flatMap(getModulePaths) || []),
];

export const getNavigationActivityPaths = (
  activity: INavigationActivity,
): string[] => activity.modules.flatMap(getModulePaths);

export const doesNavigationActivityMatchPath = (
  activity: INavigationActivity,
  pathname: string,
) => {
  const normalizedPathname = normalizePath(pathname);

  return getNavigationActivityPaths(activity).some(
    (path) =>
      normalizedPathname === path || normalizedPathname.startsWith(`${path}/`),
  );
};

const getLongestMatchingPathLength = (
  activity: INavigationActivity,
  normalizedPathname: string,
) =>
  Math.max(
    ...getNavigationActivityPaths(activity)
      .filter(
        (path) =>
          normalizedPathname === path ||
          normalizedPathname.startsWith(`${path}/`),
      )
      .map((path) => path.length),
    0,
  );

export const findNavigationActivityByPath = (
  activities: INavigationActivity[],
  pathname: string,
) => {
  const normalizedPathname = normalizePath(pathname);

  return activities
    .filter((activity) => doesNavigationActivityMatchPath(activity, pathname))
    .sort(
      (left, right) =>
        getLongestMatchingPathLength(right, normalizedPathname) -
        getLongestMatchingPathLength(left, normalizedPathname),
    )[0];
};

/**
 * The app owning a path: the best module match, else the activity whose
 * default path shares the first segment (nested plugin pages such as
 * `frontline/calls/:id` match no registered module path).
 */
export const findAppActivityByPath = (
  activities: INavigationActivity[],
  pathname: string,
) => {
  const matched = findNavigationActivityByPath(activities, pathname);

  if (matched) {
    return matched;
  }

  const [appSegment] = normalizePath(pathname).split('/');

  if (!appSegment) {
    return undefined;
  }

  return activities.find(
    (activity) =>
      normalizePath(activity.defaultPath).split('/')[0] === appSegment,
  );
};

/**
 * Organization settings (`/settings`, `/settings/…`) only — a plugin's own
 * settings (`/sales/settings/…`) belong to that plugin's app.
 */
export const isOrganizationSettingsPath = (pathname: string) =>
  pathname === '/settings' || pathname.startsWith('/settings/');
