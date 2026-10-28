import type { IInvitationEntry } from '@/settings/team-member/types';

export const buildInvitationEntries = ({
  emails,
  entityId,
  seatIds,
}: {
  emails: string[];
  entityId?: string;
  seatIds: string[];
}): IInvitationEntry[] => {
  const placement = entityId
    ? { entityId, ...(seatIds.length ? { seatIds } : {}) }
    : {};

  return emails.map((email) => ({ email, ...placement }));
};
