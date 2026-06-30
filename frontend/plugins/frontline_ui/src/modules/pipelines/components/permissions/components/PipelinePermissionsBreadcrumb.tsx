import { Button } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const PipelinePermissionsBreadcrumb = () => {
  const { t } = useTranslation('frontline');
  const { pipelineId, id } = useParams<{ pipelineId: string; id: string }>();
  return (
    <Link
      to={`/settings/frontline/channels/${id}/pipelines/${pipelineId}/permissions`}
    >
      <Button variant="ghost" className="font-semibold">
        {t('permissions')}
      </Button>
    </Link>
  );
};
