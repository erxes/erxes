import { useLazyQuery } from '@apollo/client';
import { IconClipboard } from '@tabler/icons-react';
import { Button, useToast } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BROADCAST_RENDER_PREVIEW } from '../graphql/queries';

export const BroadcastCopyHtmlButton = () => {
  const { getValues } = useFormContext();
  const { toast } = useToast();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const [fetchHtml, { loading }] = useLazyQuery(BROADCAST_RENDER_PREVIEW);

  const handleClick = async () => {
    const { email } = getValues();

    const { data } = await fetchHtml({
      variables: {
        contentJson: email?.contentJson,
        previewText: email?.previewText,
      },
    });

    const html = data?.engageMessageRenderPreview;

    if (!html) {
      return;
    }

    await navigator.clipboard.writeText(html);

    toast({ variant: 'default', title: t('copyHtmlSuccess') });
  };

  return (
    <Button type="button" disabled={loading} onClick={handleClick}>
      <IconClipboard />
      {t('copyHtml')}
    </Button>
  );
};
