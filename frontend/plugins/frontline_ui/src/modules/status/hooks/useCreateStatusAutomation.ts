import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSettingsParams } from '@/settings/contexts/SettingsPanelContext';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { FRONTLINE_STATUS_AUTOMATION_ADD } from '@/status/graphql/mutation/addStatusAutomation';
import { useGetTicketStatusesByPipeline } from '@/status/hooks/useGetTicketStatus';
import { buildStatusAutomationSeed } from '@/status/utils/statusAutomationSeed';

export const useCreateStatusAutomation = (open: boolean) => {
  const { t } = useTranslation('frontline');
  const navigate = useNavigate();
  const { pipelineId = '' } = useSettingsParams();
  const { pipeline } = useGetPipeline(pipelineId || undefined);
  const { statuses } = useGetTicketStatusesByPipeline({ skip: !open });
  const [statusIds, setStatusIds] = useState<string[]>([]);
  const [addAutomation, { loading }] = useMutation(
    FRONTLINE_STATUS_AUTOMATION_ADD,
    { refetchQueries: ['AutomationsMain'] },
  );

  // Every status is picked each time the dialog opens.
  useEffect(() => {
    if (open) {
      setStatusIds(statuses.map(({ value }) => value));
    }
  }, [open, statuses]);

  const create = async () => {
    const picked = statuses.filter(({ value }) => statusIds.includes(value));

    try {
      const { data } = await addAutomation({
        variables: {
          name: t('status-automation-name', {
            defaultValue: '{{pipeline}} status changes',
            pipeline: pipeline?.name || '',
          }),
          status: 'draft',
          ...buildStatusAutomationSeed({
            pipelineId,
            statuses: picked,
            pickedAll: picked.length === statuses.length,
          }),
        },
      });
      const automationId = data?.automationsAdd?._id;

      if (!automationId) {
        throw new Error(
          t('status-automation-not-created', 'The automation was not created'),
        );
      }

      toast({
        title: t('status-automation-created', 'Automation created'),
        variant: 'success',
      });
      navigate(`/automations/edit/${automationId}`);
    } catch (error) {
      toast({
        title: t('error', 'Error'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    }
  };

  return { pipelineId, statusIds, setStatusIds, create, loading };
};
