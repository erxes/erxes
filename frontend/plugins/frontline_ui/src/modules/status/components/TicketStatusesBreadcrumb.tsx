import { Button } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const TicketStatusesBreadcrumb = () => {
  const { t } = useTranslation('frontline');
  const { pipelineId, id } = useParams<{ pipelineId: string; id: string }>();
  return (
    <Link
      to={`/settings/frontline/channels/${id}/pipelines/${pipelineId}/statuses`}
    >
      <Button variant="ghost" className="font-semibold">
        {t('ticket-statuses')}
      </Button>
    </Link>
  );
};
