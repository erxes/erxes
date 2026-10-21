import { INSTAGRAM_AUTH_SUCCESS_MESSAGE } from '@/integrations/constants/authMessages';
import { useIntegrationReauth } from '@/integrations/hooks/useIntegrationReauth';
import { IIntegration } from '@/integrations/types/Integration';
import { IconTool } from '@tabler/icons-react';
import { Spinner, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useIgIntegrationsRepair } from '../hooks/useIgIntegrationsRepair';

type Props = {
  integration: IIntegration;
};

export const InstagramIntegrationRepair = ({ integration }: Props) => {
  const { t } = useTranslation('frontline');
  const { _id, healthStatus } = integration;
  const { repairIntegration, loading: repairLoading } =
    useIgIntegrationsRepair();

  const isUnhealthy =
    !!healthStatus?.status && healthStatus.status !== 'healthy';

  const runRepair = () => {
    repairIntegration({
      variables: { _id },
      refetchQueries: ['Integrations', 'ChannelIntegrationsPeek'],
      onCompleted: () => {
        toast({ title: t('repaired-successfully') });
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
      {t('repair')}
    </div>
  );
};
