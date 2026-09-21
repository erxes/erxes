import { INavigationActivity } from '@/navigation/types/NavigationActivity';

/** Rail order under Search: Command, then AI Agent. Matched on plugin defaultPath. */
const PROMOTED_NAVIGATION_RANK: Record<string, number> = {
  'cf-os': 0,
  'erxes-agent': 1,
};

const trimPath = (path: string) => path.replace(/^\/+|\/+$/g, '');

export const getPromotedNavigationRank = (activity: INavigationActivity) => {
  const rank = PROMOTED_NAVIGATION_RANK[trimPath(activity.defaultPath)];

  return rank === undefined ? null : rank;
};

export const isPromotedNavigationActivity = (activity: INavigationActivity) =>
  getPromotedNavigationRank(activity) !== null;

export const splitPromotedNavigationActivities = (
  activities: INavigationActivity[],
) => {
  const promoted: INavigationActivity[] = [];
  const rest: INavigationActivity[] = [];

  for (const activity of activities) {
    if (isPromotedNavigationActivity(activity)) {
      promoted.push(activity);
    } else {
      rest.push(activity);
    }
  }

  promoted.sort(
    (left, right) =>
      (getPromotedNavigationRank(left) ?? 0) -
      (getPromotedNavigationRank(right) ?? 0),
  );

  return { promoted, rest };
};
