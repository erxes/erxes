export type TNavigationActivityMoveDirection = 'up' | 'down';

export const sortNavigationActivitiesByOrder = <T extends { id: string }>(
  activities: T[],
  storedOrder: string[] | null,
) => {
  if (!storedOrder?.length) {
    return activities;
  }

  const positions = new Map(storedOrder.map((id, index) => [id, index]));

  return [...activities].sort(
    (a, b) =>
      (positions.get(a.id) ?? storedOrder.length) -
      (positions.get(b.id) ?? storedOrder.length),
  );
};

export const moveNavigationActivityId = ({
  activityId,
  allActivityIds,
  direction,
  scopeActivityIds,
}: {
  activityId: string;
  allActivityIds: string[];
  direction: TNavigationActivityMoveDirection;
  scopeActivityIds: string[];
}) => {
  const scopeIndex = scopeActivityIds.indexOf(activityId);
  const neighborId =
    scopeActivityIds[direction === 'up' ? scopeIndex - 1 : scopeIndex + 1];

  if (scopeIndex === -1 || !neighborId) {
    return allActivityIds;
  }

  const nextActivityIds = [...allActivityIds];
  const from = nextActivityIds.indexOf(activityId);
  const to = nextActivityIds.indexOf(neighborId);

  [nextActivityIds[from], nextActivityIds[to]] = [
    nextActivityIds[to],
    nextActivityIds[from],
  ];

  return nextActivityIds;
};
