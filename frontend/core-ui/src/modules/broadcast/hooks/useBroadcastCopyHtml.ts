import { useToast } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useBroadcastEmailPreview } from './useBroadcastEmailPreview';

/** Puts the rendered email on the clipboard. */
export const useBroadcastCopyHtml = () => {
  const { getValues } = useFormContext();
  const { toast } = useToast();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const { render, loading } = useBroadcastEmailPreview();

  const copy = async () => {
    const { html, error } = await render(getValues('email'));

    if (error) {
      toast({ variant: 'destructive', title: error.message });
      return;
    }

    if (!html) {
      return;
    }

    await navigator.clipboard.writeText(html);

    toast({ variant: 'default', title: t('copyHtmlSuccess') });
  };

  return { copy, loading };
};
