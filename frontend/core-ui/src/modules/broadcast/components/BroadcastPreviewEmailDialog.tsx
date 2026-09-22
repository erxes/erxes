import { useLazyQuery } from '@apollo/client';
import { IconEye } from '@tabler/icons-react';
import {
  Avatar,
  Button,
  Dialog,
  EmailPreviewFrame,
  Spinner,
  Tooltip,
} from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { EMAIL_CONTENT_PREVIEW } from '@/emailTemplates/graphql/queries';
import { useBroadcastEmailReadiness } from '../hooks/useBroadcastEmailReadiness';

export const BroadcastPreviewEmailDialog = () => {
  const { getValues } = useFormContext();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const { from, blockers, ready } = useBroadcastEmailReadiness();
  const [fetchPreview, { data, loading, error }] = useLazyQuery(
    EMAIL_CONTENT_PREVIEW,
  );

  const { email } = getValues();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      return;
    }

    fetchPreview({
      variables: {
        contentJson: email?.contentJson,
        previewText: email?.previewText,
      },
    });
  };

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
          {blockers.join(' ')}
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
            <Avatar.Fallback>
              {(email?.sender || from || '?').charAt(0).toUpperCase()}
            </Avatar.Fallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">
              {email?.subject || t('previewNoSubject')}
            </div>
            <div className="truncate text-sm text-muted-foreground">
              {email?.sender ? `${email.sender} <${from}>` : from}
            </div>
            {email?.previewText && (
              <div className="truncate text-sm text-muted-foreground">
                {email.previewText}
              </div>
            )}
          </div>
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
          <EmailPreviewFrame
            html={data?.emailContentPreview || ''}
            className="flex-1"
          />
        )}
      </Dialog.Content>
    </Dialog>
  );
};
