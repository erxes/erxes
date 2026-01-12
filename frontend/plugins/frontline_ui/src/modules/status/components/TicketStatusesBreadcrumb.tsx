import { Link } from 'react-router-dom';
import { Button } from 'erxes-ui';
import { useParams } from 'react-router-dom';

export const TicketStatusesBreadcrumb = () => {
  const { pipelineId, id } = useParams<{ pipelineId: string; id: string }>();
  return (
    <Link
      to={`/settings/frontline/channels/${id}/pipelines/${pipelineId}/statuses`}
    >
      <Button variant="ghost" className="font-semibold">
        Ticket statuses
      </Button>
    </Link>
  );
};
