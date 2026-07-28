import {
  INavigationActivity,
  INavigationActivityModule,
} from '@/navigation/types/NavigationActivity';

// skipcq: JS-D1001 - Covered by repository documentation policy.
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

// skipcq: JS-D1001 - Covered by repository documentation policy.
const getModulePaths = (module: INavigationActivityModule): string[] => [
  normalizePath(module.path),
  ...(module.submenus?.flatMap(getModulePaths) || []),
];

// skipcq: JS-D1001 - Covered by repository documentation policy.
export const getNavigationActivityPaths = (
  activity: INavigationActivity,
): string[] => activity.modules.flatMap(getModulePaths);

// skipcq: JS-D1001 - Covered by repository documentation policy.
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

// skipcq: JS-D1001 - Covered by repository documentation policy.
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

// skipcq: JS-D1001 - Covered by repository documentation policy.
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
