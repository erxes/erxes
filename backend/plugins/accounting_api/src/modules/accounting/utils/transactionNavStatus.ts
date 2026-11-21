import { TR_STATUSES } from '../@types/constants';

/**
 * Sidebar shortcuts (`navStatus`) find what concerns the signed-in user.
 * Committed and executing rows match by status alone; approval requests and
 * addressed drafts only where the user is a recipient; personal drafts only
 * where the user is the performer. Group keys combine their statuses.
 */
const statusFilters = (userId: string): Record<string, object> => ({
  [TR_STATUSES.ESTIMATED]: { status: TR_STATUSES.ESTIMATED },
  [TR_STATUSES.COMPLETE]: { status: TR_STATUSES.COMPLETE },
  [TR_STATUSES.EXECUTING]: { status: TR_STATUSES.EXECUTING },
  [TR_STATUSES.REQUESTED]: {
    status: TR_STATUSES.REQUESTED,
    mentionUserIds: { $in: [userId] },
  },
  [TR_STATUSES.MENTIONED]: {
    status: TR_STATUSES.MENTIONED,
    mentionUserIds: { $in: [userId] },
  },
  [TR_STATUSES.DRAFT]: {
    status: TR_STATUSES.DRAFT,
    mentionOwnerId: userId,
  },
  [TR_STATUSES.PLAN]: { status: TR_STATUSES.PLAN },
});

const TR_NAV_STATUS_GROUPS: Record<string, string[]> = {
  committed: [TR_STATUSES.ESTIMATED, TR_STATUSES.COMPLETE],
  pending: [TR_STATUSES.EXECUTING, TR_STATUSES.REQUESTED],
  drafts: [TR_STATUSES.DRAFT, TR_STATUSES.MENTIONED],
};

/** Returns the `$or` for a nav shortcut, or undefined for an unknown key. */
export const getNavStatusFilter = (navStatus: string, userId: string) => {
  const filters = statusFilters(userId);
  const statuses = TR_NAV_STATUS_GROUPS[navStatus] ?? [navStatus];
  const conditions = statuses
    .map((status) => filters[status])
    .filter((condition): condition is object => !!condition);

  return conditions.length ? { $or: conditions } : undefined;
};
