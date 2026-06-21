import { INSTAGRAM_AUTH_SUCCESS_MESSAGE } from '@/integrations/constants/authMessages';
import { useIntegrationReauth } from '@/integrations/hooks/useIntegrationReauth';
import { IIntegrationDetail } from '@/integrations/types/Integration';
import { IconTool } from '@tabler/icons-react';
import { CellContext } from '@tanstack/react-table';
import { Spinner, toast } from 'erxes-ui';
import { useIgIntegrationsRepair } from '../hooks/useIgIntegrationsRepair';

type Props = {
  cell: CellContext<IIntegrationDetail, unknown>;
};

export const InstagramIntegrationRepair = ({ cell }: Props) => {
  const { _id, healthStatus } = cell.row.original;
  const { repairIntegration, loading: repairLoading } =
    useIgIntegrationsRepair();

  const isUnhealthy =
    !!healthStatus?.status && healthStatus.status !== 'healthy';

  const runRepair = () => {
    repairIntegration({
      variables: { _id },
      refetchQueries: ['Integrations'],
      onCompleted: () => {
        toast({ title: 'Repaired successfully' });
      },
      onError: (error) => {
        toast({ title: error.message, variant: 'destructive' });
      },
    });
  };

  const { reauth, loading: authLoading } = useIntegrationReauth(
    '/pl:frontline/instagram/iglogin',
    INSTAGRAM_AUTH_SUCCESS_MESSAGE,
    runRepair,
  );

  const handleRepair = () => {

    if (isUnhealthy) {
      reauth();
    } else {
      runRepair();
    }
  };

  const loading = authLoading || repairLoading;

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
