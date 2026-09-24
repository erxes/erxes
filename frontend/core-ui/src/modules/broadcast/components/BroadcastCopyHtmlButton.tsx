import { IconClipboard } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useBroadcastCopyHtml } from '../hooks/useBroadcastCopyHtml';

export const BroadcastCopyHtmlButton = () => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const { copy, loading } = useBroadcastCopyHtml();

  return (
    <Button variant="secondary" type="button" disabled={loading} onClick={copy}>
      <IconClipboard />
      {t('copyHtml')}
    </Button>
  );
};
