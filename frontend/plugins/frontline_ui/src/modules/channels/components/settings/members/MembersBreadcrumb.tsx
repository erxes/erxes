import { Link, useParams } from 'react-router-dom';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const MembersBreadcrumb = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { id } = useParams<{ id: string }>();
  return (
    <Link to={`/frontline/settings/channels/${id}/members`}>
      <Button variant="ghost">{t('members-title', 'Members')}</Button>
    </Link>
  );
};
