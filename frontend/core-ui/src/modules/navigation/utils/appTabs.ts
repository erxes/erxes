import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { splitPromotedNavigationActivities } from '@/navigation/utils/promotedNavigationActivities';

/** Every plugin, promoted ones first: the tabs before the user changes any. */
export const getDefaultAppTabIds = (activities: INavigationActivity[]) => {
  const { promoted, rest } = splitPromotedNavigationActivities(
    activities.filter((activity) => activity.kind === 'plugin'),
  );

  return [...promoted, ...rest].map((activity) => activity.id);
};

/** Stored tabs that still exist (a plugin may be removed or forbidden). */
export const resolveAppTabIds = (
  stored: string[] | null,
  activities: INavigationActivity[],
) => {
  if (!stored) {
    return getDefaultAppTabIds(activities);
  }

  const known = new Set(activities.map((activity) => activity.id));

  return stored.filter((id) => known.has(id));
};

export const openAppTab = (tabIds: string[], tabId: string) =>
  tabIds.includes(tabId) ? tabIds : [...tabIds, tabId];

/** Like a browser: closing a tab hands focus to its right, else left, neighbour. */
export const closeAppTab = (tabIds: string[], tabId: string) => {
  const index = tabIds.indexOf(tabId);
  const remaining = tabIds.filter((id) => id !== tabId);

  return {
    tabIds: remaining,
    neighbourId:
      index < 0 ? undefined : remaining[index] ?? remaining[index - 1],
  };
};

export const moveAppTab = (tabIds: string[], fromId: string, toId: string) => {
  const from = tabIds.indexOf(fromId);
  const to = tabIds.indexOf(toId);

  if (from < 0 || to < 0 || from === to) {
    return tabIds;
  }

  const next = [...tabIds];
  const [moved] = next.splice(from, 1);

  next.splice(to, 0, moved);

  return next;
};
