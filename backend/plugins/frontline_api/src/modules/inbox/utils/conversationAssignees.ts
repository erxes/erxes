type ConversationAssignment = {
  assignedUserId?: string | null;
  assignedUserIds?: string[] | null;
};

export const getConversationAssigneeIds = (
  conversation: ConversationAssignment,
): string[] =>
  [
    ...new Set(
      conversation.assignedUserIds ??
        (conversation.assignedUserId ? [conversation.assignedUserId] : []),
    ),
  ].filter(Boolean);

export const buildAssigneeFilter = (userIds: string[], prefix = '') => ({
  $or: [
    { [`${prefix}assignedUserIds`]: { $in: userIds } },
    {
      [`${prefix}assignedUserIds`]: null,
      [`${prefix}assignedUserId`]: { $in: userIds },
    },
  ],
});

export const buildUnassignedFilter = () => ({
  $or: [
    { assignedUserIds: { $size: 0 } },
    { assignedUserIds: null, assignedUserId: { $in: [null, ''] } },
  ],
});

export const assigneeAggregation = {
  $ifNull: [
    '$assignedUserIds',
    {
      $cond: [{ $ifNull: ['$assignedUserId', false] }, ['$assignedUserId'], []],
    },
  ],
};

export const getAssigneeChanges = (
  previous: string[] | undefined,
  current: string[],
  legacyPrevious?: string,
) => {
  const before = previous ?? (legacyPrevious ? [legacyPrevious] : []);
  return {
    added: current.filter((id) => !before.includes(id)),
    removed: before.filter((id) => !current.includes(id)),
  };
};
