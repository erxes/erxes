import { BROADCAST_RECIPIENT_EMAIL } from '@/broadcast/graphql/queries';
import { useQuery } from '@apollo/client';
import dayjs from 'dayjs';
import { EmailPreviewDevice } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type TRecipientEmail = {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  html: string;
  status: string;
  reason?: string;
  sentAt?: string;
  events: { status: string; createdAt?: string }[];
};

/**
 * One recipient's copy of the campaign, rebuilt on the server from what the
 * run froze — so it is the email that person was sent, not an approximation
 * of it.
 */
export const useBroadcastRecipientEmail = (recipientId?: string) => {
  const { data, loading, error } = useQuery<{
    broadcastRecipientEmail: TRecipientEmail | null;
  }>(BROADCAST_RECIPIENT_EMAIL, {
    variables: { _id: recipientId },
    skip: !recipientId,
  });

  return { email: data?.broadcastRecipientEmail, loading, error };
};

export const formatEventTime = (createdAt: string) =>
  dayjs(createdAt).format('YYYY-MM-DD HH:mm');

/**
 * The recipient's email as drawn: the device it is previewed on, the avatar
 * initial, and what to say when the provider reported nothing yet.
 */
export const useBroadcastRecipientEmailView = (recipientId: string) => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'recipientEmail' });
  const { email, loading, error } = useBroadcastRecipientEmail(recipientId);
  const [device, setDevice] = useState<EmailPreviewDevice>('desktop');

  const noEventsLabelOf = () => {
    if (!email) {
      return '';
    }

    return email.sentAt
      ? t('no-events-yet')
      : t('never-left', { status: email.status });
  };

  return {
    email,
    loading,
    hasError: !!error,
    unavailableMessage: error?.message || t('unavailable'),
    device,
    setDevice,
    recipientInitial: (email?.to || '?').charAt(0).toUpperCase(),
    noEventsLabel: noEventsLabelOf(),
  };
};
