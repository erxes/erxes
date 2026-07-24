import { OrgLogoIcon } from '@/auth/components/Logo';
import { AppPath } from '@/types/paths/AppPath';
import { Button } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { currentOrganizationState } from 'ui-modules';

export const NavigationRailLogo = () => {
  const currentOrganization = useAtomValue(currentOrganizationState);
  const { t } = useTranslation('organization');
  const organizationName =
    currentOrganization?.name || currentOrganization?.orgShortName || 'erxes';

  return (
    <Button
      asChild
      className="mb-1 size-10 rounded-md [&>svg]:size-5!"
      size="icon"
      title={organizationName}
      variant="ghost"
    >
      <Link aria-label={t('home')} to={AppPath.Index}>
        <OrgLogoIcon className="size-5 text-primary" />
      </Link>
    </Button>
  );
};
