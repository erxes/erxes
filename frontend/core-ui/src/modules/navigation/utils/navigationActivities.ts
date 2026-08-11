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

export const getRailNavigationActivities = ({
  activities,
  visibleActivities,
  activeActivityId,
}: {
  activities: INavigationActivity[];
  visibleActivities: INavigationActivity[];
  activeActivityId?: string;
}) => {
  const visibleActivityIds = new Set(
    visibleActivities.map((activity) => activity.id),
  );

  if (activeActivityId) {
    visibleActivityIds.add(activeActivityId);
  }

  return activities.filter((activity) => visibleActivityIds.has(activity.id));
};
