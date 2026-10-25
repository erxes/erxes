import { FrontlinePaths } from '@/types/FrontlinePaths';
import { IconUserCircle } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const PersonalChannelBreadcrumb = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });

  return (
    <Link
      to={`/${FrontlinePaths.Frontline}/settings${FrontlinePaths.PersonalChannel}`}
    >
      <Button variant="ghost">
        <IconUserCircle />
        {t('personal-channel', 'Personal channel')}
      </Button>
    </Link>
  );
};
