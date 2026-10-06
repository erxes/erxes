import { IconSend } from '@tabler/icons-react';
import { Button, cn, Input, Popover } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useBroadcastEmailReadiness } from '../hooks/useBroadcastEmailReadiness';
import { useBroadcastTestEmail } from '../hooks/useBroadcastTestEmail';

const isSingleEmail = (value: string) =>
  !value.includes(',') && z.string().email().safeParse(value.trim()).success;

export const BroadcastSendTestEmail = ({
  variant = 'secondary',
}: {
  variant?: 'secondary' | 'ghost';
}) => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const {
    from,
    blockers,
    ready,
    loading: senderOptionsLoading,
  } = useBroadcastEmailReadiness({ requireSubject: true });
  const { send, loading: sendLoading } = useBroadcastTestEmail(from);

  const [to, setTo] = useState('');
  const [open, setOpen] = useState(false);

  const hasComma = to.includes(',');
  const isValid = isSingleEmail(to);
  const showInvalid = to.length > 0 && !isValid;

  const handleSend = async () => {
    if (await send(to)) {
      setOpen(false);
    }
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
