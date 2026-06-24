import { Link, useParams } from 'react-router-dom';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const MembersBreadcrumb = () => {
  const { t } = useTranslation('frontline');
  const { id } = useParams<{ id: string }>();
  return (
    <Link to={`/settings/frontline/channels/${id}/members`}>
      <Button variant="ghost" className="font-semibold">
        {t('members-title')}
      </Button>
    </Link>
  );
};
