import { PipelineMailSettings } from '@/integrations/mail/components/PipelineMailSettings';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { Spinner } from 'erxes-ui';
import { useParams } from 'react-router-dom';

export const PipelineMailPage = () => {
  const { pipelineId } = useParams<{ pipelineId: string }>();
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
