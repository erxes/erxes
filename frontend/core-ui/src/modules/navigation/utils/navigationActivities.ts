import {
  INavigationActivity,
  INavigationActivityModule,
} from '@/navigation/types/NavigationActivity';

const normalizePath = (path: string) => path.replace(/^\/+|\/+$/g, '');

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

export const findNavigationActivityByPath = (
  activities: INavigationActivity[],
  pathname: string,
) =>
  activities
    .filter((activity) => doesNavigationActivityMatchPath(activity, pathname))
    .sort((left, right) => {
      const longestPath = (activity: INavigationActivity) =>
        Math.max(
          ...getNavigationActivityPaths(activity).map((path) => path.length),
          0,
        );

      return longestPath(right) - longestPath(left);
    })[0];
