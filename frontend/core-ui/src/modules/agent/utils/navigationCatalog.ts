import type { INavigationActivity } from '@/navigation/types/NavigationActivity';

/**
 * The client's navigable-page catalog, sent with every `/agents/chat`
 * turn and ranked by the backend `findPages` tool. Entries are exactly
 * what the current client could itself open — never a permission grant.
 */
export interface IAgentsNavigationEntry {
  path: string;
  label: string;
  group?: string;
}

export const NAVIGATION_CATALOG_MAX_ENTRIES = 400;

/** A settings sub-navigation entry as shaped by GET_SETTINGS_SUB_NAVIGATION. */
export interface ISettingsSubNavigationGroup {
  name: string;
  items: { name: string; path: string }[];
}

/**
 * Every activity contributes its default page (the group's own landing
 * entry), each module, and each submenu. Submenus keep the module as
 * their group so ranking can see both parents.
 */
const activityEntries = (
  activity: INavigationActivity,
): IAgentsNavigationEntry[] => {
  const entries: IAgentsNavigationEntry[] = [
    { path: activity.defaultPath, label: activity.label, group: activity.label },
  ];

  for (const module of activity.modules) {
    entries.push({
      path: module.path,
      label: module.name,
      group: activity.label,
    });
    for (const submenu of module.submenus ?? []) {
      entries.push({
        path: submenu.path,
        label: submenu.name,
        group: `${activity.label} · ${module.name}`,
      });
    }
  }

  return entries;
};

const normalisePath = (path: unknown): string | null =>
  typeof path === 'string' && path.trim()
    ? path.startsWith('/')
      ? path
      : `/${path}`
    : null;

/**
 * Builds the catalog from the permission-resolved navigation activities,
 * the settings pages available as data (settings groups + every sub-
 * navigation item, agent settings included), and fixed core pages.
 * Paths are normalised to start with '/', deduped by path (first wins),
 * and capped at `NAVIGATION_CATALOG_MAX_ENTRIES`.
 */
export const buildNavigationCatalog = ({
  activities,
  settingsGroups = [],
  settingsSubNavigation = {},
  fixed = [],
}: {
  activities: INavigationActivity[];
  /** Top-level settings groups (account/nav/developer arrays flattened). */
  settingsGroups?: { name: string; path: string }[][];
  /** GET_SETTINGS_SUB_NAVIGATION output: group name -> items. */
  settingsSubNavigation?: Record<string, ISettingsSubNavigationGroup>;
  /** Always-valid core pages not covered by the nav activities. */
  fixed?: IAgentsNavigationEntry[];
}): IAgentsNavigationEntry[] => {
  const entries: IAgentsNavigationEntry[] = [];

  for (const activity of activities) {
    entries.push(...activityEntries(activity));
  }

  for (const group of settingsGroups) {
    for (const item of group) {
      entries.push({ path: item.path, label: item.name, group: 'Settings' });
    }
  }

  for (const navigation of Object.values(settingsSubNavigation)) {
    for (const item of navigation.items) {
      entries.push({
        path: item.path,
        label: item.name,
        group: `Settings · ${navigation.name}`,
      });
    }
  }

  entries.push(...fixed);

  const seen = new Set<string>();
  const catalog: IAgentsNavigationEntry[] = [];

  for (const entry of entries) {
    const path = normalisePath(entry.path);
    if (!path || !entry.label?.trim()) continue;
    if (seen.has(path)) continue;
    seen.add(path);
    catalog.push({ ...entry, path, label: entry.label.trim() });
    if (catalog.length >= NAVIGATION_CATALOG_MAX_ENTRIES) break;
  }

  return catalog;
};

const pathnameOf = (path: string): string => path.split('?')[0];

/**
 * Whether `path` is a page this client can actually open: its pathname
 * (anything before '?') equals a catalog entry's pathname or nests under
 * one. `findPages` page chips only navigate when this holds — an
 * invented or foreign path stays a plain pill.
 */
export const isKnownCatalogPage = (
  catalog: IAgentsNavigationEntry[],
  path: string,
): boolean => {
  const pathname = pathnameOf(path);
  return catalog.some((entry) => {
    const entryPathname = pathnameOf(entry.path);
    return (
      pathname === entryPathname || pathname.startsWith(`${entryPathname}/`)
    );
  });
};
