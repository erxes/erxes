import { TBroadcastRecipient, TRecipientOutcome } from '../types';

const EXECUTION_OUTCOME: Record<string, TRecipientOutcome> = {
  active: 'processing',
  waiting: 'processing',
  standby: 'processing',
  complete: 'done',
  error: 'failed',
  missed: 'failed',
};

/**
 * One answer per recipient, out of the two halves that hold it.
 *
 * The manifest answers up to dispatch; the flow answers after. A dispatched
 * row whose flow has not been created yet falls through to `processing`, which
 * is what it is, so the gap between the two needs no case of its own.
 */
export const recipientOutcome = (
  recipient: TBroadcastRecipient,
): TRecipientOutcome => {
  switch (recipient.status) {
    case 'pending':
    case 'claimed':
      return 'queued';
    case 'skipped':
      return 'skipped';
    case 'failed':
    case 'missing':
      return 'failed';
    default:
      return (
        EXECUTION_OUTCOME[recipient.execution?.status || ''] || 'processing'
      );
  }
};

/** Why it is not simply done, in the words of whichever half knows. */
export const recipientReason = (recipient: TBroadcastRecipient) => {
  if (recipient.reason) {
    return recipient.reason;
  }

  const { status, failedActionType } = recipient.execution || {};

  if (status === 'error') {
    return failedActionType ? `Failed on ${failedActionType}` : 'Flow failed';
  }

  if (status === 'waiting') {
    return 'Waiting in the flow';
  }

  return '';
};
