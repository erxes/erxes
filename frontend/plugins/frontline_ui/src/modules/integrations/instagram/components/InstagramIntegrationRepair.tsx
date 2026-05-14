import { IIntegrationDetail } from '@/integrations/types/Integration';
import { IconTool } from '@tabler/icons-react';
import { Spinner, toast } from 'erxes-ui';
import { CellContext } from '@tanstack/react-table';
import { useIgIntegrationsRepair } from '../hooks/useIgIntegrationsRepair';

type Props = {
  cell: CellContext<IIntegrationDetail, unknown>;
};

export const InstagramIntegrationRepair = ({ cell }: Props) => {
  const { repairIntegration, loading } = useIgIntegrationsRepair();
  const { _id } = cell.row.original;

  const handleRepair = () => {
    repairIntegration({
      variables: { _id },
      onCompleted: () => {
        toast({ title: 'Repaired successfully' });
      },
    });
  };

  return (
    <div onClick={handleRepair} className="flex items-center gap-2 w-full">
      {loading ? <Spinner className="size-4" /> : <IconTool size={16} />}
      Repair
    </div>
  );
};
