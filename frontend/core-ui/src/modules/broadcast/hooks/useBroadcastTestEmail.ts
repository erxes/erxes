import { renderEmailHtml, useToast } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useBroadcastSendTestEmail } from './useBroadcastSendTestEmail';

/** Sends the email being written to one address, from the chosen sender. */
export const useBroadcastTestEmail = (from?: string) => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const { toast } = useToast();
  const { getValues } = useFormContext();
  const { sendTestEmail, loading } = useBroadcastSendTestEmail();

  /** Resolves whether it was sent. */
  const send = async (to: string): Promise<boolean> => {
    const { email } = getValues();
    let sent = false;

    await sendTestEmail({
      variables: {
        from,
        to,
        content: await renderEmailHtml(email?.contentJson, {
          previewText: email?.previewText,
        }),
        contentFormat: 'maily',
        title: email?.subject || '',
      },
      onCompleted: () => {
        sent = true;
        toast({
          variant: 'default',
          title: t('sendTestEmailSuccess', { email: to }),
        });
      },
      onError: (error) =>
        toast({ variant: 'destructive', title: error.message }),
    });

    return sent;
  };

  return { send, loading };
};
