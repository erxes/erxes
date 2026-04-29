import { IIntegrationDetail } from '@/integrations/types/Integration';
import { IconTool } from '@tabler/icons-react';
import { Spinner, toast } from 'erxes-ui';
import { CellContext } from '@tanstack/react-table';
import { useFbIntegrationsRepair } from '../hooks/useFbIntegrationsRepair';
import { useParams } from 'react-router-dom';

type Props = {
  cell: CellContext<IIntegrationDetail, unknown>;
};

export const FacebookIntegrationRepair = ({ cell }: Props) => {
  const { repairIntegrations, loading } = useFbIntegrationsRepair();
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
    <div onClick={handleRepair} className="flex items-center gap-2 w-full">
      {loading ? (
        <Spinner className="size-4 text-primary" />
      ) : (
        <IconTool size={16} />
      )}
      Repair
    </div>
  );
};
