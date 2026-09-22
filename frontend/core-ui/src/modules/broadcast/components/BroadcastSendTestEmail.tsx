import { IconSend } from '@tabler/icons-react';
import { Button, cn, Input, Popover, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useBroadcastEmailReadiness } from '../hooks/useBroadcastEmailReadiness';
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
  const {
    from,
    blockers,
    ready,
    loading: senderOptionsLoading,
  } = useBroadcastEmailReadiness();

  const [to, setTo] = useState('');
  const [open, setOpen] = useState(false);

  const hasComma = to.includes(',');
  const isValid = isSingleEmail(to);
  const showInvalid = to.length > 0 && !isValid;

  const handleSend = () => {
    const { email } = getValues();

    sendTestEmail({
      variables: {
        from,
        to,
        contentJson: email?.contentJson,
        contentFormat: email?.contentFormat || 'maily',
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
          {t('sendTest')}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="flex flex-col gap-2 w-80">
        {/* An address box would suggest this could be sent; these are the
            reasons it cannot be. */}
        {!ready ? (
          <ul className="flex list-disc flex-col gap-1.5 pl-4 text-sm text-muted-foreground">
            {blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        ) : (
          <>
            <Input
              type="email"
              placeholder={t('sendTestEmailPlaceholder')}
              value={to}
              onChange={(e) => setTo(e.target.value)}
              aria-invalid={showInvalid}
              className={cn(
                showInvalid &&
                  'shadow-destructive focus-visible:shadow-focus-destructive',
              )}
            />
            {showInvalid && (
              <p className="text-sm text-destructive">
                {hasComma
                  ? t('sendTestEmailSingleRecipientOnly')
                  : t('sendTestEmailInvalidAddress')}
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
          </>
        )}
      </Popover.Content>
    </Popover>
  );
};
