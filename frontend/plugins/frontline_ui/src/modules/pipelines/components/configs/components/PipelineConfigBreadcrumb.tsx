import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'erxes-ui';
import { useParams } from 'react-router-dom';

export const PipelineConfigBreadcrumb = () => {
  const { pipelineId, id } = useParams<{ pipelineId: string; id: string }>();
  return (
    <Link
      to={`/settings/frontline/channels/${id}/pipelines/${pipelineId}/configs`}
    >
      <Button variant="ghost" className="font-semibold">
        Configuration
      </Button>
    </Link>
  );
};
