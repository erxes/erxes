import {
  IVisitedPageNavigationModule,
  IVisitedPageTab,
  IVisitedPageTabLabels,
} from '@/navigation/types/VisitedPageTab';

const ROOT_PATHNAME = '/';
const IDENTIFIER_PATTERN = /^[a-zA-Z0-9_-]{16,}$/;
const MONGODB_IDENTIFIER_PATTERN = /^[a-f\d]{24}$/i;

const normalizeModulePath = (path: string) => path.replace(/^\/+|\/+$/g, '');

export const normalizeVisitedPagePathname = (pathname: string) => {
  if (pathname === ROOT_PATHNAME) {
    return ROOT_PATHNAME;
  }

  return `/${normalizeModulePath(pathname)}`;
};

export const shouldTrackVisitedPage = (pathname: string) =>
  normalizeVisitedPagePathname(pathname) !== ROOT_PATHNAME;

const getNavigationModules = (
  modules: IVisitedPageNavigationModule[],
): IVisitedPageNavigationModule[] =>
  modules.flatMap((module) => [
    module,
    ...(module.submenus ? getNavigationModules(module.submenus) : []),
  ]);

const isMatchingModulePath = (pathname: string, modulePath: string) =>
  pathname === modulePath || pathname.startsWith(`${modulePath}/`);

const toTitleCase = (value: string) =>
  decodeURIComponent(value)
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');

const toRouteSegmentLabel = (segment: string, detailsLabel: string) => {
  if (
    MONGODB_IDENTIFIER_PATTERN.test(segment) ||
    IDENTIFIER_PATTERN.test(segment)
  ) {
    return detailsLabel;
  }

  return toTitleCase(segment);
};

const getFallbackLabel = (pathname: string, labels: IVisitedPageTabLabels) => {
  const pathSegments = normalizeModulePath(pathname).split('/').filter(Boolean);

  if (pathSegments[0] === 'my-inbox') {
    return labels.myInbox;
  }

  return pathSegments
    .map((segment) => toRouteSegmentLabel(segment, labels.details))
    .join(' / ');
};

const getMatchingNavigationModule = (
  pathname: string,
  modules: IVisitedPageNavigationModule[],
) => {
  const normalizedPathname = normalizeModulePath(pathname);

  return getNavigationModules(modules)
    .filter((module) =>
      isMatchingModulePath(
        normalizedPathname,
        normalizeModulePath(module.path),
      ),
    )
    .sort(
      (left, right) =>
        normalizeModulePath(right.path).length -
        normalizeModulePath(left.path).length,
    )[0];
};

export const getVisitedPageTabLabel = (
  pathname: string,
  modules: IVisitedPageNavigationModule[],
  labels: IVisitedPageTabLabels,
) => {
  const normalizedPathname = normalizeModulePath(pathname);
  const matchingModule = getMatchingNavigationModule(pathname, modules);

  if (!matchingModule) {
    return getFallbackLabel(pathname, labels);
  }

  const matchingPath = normalizeModulePath(matchingModule.path);
  const remainingPath = normalizedPathname
    .slice(matchingPath.length)
    .replace(/^\//, '');

  if (!remainingPath) {
    return matchingModule.name;
  }

  const remainingLabel = remainingPath
    .split('/')
    .map((segment) => toRouteSegmentLabel(segment, labels.details))
    .join(' / ');

  return `${matchingModule.name} · ${remainingLabel}`;
};

export const getVisitedPageTabIcon = (
  pathname: string,
  modules: IVisitedPageNavigationModule[],
) => getMatchingNavigationModule(pathname, modules)?.icon;

export const addVisitedPageTab = (
  tabs: IVisitedPageTab[],
  pathname: string,
) => {
  const normalizedPathname = normalizeVisitedPagePathname(pathname);

  if (
    !shouldTrackVisitedPage(normalizedPathname) ||
    tabs.some((tab) => tab.pathname === normalizedPathname)
  ) {
    return tabs;
  }

  return [...tabs, { pathname: normalizedPathname }];
};

export const removeVisitedPageTab = (
  tabs: IVisitedPageTab[],
  pathname: string,
) => tabs.filter((tab) => tab.pathname !== pathname);

export const getVisitedPageTabCloseDestination = (
  tabs: IVisitedPageTab[],
  pathname: string,
) => {
  const tabIndex = tabs.findIndex((tab) => tab.pathname === pathname);

  if (tabIndex < 0) {
    return null;
  }

  return tabs[tabIndex - 1]?.pathname ?? tabs[tabIndex + 1]?.pathname ?? null;
};
