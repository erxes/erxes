import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';
import { IconSend } from '@tabler/icons-react';
import { Button, Input, Popover, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useBroadcastSendTestEmail } from '../hooks/useBroadcastSendTestEmail';

const isSingleEmail = (value: string) =>
  !value.includes(',') && z.string().email().safeParse(value.trim()).success;

export const BroadcastSendTestEmail = ({
  variant = 'secondary',
}: {
  variant?: 'secondary' | 'ghost';
}) => {
  const { getValues } = useFormContext();
  const { toast } = useToast();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const { sendTestEmail, loading: sendLoading } = useBroadcastSendTestEmail();
  const { alignedFrom, loading: senderOptionsLoading } = useSenderOptions();

  const [to, setTo] = useState('');
  const [open, setOpen] = useState(false);

  const hasComma = to.includes(',');
  const isValid = isSingleEmail(to);

  const handleSend = () => {
    const { fromEmail, email } = getValues();

    sendTestEmail({
      variables: {
        from: alignedFrom || fromEmail,
        to,
        contentJson: email?.contentJson,
        previewText: email?.previewText,
        title: email?.subject || '',
      },
      onCompleted: () => {
        toast({
          variant: 'default',
          title: t('sendTestEmailSuccess', { email: to }),
        });
        setOpen(false);
      },
      onError: (error) => {
        toast({ variant: 'destructive', title: error.message });
      },
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant={variant} type="button">
          <IconSend />
          {t('sendEmail')}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="flex flex-col gap-2 w-80">
        <Input
          type="email"
          placeholder={t('sendTestEmailPlaceholder')}
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        {hasComma && (
          <p className="text-sm text-destructive">
            {t('sendTestEmailSingleRecipientOnly')}
          </p>
        )}
        <Button
          type="button"
          disabled={!to || !isValid || sendLoading || senderOptionsLoading}
          onClick={handleSend}
          className="w-full"
        >
          {sendLoading
            ? t('sendTestEmailSending')
            : senderOptionsLoading
              ? t('sendTestEmailLoadingSenderInfo')
              : t('sendTestEmailAction')}
        </Button>
      </Popover.Content>
    </Popover>
  );
};
