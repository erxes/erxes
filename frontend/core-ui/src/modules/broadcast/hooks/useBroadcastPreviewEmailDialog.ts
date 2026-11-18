import { useBroadcastEmailPreview } from '@/broadcast/hooks/useBroadcastEmailPreview';
import { useBroadcastEmailReadiness } from '@/broadcast/hooks/useBroadcastEmailReadiness';
import { EmailPreviewDevice } from 'erxes-ui';
import { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';

type TPreviewEmail = {
  sender?: string;
  subject?: string;
  previewText?: string;
};

/**
 * The email as a recipient's inbox would show it: rendered when the dialog
 * opens, under the same sender line and subject the inbox would draw.
 */
export const useBroadcastPreviewEmailDialog = () => {
  const { getValues } = useFormContext();
  const { from, blockers, ready } = useBroadcastEmailReadiness();
  const { render, html, loading, error } = useBroadcastEmailPreview();
  const [device, setDevice] = useState<EmailPreviewDevice>('desktop');
  const email: TPreviewEmail | undefined = getValues().email;

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        render(getValues().email);
      }
    },
    [render, getValues],
  );

  return {
    ready,
    blockersText: blockers.join(' '),
    device,
    setDevice,
    handleOpenChange,
    html,
    loading,
    error,
    initial: (email?.sender || from || '?').charAt(0).toUpperCase(),
    subject: email?.subject,
    senderLine: email?.sender ? `${email.sender} <${from}>` : from,
    previewText: email?.previewText,
  };
};
