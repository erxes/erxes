import { IconSend } from '@tabler/icons-react';
import { Button, cn, Input, Popover } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useBroadcastSendTestEmailForm } from '../hooks/useBroadcastSendTestEmailForm';

export const BroadcastSendTestEmail = ({
  variant = 'secondary',
}: {
  variant?: 'secondary' | 'ghost';
}) => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const {
    open,
    setOpen,
    ready,
    blockers,
    to,
    onToChange,
    showInvalid,
    invalidKey,
    sendDisabled,
    sendLabelKey,
    handleSend,
  } = useBroadcastSendTestEmailForm();

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
              onChange={onToChange}
              aria-invalid={showInvalid}
              className={cn(
                showInvalid &&
                  'shadow-destructive focus-visible:shadow-focus-destructive',
              )}
            />
            {showInvalid && (
              <p className="text-sm text-destructive">{t(invalidKey)}</p>
            )}
            <Button
              type="button"
              disabled={sendDisabled}
              onClick={handleSend}
              className="w-full"
            >
              {t(sendLabelKey)}
            </Button>
          </>
        )}
      </Popover.Content>
    </Popover>
  );
};
