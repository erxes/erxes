import { Button, InfoCard, toast } from 'erxes-ui';
import { IClientPortal } from '../types/clientPortal';
import { IconCopy } from '@tabler/icons-react';

export function ClientPortalDetailToken({
  clientPortal = {},
}: {
  clientPortal?: IClientPortal;
}) {
  const handleCopy = () => {
    navigator.clipboard.writeText(clientPortal?.token ?? '');
    toast({
      title: 'Copied to clipboard',
    });
  };
  return (
    <InfoCard title="Client Portal Token">
      <InfoCard.Content>
        <p className="break-all p-3 text-sm bg-muted shadow-xs rounded-md">
          {clientPortal?.token}
        </p>
        <Button variant="outline" onClick={handleCopy}>
          <IconCopy className="w-4 h-4" />
          Copy Token
        </Button>
      </InfoCard.Content>
    </InfoCard>
  );
}
