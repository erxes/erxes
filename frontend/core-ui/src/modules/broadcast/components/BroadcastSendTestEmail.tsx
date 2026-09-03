import { IconSend } from '@tabler/icons-react';
import { Button, Input, Popover, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useBroadcastSendTestEmail } from '../hooks/useBroadcastSendTestEmail';

export const BroadcastSendTestEmail = ({
  variant = 'secondary',
}: {
  variant?: 'secondary' | 'ghost';
}) => {
  const { getValues } = useFormContext();
  const { toast } = useToast();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const { sendTestEmail, loading } = useBroadcastSendTestEmail();

  const [to, setTo] = useState('');
  const [open, setOpen] = useState(false);

  const handleSend = () => {
    const { fromEmail, email } = getValues();

    sendTestEmail({
      variables: {
        from: fromEmail,
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
        <Button
          type="button"
          disabled={!to || loading}
          onClick={handleSend}
          className="w-full"
        >
          {loading ? t('sendTestEmailSending') : t('sendTestEmailAction')}
        </Button>
      </Popover.Content>
    </Popover>
  );
};
