import { IconSettings } from '@tabler/icons-react';
import { Button, cn, Tooltip, buttonVariants } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { OrgLogoIcon } from '~/modules/auth/components/Logo';
import { NotificationsBell } from '~/modules/notifications/NotificationsBell';
import { useSession } from '~/modules/auth/session';
import { SETTINGS_APP, useNavApps } from './apps';
import { CoreTabAppSwitcher } from './CoreTabAppSwitcher';
import { CoreTabAppTabs } from './CoreTabAppTabs';
import { CoreTabTooltip } from './CoreTabTooltip';
import { CoreTabUserMenu } from './CoreTabUserMenu';
import { useAppTabs } from './useAppTabs';

/**
 * The only navigation core draws: brand, app switcher, open
 * app tabs, settings and the user menu. Each app draws its own sidebar.
 */
export const CoreTab = () => {
  const { organization } = useSession();
  const apps = useNavApps();
  const { routeApp, tabs, open, close, closeOthers, closeToRight, move } = useAppTabs(apps);

  return (
    <Tooltip.Provider delay={300}>
      <header className="flex h-12 shrink-0 items-center gap-1 border-b bg-sidebar px-2">
        <CoreTabTooltip label={organization.name}>
          <Link
            to="/"
            aria-label={organization.name}
            className={cn(buttonVariants({ size: 'icon', variant: 'nav' }), 'relative shrink-0')}
          >
            <span className="flex size-6 items-center justify-center rounded-md border border-border/60 bg-background shadow-xs [&>svg]:size-4!">
              <OrgLogoIcon className="text-primary-text" />
            </span>
          </Link>
        </CoreTabTooltip>
        <CoreTabAppSwitcher apps={apps} activeId={routeApp?.id} onSelect={open} />
        <CoreTabAppTabs
          tabs={tabs}
          activeId={routeApp?.id}
          onSelect={open}
          onClose={close}
          onCloseOthers={closeOthers}
          onCloseToRight={closeToRight}
          onMove={move}
        />
        <div className="flex shrink-0 items-center gap-0.5">
          <NotificationsBell />
          <CoreTabTooltip label={SETTINGS_APP.label}>
            <Button
              type="button"
              size="icon"
              variant="nav"
              aria-label={SETTINGS_APP.label}
              aria-current={routeApp?.id === SETTINGS_APP.id ? 'page' : undefined}
              className="relative shrink-0"
              onClick={() => open(SETTINGS_APP)}
            >
              <IconSettings className="size-4" />
            </Button>
          </CoreTabTooltip>
          <CoreTabUserMenu />
        </div>
      </header>
    </Tooltip.Provider>
  );
};
