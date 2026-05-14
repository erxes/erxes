import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { Button } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';

export const PipelineDetailBreadcrumb = () => {
  const { pipelineId, id } = useParams<{ pipelineId: string; id: string }>();
  const { pipeline } = useGetPipeline(pipelineId);
  return (
    <Link to={`/settings/frontline/channels/${id}/pipelines/${pipelineId}`}>
      <Button variant="ghost" className="font-semibold">
        {pipeline?.name}
      </Button>
    </Link>
  );
};
