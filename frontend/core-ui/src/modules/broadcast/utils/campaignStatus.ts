import { BadgeProps } from 'erxes-ui';
import {
  BROADCAST_MESSAGE_KINDS,
  BROADCAST_MESSAGE_STATUS_MAP,
} from '../constants';
import {
  isRecurring,
  isScheduled,
  scheduledAt,
  TCampaignSchedule,
} from './campaignSchedule';
import { TCampaignLockState } from './campaignActions';

export type TCampaignRow = TCampaignSchedule & {
  _id: string;
  kind?: string;
  isLive?: boolean;
  status?: keyof typeof BROADCAST_MESSAGE_STATUS_MAP;
  approvalLockState?: TCampaignLockState;
};

/**
 * Pause leaves `status` alone and only clears `isLive`, so a run stopped
 * half-way still reads `sending`. Asking the status first would call that
 * campaign live when it is the one thing it is not.
 */
export const campaignStatus = (
  row: TCampaignRow,
): { labelKey: string; style: BadgeProps['variant'] } => {
  const { isDraft, isLive, status, kind, runCount = 0 } = row;

  if (isDraft) {
    return { labelKey: 'status.draft', style: 'secondary' };
  }

  // An alarm can be lost while the campaign that was waiting for it cannot:
  // a moment in the past with nothing sent is worth saying out loud, because
  // only a person can start it now.
  if (isScheduled(row)) {
    if (isRecurring(row)) {
      return { labelKey: 'trigger.recurring', style: 'info' };
    }

    return (scheduledAt(row) as Date) > new Date()
      ? { labelKey: 'trigger.scheduled', style: 'info' }
      : { labelKey: 'status.overdue', style: 'warning' };
  }

  if (status === 'sending' && !isLive) {
    return { labelKey: 'status.paused', style: 'warning' };
  }

  if (status) {
    const mapped = BROADCAST_MESSAGE_STATUS_MAP[status];

    if (mapped) {
      return { labelKey: mapped.labelKey, style: mapped.style };
    }
  }

  if (kind === BROADCAST_MESSAGE_KINDS.MANUAL) {
    return runCount > 0
      ? { labelKey: 'status.sent', style: 'success' }
      : { labelKey: 'status.not-sent', style: 'warning' };
  }

  return isLive
    ? { labelKey: 'status.sending', style: 'info' }
    : { labelKey: 'status.paused', style: 'warning' };
};
