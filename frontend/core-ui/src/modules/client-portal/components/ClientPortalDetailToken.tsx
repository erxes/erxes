import { Button, InfoCard, toast } from 'erxes-ui';
import { IClientPortal } from '../types/clientPortal';
import { IconCopy } from '@tabler/icons-react';
import { usePermissionCheck } from 'ui-modules';
import { useTranslation } from 'react-i18next';

const maskToken = (token?: string) => {
  if (!token) {
    return '';
  }

  return token.slice(0, 6) + '••••••••••••••••••••';
};

export function ClientPortalDetailToken({
  clientPortal = {},
}: {
  clientPortal?: IClientPortal;
}) {
  const { t } = useTranslation('settings', { keyPrefix: 'client-portals' });
  const { hasActionPermission } = usePermissionCheck();
  const canManageClientPortal = hasActionPermission('clientPortalManage');

  const handleCopy = () => {
    if (!canManageClientPortal) {
      toast({
        variant: 'destructive',
        title: t('only-admins-can-copy-token'),
      });
      return;
    }

    navigator.clipboard.writeText(clientPortal?.token ?? '');
    toast({
      title: t('copied-to-clipboard'),
    });
  };
  return (
    <InfoCard title={t('client-portal-token')}>
      <InfoCard.Content>
        <p className="break-all p-3 text-sm bg-muted shadow-xs rounded-md font-mono">
          {maskToken(clientPortal?.token)}
        </p>
        <Button variant="outline" onClick={handleCopy}>
          <IconCopy className="w-4 h-4" />
          {t('copy-token')}
        </Button>
      </InfoCard.Content>
    </InfoCard>
  );
}
