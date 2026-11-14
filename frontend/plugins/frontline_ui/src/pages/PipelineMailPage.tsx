import { PipelineMailSettings } from '@/integrations/mail/components/PipelineMailSettings';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { Spinner } from 'erxes-ui';
import { useSettingsParams } from '@/settings/contexts/SettingsPanelContext';

export const PipelineMailPage = () => {
  const { pipelineId } = useSettingsParams();
  const { pipeline, loading } = useGetPipeline(pipelineId);

  if (loading || !pipelineId) {
    return <Spinner containerClassName="py-8" />;
  }

  return (
    <PipelineMailSettings
      pipelineId={pipelineId}
      pipelineName={pipeline?.name ?? ''}
    />
  );
};
