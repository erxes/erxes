import { IconEye } from '@tabler/icons-react';
import {
  Avatar,
  Button,
  Dialog,
  EmailPreviewDeviceToggle,
  EmailPreviewFrame,
  Spinner,
  Tooltip,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useBroadcastPreviewEmailDialog } from '../hooks/useBroadcastPreviewEmailDialog';

export const BroadcastPreviewEmailDialog = () => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const {
    ready,
    blockersText,
    device,
    setDevice,
    handleOpenChange,
    html,
    loading,
    error,
    initial,
    subject,
    senderLine,
    previewText,
  } = useBroadcastPreviewEmailDialog();

  const trigger = (
    <Button variant="secondary" type="button" disabled={!ready}>
      <IconEye />
      {t('previewEmail')}
    </Button>
  );

  // Nothing to look at until there is an email and an address to send it
  // from, so the button says why rather than opening on an empty frame.
  if (!ready) {
    return (
      <Tooltip>
        <Tooltip.Trigger asChild>
          <span tabIndex={0}>{trigger}</span>
        </Tooltip.Trigger>
        <Tooltip.Content side="bottom" className="max-w-64">
          {blockersText}
        </Tooltip.Content>
      </Tooltip>
    );
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Content className="sm:max-w-3xl h-[80vh] flex flex-col">
        <Dialog.Header>
          <Dialog.Title>{t('previewEmail')}</Dialog.Title>
        </Dialog.Header>

        {/* The same header an inbox would draw, so what is checked here is
            what the recipient actually sees. */}
        <div className="flex items-start gap-3 border-b px-6 pb-4">
          <Avatar size="lg">
            <Avatar.Fallback>{initial}</Avatar.Fallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">
              {subject || t('previewNoSubject')}
            </div>
            <div className="truncate text-sm text-muted-foreground">
              {senderLine}
            </div>
            {previewText && (
              <div className="truncate text-sm text-muted-foreground">
                {previewText}
              </div>
            )}
          </div>

          <EmailPreviewDeviceToggle value={device} onChange={setDevice} />
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-sm text-destructive p-6 text-center">
            {error.message}
          </div>
        ) : (
          <EmailPreviewFrame html={html} device={device} className="flex-1" />
        )}
      </Dialog.Content>
    </Dialog>
  );
};
