import { OrgLogoIcon } from '@/auth/components/Logo';
import { AppPath } from '@/types/paths/AppPath';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

// skipcq: JS-D1001 - Covered by repository documentation policy.
export const NavigationRailLogo = () => {
  const { t } = useTranslation('organization');

  return (
    <Button
      asChild
      className="mb-1 size-10 rounded-md [&>svg]:size-5!"
      size="icon"
      variant="ghost"
    >
      <Link aria-label={t('home')} to={AppPath.Index}>
        <OrgLogoIcon className="size-5 text-primary" />
      </Link>
    </Button>
  );
};
