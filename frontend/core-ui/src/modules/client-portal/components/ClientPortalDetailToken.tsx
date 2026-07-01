import { Button, InfoCard, toast } from 'erxes-ui';
import { IClientPortal } from '../types/clientPortal';
import { IconCopy } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export function ClientPortalDetailToken({
  clientPortal = {},
}: {
  clientPortal?: IClientPortal;
}) {
  const { t } = useTranslation('client-portal');
  const handleCopy = () => {
    navigator.clipboard.writeText(clientPortal?.token ?? '');
    toast({
      title: t('copied-to-clipboard', 'Copied to clipboard'),
    });
  };
  return (
    <InfoCard title={t('client-portal-token', 'Client Portal Token')}>
      <InfoCard.Content>
        <p className="break-all p-3 text-sm bg-muted shadow-xs rounded-md">
          {clientPortal?.token}
        </p>
        <Button variant="outline" onClick={handleCopy}>
          <IconCopy className="w-4 h-4" />
          {t('copy-token', 'Copy Token')}
        </Button>
      </InfoCard.Content>
    </InfoCard>
  );
}
