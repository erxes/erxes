import { IconSettings } from '@tabler/icons-react';
import { Button, Tooltip } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { useSession } from '~/modules/auth/session';
import { SETTINGS_APP, useNavApps } from './apps';
import { CoreTabAppSwitcher } from './CoreTabAppSwitcher';
import { CoreTabAppTabs } from './CoreTabAppTabs';
import { coreTabIconClassName } from './coreTabClassName';
import { CoreTabTooltip } from './CoreTabTooltip';
import { CoreTabUserMenu } from './CoreTabUserMenu';
import { useAppTabs } from './useAppTabs';

/**
 * The only navigation core draws (as old core-ui): brand, app switcher, open
 * app tabs, settings and the user menu. Each app draws its own sidebar.
 */
export const CoreTab = () => {
  const { organization } = useSession();
  const apps = useNavApps();
  const { routeApp, tabs, open, close, closeOthers, closeToRight, move } = useAppTabs(apps);

  return (
    <Tooltip.Provider delayDuration={300}>
      <header className="flex h-12 shrink-0 items-center gap-1 border-b bg-sidebar px-2">
        <CoreTabTooltip label={organization.name}>
          <Button asChild size="icon" variant="ghost" className={coreTabIconClassName()}>
            <Link to="/" aria-label={organization.name}>
              <span className="flex size-6 items-center justify-center rounded-md border border-border/60 bg-background text-xs font-semibold text-primary shadow-xs">
                {organization.name.charAt(0).toUpperCase()}
              </span>
            </Link>
          </Button>
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
          <CoreTabTooltip label={SETTINGS_APP.label}>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={SETTINGS_APP.label}
              className={coreTabIconClassName(routeApp?.id === SETTINGS_APP.id)}
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
