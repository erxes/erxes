import { IMailMessage } from '@/integrations/mail/@types/message';
import {
  MAIL_DELIVERY_STATUSES,
  MAIL_PENDING_STALE_MS,
} from '@/integrations/mail/constants';

const staleBefore = (now: number) => new Date(now - MAIL_PENDING_STALE_MS);

export const resendableFilter = (now = Date.now()) => ({
  $or: [
    { deliveryStatus: MAIL_DELIVERY_STATUSES.FAILED },
    {
      deliveryStatus: MAIL_DELIVERY_STATUSES.PENDING,
      deliveryAttemptedAt: { $lt: staleBefore(now) },
    },
    {
      deliveryStatus: MAIL_DELIVERY_STATUSES.PENDING,
      deliveryAttemptedAt: { $exists: false },
      createdAt: { $lt: staleBefore(now) },
    },
  ],
});

export const canResend = (
  message: Pick<
    IMailMessage,
    'deliveryStatus' | 'deliveryAttemptedAt' | 'createdAt'
  >,
  now = Date.now(),
) => {
  if (message.deliveryStatus === MAIL_DELIVERY_STATUSES.FAILED) {
    return true;
  }

  if (message.deliveryStatus !== MAIL_DELIVERY_STATUSES.PENDING) {
    return false;
  }

  const startedAt = message.deliveryAttemptedAt ?? message.createdAt;

  return Boolean(startedAt) && new Date(startedAt) < staleBefore(now);
};
