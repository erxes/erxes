import { IIntegrationDetail } from '@/integrations/types/Integration';
import { IconTool } from '@tabler/icons-react';
import { toast } from 'erxes-ui';
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
      {loading ? (
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-pink-600" />
      ) : (
        <IconTool size={16} />
      )}
      Repair
    </div>
  );
};
