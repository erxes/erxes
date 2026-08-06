import { FrontlinePaths } from '@/types/FrontlinePaths';
import { IconUserCircle } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const PersonalChannelBreadcrumb = () => {
  const { t } = useTranslation('frontline');

  return (
    <Link to={`/settings/${FrontlinePaths.Frontline}${FrontlinePaths.PersonalChannel}`}>
      <Button variant="ghost" className="font-semibold">
        <IconUserCircle className="w-4 h-4 text-accent-foreground" />
        {t('personal-channel')}
      </Button>
    </Link>
  );
};
