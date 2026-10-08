import { Button, Sidebar, cn } from 'erxes-ui';

import { AppPath } from '@/types/paths/AppPath';
import { Link } from 'react-router-dom';
import { OrgLogoIcon } from '@/auth/components/Logo';
import { currentOrganizationState } from 'ui-modules';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';

export const NavigationRailLogo = ({ expanded }: { expanded: boolean }) => {
  const organization = useAtomValue(currentOrganizationState);
  const { isMobile } = Sidebar.useSidebar();
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const companyName =
    organization?.orgShortName || organization?.name || 'erxes';

  return (
    <div className="mb-1 flex h-10 w-full items-center gap-1">
      {(expanded || isMobile) && (
        <Button
          asChild
          className={cn(
            'shrink-0 font-semibold',
            expanded
              ? 'h-10 min-w-0 flex-1 justify-start px-2 text-base'
              : 'mx-auto size-8 justify-center px-0',
          )}
          variant="ghost"
        >
          <Link aria-label={companyName} to={AppPath.Index}>
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background shadow-xs [&>img]:size-5! [&>svg]:size-5!">
              <OrgLogoIcon className="text-primary" />
            </span>
            {expanded && <span className="truncate">{companyName}</span>}
          </Link>
        </Button>
      )}
      {!isMobile && (
        <Sidebar.Trigger
          aria-label={t('toggle-panel')}
          className={
            expanded
              ? 'size-8 shrink-0 rounded-md'
              : 'mx-auto size-8 shrink-0 rounded-md'
          }
          title={t('toggle-panel')}
        />
      )}
    </div>
  );
};
