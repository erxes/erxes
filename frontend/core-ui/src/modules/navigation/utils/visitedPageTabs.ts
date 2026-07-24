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

const isVisitedPageTab = (value: unknown): value is IVisitedPageTab =>
  typeof value === 'object' &&
  value !== null &&
  'pathname' in value &&
  typeof value.pathname === 'string';

export const normalizeVisitedPageTabs = (
  value: unknown,
): IVisitedPageTab[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenPathnames = new Set<string>();

  return value.reduce<IVisitedPageTab[]>((tabs, tab) => {
    if (!isVisitedPageTab(tab)) {
      return tabs;
    }

    const pathname = normalizeVisitedPagePathname(tab.pathname);

    if (
      !shouldTrackVisitedPage(pathname) ||
      seenPathnames.has(pathname)
    ) {
      return tabs;
    }

    seenPathnames.add(pathname);
    tabs.push({ pathname });

    return tabs;
  }, []);
};

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
    return toTitleCase(matchingModule.name);
  }

  const remainingSegments = remainingPath.split('/');
  const currentPageSegment =
    remainingSegments[remainingSegments.length - 1];

  return toRouteSegmentLabel(currentPageSegment, labels.details);
};

export const getVisitedPageTabTitle = (
  pageLabel: string,
  pluginLabel?: string,
) => (pluginLabel ? `${pluginLabel} | ${pageLabel}` : pageLabel);

export const addVisitedPageTab = (
  tabs: unknown,
  pathname: string,
) => {
  const normalizedTabs = normalizeVisitedPageTabs(tabs);
  const normalizedPathname = normalizeVisitedPagePathname(pathname);

  if (
    !shouldTrackVisitedPage(normalizedPathname) ||
    normalizedTabs.some((tab) => tab.pathname === normalizedPathname)
  ) {
    return normalizedTabs;
  }

  return [...normalizedTabs, { pathname: normalizedPathname }];
};

export const removeVisitedPageTab = (
  tabs: unknown,
  pathname: string,
) => {
  const normalizedPathname = normalizeVisitedPagePathname(pathname);

  return normalizeVisitedPageTabs(tabs).filter(
    (tab) => tab.pathname !== normalizedPathname,
  );
};

export const visitVisitedPageTab = (
  tabs: unknown,
  pathname: string,
  replacedPathname?: string,
) => {
  const normalizedTabs = normalizeVisitedPageTabs(tabs);
  const normalizedPathname = normalizeVisitedPagePathname(pathname);

  if (!shouldTrackVisitedPage(normalizedPathname)) {
    return normalizedTabs;
  }

  const normalizedReplacedPathname = replacedPathname
    ? normalizeVisitedPagePathname(replacedPathname)
    : undefined;

  if (
    normalizedReplacedPathname &&
    normalizedReplacedPathname !== normalizedPathname
  ) {
    const replacedTabIndex = normalizedTabs.findIndex(
      (tab) => tab.pathname === normalizedReplacedPathname,
    );

    if (replacedTabIndex >= 0) {
      const destinationAlreadyOpen = normalizedTabs.some(
        (tab) => tab.pathname === normalizedPathname,
      );

      if (destinationAlreadyOpen) {
        return normalizedTabs.filter(
          (_, index) => index !== replacedTabIndex,
        );
      }

      return normalizedTabs.map((tab, index) =>
        index === replacedTabIndex ? { pathname: normalizedPathname } : tab,
      );
    }
  }

  return addVisitedPageTab(normalizedTabs, normalizedPathname);
};

export const moveVisitedPageTab = (
  tabs: unknown,
  pathname: string,
  destinationPathname: string,
) => {
  const normalizedTabs = normalizeVisitedPageTabs(tabs);
  const normalizedPathname = normalizeVisitedPagePathname(pathname);
  const normalizedDestinationPathname = normalizeVisitedPagePathname(
    destinationPathname,
  );
  const sourceIndex = normalizedTabs.findIndex(
    (tab) => tab.pathname === normalizedPathname,
  );
  const destinationIndex = normalizedTabs.findIndex(
    (tab) => tab.pathname === normalizedDestinationPathname,
  );

  if (
    sourceIndex < 0 ||
    destinationIndex < 0 ||
    sourceIndex === destinationIndex
  ) {
    return normalizedTabs;
  }

  const reorderedTabs = [...normalizedTabs];
  const [movedTab] = reorderedTabs.splice(sourceIndex, 1);
  reorderedTabs.splice(destinationIndex, 0, movedTab);

  return reorderedTabs;
};

export const getVisitedPageTabCloseDestination = (
  tabs: unknown,
  pathname: string,
) => {
  const normalizedTabs = normalizeVisitedPageTabs(tabs);
  const normalizedPathname = normalizeVisitedPagePathname(pathname);
  const tabIndex = normalizedTabs.findIndex(
    (tab) => tab.pathname === normalizedPathname,
  );

  if (tabIndex < 0) {
    return null;
  }

  return (
    normalizedTabs[tabIndex - 1]?.pathname ??
    normalizedTabs[tabIndex + 1]?.pathname ??
    null
  );
};
