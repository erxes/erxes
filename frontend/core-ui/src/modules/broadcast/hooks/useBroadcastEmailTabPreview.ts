import { useEmailContentPreview } from '@/emailTemplates/hooks/useEmailContentPreview';
import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';
import { EmailPreviewDevice } from 'erxes-ui';
import { useState } from 'react';
import { TBroadcastMessage } from '../types';

const addressLine = (sender: string | undefined, address: string) =>
  sender ? `${sender} <${address}>` : address;

/**
 * A sent campaign's header as the recipient saw it. With an aligned address
 * the From is fixed and the chosen address only receives replies; otherwise
 * the From is the chosen address, or the member who sent it.
 */
export const useBroadcastEmailTabPreview = (message?: TBroadcastMessage) => {
  const { fromEmail, fromUserId, email } = message || {};
  const { sender, subject, content, contentJson, replyTo } = email || {};
  const { alignedFrom } = useSenderOptions();

  const fromAddress = alignedFrom || fromEmail;

  return {
    subject,
    fromLine: fromAddress
      ? alignedFrom
        ? `${sender} <${alignedFrom}>`
        : addressLine(sender, fromAddress)
      : null,
    fromMemberIds: fromUserId ? [fromUserId] : [],
    replyToLine: alignedFrom ? fromEmail : replyTo,
    isMaily: !!contentJson,
    content: content || '',
  };
};

/** A Maily email's saved html with its fields filled, on a chosen device. */
export const useMailyContentPreview = (content: string) => {
  const { html, loading, error } = useEmailContentPreview({
    content,
    contentFormat: 'maily',
  });
  const [device, setDevice] = useState<EmailPreviewDevice>('desktop');

  return { html, loading: loading && !html, error, device, setDevice };
};
