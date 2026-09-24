import { Button, InfoCard, toast } from 'erxes-ui';
import { IClientPortal } from '../types/clientPortal';
import { IconCopy } from '@tabler/icons-react';
import { usePermissionCheck } from 'ui-modules';

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
  const { hasActionPermission } = usePermissionCheck();
  const canManageClientPortal = hasActionPermission('clientPortalManage');

  const handleCopy = () => {
    if (!canManageClientPortal) {
      toast({
        variant: 'destructive',
        title: 'Only admins can copy the client portal token',
      });
      return;
    }

    navigator.clipboard.writeText(clientPortal?.token ?? '');
    toast({
      title: 'Copied to clipboard',
    });
  };
  return (
    <InfoCard title="Client Portal Token">
      <InfoCard.Content>
        <p className="break-all p-3 text-sm bg-muted shadow-xs rounded-md font-mono">
          {maskToken(clientPortal?.token)}
        </p>
        <Button variant="outline" onClick={handleCopy}>
          <IconCopy className="w-4 h-4" />
          Copy Token
        </Button>
      </InfoCard.Content>
    </InfoCard>
  );
}
