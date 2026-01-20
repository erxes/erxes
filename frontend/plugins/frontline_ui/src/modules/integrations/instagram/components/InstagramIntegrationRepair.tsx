import { IIntegrationDetail } from '@/integrations/types/Integration';
import { IconTool } from '@tabler/icons-react';
import { Button, Spinner, toast } from 'erxes-ui';
import { Cell } from '@tanstack/table-core';
import { useIgIntegrationsRepair } from '../hooks/useIgIntegrationRepair';
import { useParams } from 'react-router-dom';

type Props = {
  cell: Cell<IIntegrationDetail, unknown>;
};

export const InstagramIntegrationRepair = ({ cell }: Props) => {
  const { repairIntegrations, loading } = useIgIntegrationsRepair();
  const { _id } = cell.row.original;
  const { integrationType } = useParams();

  const handleRepair = () => {
    repairIntegrations({
      variables: { _id, kind: integrationType },
      onCompleted: () => {
        toast({ title: 'Repaired successfully' });
      },
    });
  };
  return (
    <Button
      variant={'outline'}
      size="icon"
      disabled={loading}
      onClick={handleRepair}
    >
      {loading ? <Spinner size="sm" /> : <IconTool />}
    </Button>
  );
};
