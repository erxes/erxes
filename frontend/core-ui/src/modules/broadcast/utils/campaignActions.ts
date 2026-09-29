import { ApprovalLockState } from 'ui-modules';
import {
  isRecurring,
  isScheduled,
  TCampaignSchedule,
} from './campaignSchedule';

/** The approval module's own state, not a second description of it. */
export type TCampaignLockState = ApprovalLockState | null;

type TCampaignState = TCampaignSchedule & {
  isLive?: boolean;
  status?: string;
  approvalLockState?: TCampaignLockState;
};

/**
 * Somebody has locked this campaign and it was not this person.
 *
 * Read once here rather than at each surface: the table, the grid, the sheet
 * and the command bar all ask this object what may be done, so a lock that is
 * only honoured in one of them is a lock that is not honoured.
 */
const isLockedOut = (campaign?: TCampaignState | null) =>
  campaign?.approvalLockState?.locked === true &&
  campaign.approvalLockState.hasAccess === false;

/**
 * What a campaign can be asked to do right now.
 *
 * `isLive` alone is not enough to tell apart a campaign that has not started
 * from one that has finished: both sit at `isLive: false`. Only the run status
 * separates them, and the difference matters — one is a first send, the other
 * would be a second one to the whole audience.
 */
export const campaignActions = (campaign?: TCampaignState | null) => {
  const isSending = campaign?.status === 'sending';
  const scheduled = isScheduled(campaign);
  const locked = isLockedOut(campaign);

  // Not started and not finished. The only state in which a first send can be
  // arranged — by hand now, or by the clock later.
  const canStart = campaign?.isDraft === true || scheduled;

  if (locked) {
    // Nothing is offered, including duplicating: a copy of a locked campaign
    // would be the same message with the lock left behind.
    return {
      canEdit: false,
      canGoLive: false,
      canSchedule: false,
      canResume: false,
      canPause: false,
      canCancelSchedule: false,
      canCopy: false,
      scheduled,
      locked,
    };
  }

  return {
    // Editable only while it has never gone out. What a run sends is frozen
    // when it starts, so editing a campaign that has already run would change
    // nothing for anyone it reached — and nothing for the recipients a paused
    // run still has left either. A scheduled one has sent to nobody yet, so it
    // stays open right up to its moment.
    // A repeating campaign is editable between occurrences however many times
    // it has run: what each run sends is frozen when that run opens, so the
    // change lands on the next occurrence and on nobody already reached.
    canEdit: isRecurring(campaign)
      ? !isSending
      : !!campaign && !campaign.isLive && !campaign.runCount,
    // Starting it by hand. On a scheduled campaign this is "send now", which
    // uses up the moment it was waiting for.
    canGoLive: canStart,
    // Handing it to the clock instead. Offered wherever going live is, since
    // they are the same decision made at different times.
    canSchedule: canStart,
    // Paused mid-run: going live again continues the run it stopped.
    canResume: campaign?.isLive === false && isSending,
    canPause: campaign?.isLive === true && isSending,
    // The only way to stop a send that nobody is watching for.
    canCancelSchedule: scheduled,
    // Always: a copy is a new draft and touches nothing that already went out.
    // It is also the only way back to a finished campaign, which can no longer
    // be edited or started again.
    canCopy: !!campaign,
    scheduled,
    locked,
  };
};
