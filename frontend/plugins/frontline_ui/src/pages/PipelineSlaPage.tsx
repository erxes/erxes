import { Spinner } from 'erxes-ui';
import { PipelineSlaPolicy } from '@/pipelines/components/sla/PipelineSlaPolicy';
import { useSettingsParams } from '@/settings/contexts/SettingsPanelContext';

export const PipelineSlaPage = () => {
  const { pipelineId } = useSettingsParams();

  if (!pipelineId) {
    return <Spinner containerClassName="py-8" />;
  }

  return <PipelineSlaPolicy pipelineId={pipelineId} />;
};
