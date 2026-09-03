import { useLazyQuery } from '@apollo/client';
import { IconEye } from '@tabler/icons-react';
import { Button, Dialog, EmailPreviewFrame } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BROADCAST_RENDER_PREVIEW } from '../graphql/queries';

export const BroadcastPreviewEmailDialog = () => {
  const { getValues } = useFormContext();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const [fetchPreview, { data, loading }] = useLazyQuery(
    BROADCAST_RENDER_PREVIEW,
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      return;
    }

    const { email } = getValues();

    fetchPreview({
      variables: {
        contentJson: email?.contentJson,
        previewText: email?.previewText,
      },
    });
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <Button type="button">
          <IconEye />
          {t('previewEmail')}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="sm:max-w-3xl h-[80vh] flex flex-col">
        <Dialog.Header>
          <Dialog.Title>{t('previewEmail')}</Dialog.Title>
        </Dialog.Header>
        {loading ? null : (
          <EmailPreviewFrame
            html={data?.engageMessageRenderPreview || ''}
            className="flex-1"
          />
        )}
      </Dialog.Content>
    </Dialog>
  );
};
