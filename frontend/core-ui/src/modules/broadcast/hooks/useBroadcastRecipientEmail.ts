import { BROADCAST_RECIPIENT_EMAIL } from '@/broadcast/graphql/queries';
import { useQuery } from '@apollo/client';

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
