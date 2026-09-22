import { useLazyQuery } from '@apollo/client';
import { IconClipboard } from '@tabler/icons-react';
import { Button, useToast } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { EMAIL_CONTENT_PREVIEW } from '@/emailTemplates/graphql/queries';

export const BroadcastCopyHtmlButton = () => {
  const { getValues } = useFormContext();
  const { toast } = useToast();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const [fetchHtml, { loading }] = useLazyQuery(EMAIL_CONTENT_PREVIEW);

  const handleClick = async () => {
    const { email } = getValues();

    const { data, error } = await fetchHtml({
      variables: {
        contentJson: email?.contentJson,
        previewText: email?.previewText,
      },
    });

    if (error) {
      toast({ variant: 'destructive', title: error.message });
      return;
    }

    const html = data?.emailContentPreview;

    if (!html) {
      return;
    }

    await navigator.clipboard.writeText(html);

    toast({ variant: 'default', title: t('copyHtmlSuccess') });
  };

  return (
    <Button
      variant="secondary"
      type="button"
      disabled={loading}
      onClick={handleClick}
    >
      <IconClipboard />
      {t('copyHtml')}
    </Button>
  );
};
