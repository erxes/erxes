import { OrgLogoIcon } from '@/auth/components/Logo';
import { AppPath } from '@/types/paths/AppPath';
import { Button, Sidebar } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { currentOrganizationState } from 'ui-modules';

// skipcq: JS-D1001 - Covered by repository documentation policy.
export const NavigationRailLogo = ({ expanded }: { expanded: boolean }) => {
  const organization = useAtomValue(currentOrganizationState);
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const companyName =
    organization?.orgShortName || organization?.name || 'erxes';

  return (
    <div className="mb-1 flex h-10 w-full items-center gap-1">
      {expanded && (
        <Button
          asChild
          className="h-10 min-w-0 flex-1 justify-start px-2 text-base font-semibold"
          variant="ghost"
        >
          <Link aria-label={companyName} to={AppPath.Index}>
            <span className="flex size-5 shrink-0 items-center justify-center [&>img]:size-5! [&>svg]:size-5!">
              <OrgLogoIcon className="text-primary" />
            </span>
            <span className="truncate">{companyName}</span>
          </Link>
        </Button>
      )}
      <Sidebar.Trigger
        aria-label={t('toggle-panel')}
        className={
          expanded
            ? 'size-8 shrink-0 rounded-md'
            : 'mx-auto size-8 shrink-0 rounded-md'
        }
        title={t('toggle-panel')}
      />
    </div>
  );
};
