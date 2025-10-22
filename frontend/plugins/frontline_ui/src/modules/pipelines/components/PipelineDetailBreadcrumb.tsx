import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
export const PipelineDetailBreadcrumb = () => {
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const { pipeline } = useGetPipeline(pipelineId);
  return (
    <Link to={`/settings/frontline/channels/${pipelineId}`}>
      <Button variant="ghost" className="font-semibold">
        {pipeline?.name}
      </Button>
    </Link>
  );
};
