import {
  IVisitedPageNavigationModule,
  IVisitedPageTab,
  IVisitedPageTabLabels,
} from '@/navigation/types/VisitedPageTab';

const ROOT_PATHNAME = '/';
const IDENTIFIER_PATTERN = /^[a-zA-Z0-9_-]{16,}$/;
const MONGODB_IDENTIFIER_PATTERN = /^[a-f\d]{24}$/i;

export const createVisitedPageTabId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

const normalizeModulePath = (path: string) => {
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

export const normalizeVisitedPagePathname = (pathname: string) => {
  if (pathname === ROOT_PATHNAME) {
    return ROOT_PATHNAME;
  }

  return `/${normalizeModulePath(pathname)}`;
};

export const shouldTrackVisitedPage = (pathname: string) =>
  normalizeVisitedPagePathname(pathname) !== ROOT_PATHNAME;

interface IStoredVisitedPageTab {
  id?: unknown;
  pathname: string;
  search?: unknown;
}

const isStoredVisitedPageTab = (
  value: unknown,
): value is IStoredVisitedPageTab =>
  typeof value === 'object' &&
  value !== null &&
  'pathname' in value &&
  typeof value.pathname === 'string';

const normalizeVisitedPageSearch = (search: unknown) => {
  if (typeof search !== 'string' || search.length === 0) {
    return undefined;
  }

  return search.startsWith('?') ? search : `?${search}`;
};

const createVisitedPageTab = (
  id: string,
  pathname: string,
  search?: unknown,
): IVisitedPageTab => {
  const normalizedSearch = normalizeVisitedPageSearch(search);

  return {
    id,
    pathname: normalizeVisitedPagePathname(pathname),
    ...(normalizedSearch && { search: normalizedSearch }),
  };
};

const getLegacyVisitedPageTabId = (pathname: string) =>
  `legacy:${encodeURIComponent(normalizeVisitedPagePathname(pathname))}`;

export const getVisitedPageTabLocation = ({
  pathname,
  search,
}: IVisitedPageTab) => `${pathname}${search ?? ''}`;

export const normalizeVisitedPageTabs = (value: unknown): IVisitedPageTab[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenIds = new Set<string>();

  return value.reduce<IVisitedPageTab[]>((tabs, tab) => {
    if (!isStoredVisitedPageTab(tab)) {
      return tabs;
    }

    const id =
      typeof tab.id === 'string' && tab.id.length > 0
        ? tab.id
        : getLegacyVisitedPageTabId(tab.pathname);
    const normalizedTab = createVisitedPageTab(id, tab.pathname, tab.search);

    if (
      !shouldTrackVisitedPage(normalizedTab.pathname) ||
      seenIds.has(normalizedTab.id)
    ) {
      return tabs;
    }

    seenIds.add(normalizedTab.id);
    tabs.push(normalizedTab);

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

const safeDecodeURIComponent = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const toTitleCase = (value: string) =>
  safeDecodeURIComponent(value)
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
  const currentPageSegment = remainingSegments[remainingSegments.length - 1];

  return toRouteSegmentLabel(currentPageSegment, labels.details);
};

export const getVisitedPageTabTitle = (
  pageLabel: string,
  pluginLabel?: string,
) => (pluginLabel ? `${pluginLabel} | ${pageLabel}` : pageLabel);

export const updateVisitedPageTab = (
  tabs: unknown,
  tabId: string,
  pathname: string,
  search?: string,
) => {
  const normalizedTabs = normalizeVisitedPageTabs(tabs);
  const nextTab = createVisitedPageTab(tabId, pathname, search);

  if (!shouldTrackVisitedPage(nextTab.pathname)) {
    return normalizedTabs;
  }

  return normalizedTabs.some((tab) => tab.id === tabId)
    ? normalizedTabs.map((tab) => (tab.id === tabId ? nextTab : tab))
    : [...normalizedTabs, nextTab];
};

export const insertVisitedPageTabAfter = (
  tabs: unknown,
  tab: IVisitedPageTab,
  precedingTabId: string | null,
) => {
  const normalizedTabs = normalizeVisitedPageTabs(tabs);
  const normalizedTab = createVisitedPageTab(tab.id, tab.pathname, tab.search);

  if (
    !shouldTrackVisitedPage(normalizedTab.pathname) ||
    normalizedTabs.some(({ id }) => id === normalizedTab.id)
  ) {
    return normalizedTabs;
  }

  const precedingTabIndex = normalizedTabs.findIndex(
    ({ id }) => id === precedingTabId,
  );

  if (precedingTabIndex < 0) {
    return [...normalizedTabs, normalizedTab];
  }

  const nextTabs = [...normalizedTabs];
  nextTabs.splice(precedingTabIndex + 1, 0, normalizedTab);

  return nextTabs;
};

export const removeVisitedPageTab = (tabs: unknown, tabId: string) =>
  normalizeVisitedPageTabs(tabs).filter((tab) => tab.id !== tabId);

export const moveVisitedPageTab = (
  tabs: unknown,
  tabId: string,
  destinationTabId: string,
) => {
  const normalizedTabs = normalizeVisitedPageTabs(tabs);
  const sourceIndex = normalizedTabs.findIndex((tab) => tab.id === tabId);
  const destinationIndex = normalizedTabs.findIndex(
    (tab) => tab.id === destinationTabId,
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
  tabId: string,
) => {
  const normalizedTabs = normalizeVisitedPageTabs(tabs);
  const tabIndex = normalizedTabs.findIndex((tab) => tab.id === tabId);

  if (tabIndex < 0) {
    return null;
  }

  return normalizedTabs[tabIndex - 1] ?? normalizedTabs[tabIndex + 1] ?? null;
};

export const getAdjacentVisitedPageTabId = (
  tabs: unknown,
  tabId: string | null,
  direction: 'next' | 'previous',
) => {
  const normalizedTabs = normalizeVisitedPageTabs(tabs);

  if (normalizedTabs.length === 0) {
    return null;
  }

  const currentIndex = normalizedTabs.findIndex((tab) => tab.id === tabId);

  if (currentIndex < 0) {
    return normalizedTabs[0].id;
  }

  const offset = direction === 'next' ? 1 : -1;
  const destinationIndex =
    (currentIndex + offset + normalizedTabs.length) % normalizedTabs.length;

  return normalizedTabs[destinationIndex].id;
};
