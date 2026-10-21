import { FACEBOOK_AUTH_SUCCESS_MESSAGE } from '@/integrations/constants/authMessages';
import { useIntegrationReauth } from '@/integrations/hooks/useIntegrationReauth';
import { IIntegration } from '@/integrations/types/Integration';
import { IconTool } from '@tabler/icons-react';
import { Spinner, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useFbIntegrationsRepair } from '../hooks/useFbIntegrationsRepair';
import { parseRepairResult } from '@/integrations/utils/repairResult';

type Props = {
  integration: IIntegration;
};

export const FacebookIntegrationRepair = ({ integration }: Props) => {
  const { t } = useTranslation('frontline');
  const { _id, healthStatus, kind } = integration;
  const { repairIntegrations, loading: repairLoading } =
    useFbIntegrationsRepair();

  const isUnhealthy =
    !!healthStatus?.status && healthStatus.status !== 'healthy';

  const runRepair = () => {
    repairIntegrations({
      variables: { _id, kind },
      refetchQueries: ['Integrations', 'ChannelIntegrationsPeek'],
      onCompleted: (data) => {
        const result = parseRepairResult(data?.integrationsRepair);

        if (result.failed) {
          toast({
            title: result.message || t('repair-failed'),
            variant: 'destructive',
          });
          return;
        }

        toast({ title: t('repaired-successfully') });
      },
      onError: (error) => {
        toast({ title: error.message, variant: 'destructive' });
      },
    });
  };

  const { reauth, loading: authLoading } = useIntegrationReauth(
    `/pl:frontline/facebook/fblogin?kind=${kind}`,
    FACEBOOK_AUTH_SUCCESS_MESSAGE,
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
