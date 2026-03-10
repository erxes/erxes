import { Link } from 'react-router-dom';
import { Button } from 'erxes-ui';
import { useParams } from 'react-router-dom';

export const PipelinePermissionsBreadcrumb = () => {
  const { pipelineId, id } = useParams<{ pipelineId: string; id: string }>();
  return (
    <Link
      to={`/settings/frontline/channels/${id}/pipelines/${pipelineId}/permissions`}
    >
      <Button variant="ghost" className="font-semibold">
        Permissions
      </Button>
    </Link>
  );
};
