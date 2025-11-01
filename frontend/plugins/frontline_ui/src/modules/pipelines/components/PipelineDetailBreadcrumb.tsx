import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
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
