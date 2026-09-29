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
 * row whose flow has not been created yet is `processing`, which is what it
 * is — but only where a flow is coming. A campaign that just sends an email
 * has nothing after dispatch, and reading its sent rows as "processing" left
 * a finished campaign looking like it had stalled.
 */
export const recipientOutcome = (
  recipient: TBroadcastRecipient,
  { hasFlow = false }: { hasFlow?: boolean } = {},
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
      if (!hasFlow) {
        return 'done';
      }

      return (
        EXECUTION_OUTCOME[recipient.execution?.status || ''] || 'processing'
      );
  }
};

/** Whether there is anything to say about why it is not simply done. */
export const hasRecipientReason = (recipient: TBroadcastRecipient) =>
  !!recipient.reason ||
  ['error', 'waiting'].includes(recipient.execution?.status || '');

/** Why it is not simply done, in the words of whichever half knows. */
export const recipientReason = (
  recipient: TBroadcastRecipient,
  t: (key: string, options?: Record<string, unknown>) => string,
) => {
  if (recipient.reason) {
    return recipient.reason;
  }

  const { status, failedActionType } = recipient.execution || {};

  if (status === 'error') {
    return failedActionType
      ? t('recipients.failed-on', { action: failedActionType })
      : t('recipients.flow-failed');
  }

  if (status === 'waiting') {
    return t('recipients.waiting');
  }

  return '';
};
