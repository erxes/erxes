// skipcq: JS-D1001 - Covered by repository documentation policy.
export const resolvePinnedNavigationActivityIds = (
  storedActivityIds: string[] | null,
  availableActivityIds: string[],
) => {
  if (storedActivityIds === null) {
    return availableActivityIds;
  }

  const storedActivityIdSet = new Set(storedActivityIds);

  return availableActivityIds.filter((activityId) =>
    storedActivityIdSet.has(activityId),
  );
};

// skipcq: JS-D1001 - Covered by repository documentation policy.
export const resolveVisibleNavigationActivityIds = (
  pinnedActivityIds: string[],
  availableActivityIds: string[],
) => (pinnedActivityIds.length > 0 ? pinnedActivityIds : availableActivityIds);

// skipcq: JS-D1001 - Covered by repository documentation policy.
export const updatePinnedNavigationActivityIds = ({
  activityId,
  availableActivityIds,
  pinned,
  storedActivityIds,
}: {
  activityId: string;
  availableActivityIds: string[];
  pinned: boolean;
  storedActivityIds: string[] | null;
}) => {
  const pinnedActivityIdSet = new Set(
    resolvePinnedNavigationActivityIds(storedActivityIds, availableActivityIds),
  );

  if (pinned) {
    pinnedActivityIdSet.add(activityId);
  } else {
    pinnedActivityIdSet.delete(activityId);
  }

  return availableActivityIds.filter((availableActivityId) =>
    pinnedActivityIdSet.has(availableActivityId),
  );
};
