import { Button, Tooltip, activePluginState, cn } from 'erxes-ui';
import { IconInbox, IconSearch, IconSettings } from '@tabler/icons-react';
import {
  INBOX_TAB_ID,
  SETTINGS_TAB_ID,
  useAppTabs,
} from '@/navigation/hooks/useAppTabs';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import { AppPath } from '@/types/paths/AppPath';
import { CoreTabAppSwitcher } from '@/navigation/components/core-tab/CoreTabAppSwitcher';
import { CoreTabAppTabs } from '@/navigation/components/core-tab/CoreTabAppTabs';
import {
  CoreTabSideContext,
  CoreTabTooltip,
} from '@/navigation/components/core-tab/CoreTabTooltip';
import { CoreTabUserMenu } from '@/navigation/components/core-tab/CoreTabUserMenu';
import { Link } from 'react-router-dom';
import { NotificationCount } from '@/notification/components/MyInboxNavigationItem';
import { OrgLogoIcon } from '@/auth/components/Logo';
import { currentOrganizationState } from 'ui-modules';
import { AssistantButton } from '@/agent/components/AssistantButton';
import { globalSearchOpenState } from '@/search/states/globalSearchState';
import { coreTabIconClassName } from '@/navigation/utils/coreTabClassName';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export type CoreTabOrientation = 'horizontal' | 'vertical';

/**
 * The only navigation core draws: browser-like app tabs plus global actions,
 * as a top bar or (sidebar appearance) a left icon rail. Everything beside it,
 * app sidebars included, belongs to the open app.
 */
export const CoreTab = ({
  orientation = 'horizontal',
}: Readonly<{ orientation?: CoreTabOrientation }>) => {
  const {
    activities,
    closeOtherTabs,
    closeTab,
    closeTabsToRight,
    moveTab,
    routeActivity,
    selectActivity,
    selectTab,
    tabs,
  } = useAppTabs();
  const organization = useAtomValue(currentOrganizationState);
  const [activeActivityId, setActiveActivityId] = useAtom(activePluginState);
  const setSearchOpen = useSetAtom(globalSearchOpenState);
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const { t: sidebarT } = useTranslation('common', { keyPrefix: 'sidebar' });
  const vertical = orientation === 'vertical';
  const routeActivityId = routeActivity?.id;
  const isInboxActive = routeActivityId === INBOX_TAB_ID;
  const isSettingsActive = routeActivityId === SETTINGS_TAB_ID;
  const inboxActivity = activities.find(
    (activity) => activity.id === INBOX_TAB_ID,
  );
  const settingsActivity = activities.find(
    (activity) => activity.id === SETTINGS_TAB_ID,
  );
  // Inbox and organization settings have their own entry points.
  const appActivities = activities.filter(
    (activity) =>
      activity.id !== INBOX_TAB_ID && activity.id !== SETTINGS_TAB_ID,
  );
  const companyName =
    organization?.orgShortName || organization?.name || 'erxes';

  // Search scopes to the open plugin; inbox and settings tabs are not plugins.
  useEffect(() => {
    if (
      routeActivityId &&
      routeActivityId !== INBOX_TAB_ID &&
      routeActivityId !== SETTINGS_TAB_ID &&
      routeActivityId !== activeActivityId
    ) {
      setActiveActivityId(routeActivityId);
    }
  }, [activeActivityId, routeActivityId, setActiveActivityId]);

  const brand = (
    <CoreTabTooltip label={companyName}>
      <Button
        asChild
        className={cn(coreTabIconClassName(), 'px-0')}
        size="icon"
        variant="ghost"
      >
        <Link aria-label={companyName} to={AppPath.Index}>
          <span className="flex size-6 items-center justify-center rounded-md border border-border/60 bg-background shadow-xs [&>img]:size-4! [&>svg]:size-4!">
            <OrgLogoIcon className="text-primary" />
          </span>
        </Link>
      </Button>
    </CoreTabTooltip>
  );

  const switcher = (
    <CoreTabAppSwitcher
      activeActivityId={routeActivityId || null}
      activities={appActivities}
      onSelect={selectActivity}
    />
  );

  const appTabs = (
    <CoreTabAppTabs
      activeTabId={routeActivityId}
      orientation={orientation}
      tabs={tabs}
      onClose={closeTab}
      onCloseOthers={closeOtherTabs}
      onCloseToRight={closeTabsToRight}
      onMove={moveTab}
      onSelect={selectTab}
    />
  );

  const search = (
    <CoreTabTooltip label={t('search')} shortcut="⌘M">
      <Button
        aria-keyshortcuts="Control+M Meta+M"
        aria-label={t('search')}
        className={cn(coreTabIconClassName(), 'text-muted-foreground')}
        size="icon"
        type="button"
        variant="ghost"
        onClick={() => setSearchOpen(true)}
      >
        <IconSearch className="size-4" />
      </Button>
    </CoreTabTooltip>
  );

  const actions = (
    <>
      <CoreTabTooltip label={sidebarT('my-inbox')}>
        <Button
          aria-label={sidebarT('my-inbox')}
          className={coreTabIconClassName(isInboxActive)}
          size="icon"
          type="button"
          variant="ghost"
          onClick={() => inboxActivity && selectActivity(inboxActivity)}
        >
          <IconInbox className="size-4" />
          <NotificationCount dot />
        </Button>
      </CoreTabTooltip>
      <AssistantButton />
      <CoreTabTooltip label={t('app-settings', 'Settings')}>
        <Button
          aria-label={t('app-settings', 'Settings')}
          className={coreTabIconClassName(isSettingsActive)}
          size="icon"
          type="button"
          variant="ghost"
          onClick={() => settingsActivity && selectActivity(settingsActivity)}
        >
          <IconSettings className="size-4" />
        </Button>
      </CoreTabTooltip>
      <CoreTabUserMenu />
    </>
  );

  if (vertical) {
    return (
      <CoreTabSideContext.Provider value="right">
        <Tooltip.Provider delayDuration={300}>
          <nav
            aria-label={t('plugins')}
            className="flex w-12 shrink-0 flex-col items-center gap-2 px-1.5 py-2 dark:text-primary-foreground"
          >
            {brand}
            {switcher}
            {search}
            {appTabs}
            <div className="flex flex-col items-center gap-0.5">{actions}</div>
          </nav>
        </Tooltip.Provider>
      </CoreTabSideContext.Provider>
    );
  }

  return (
    <Tooltip.Provider delayDuration={300}>
      <header className="flex h-12 shrink-0 items-center gap-1 border-b bg-sidebar px-2 group-data-[framed=true]/layout:border-b-0 group-data-[framed=true]/layout:bg-transparent dark:group-data-[framed=true]/layout:text-primary-foreground">
        {brand}
        {switcher}
        {appTabs}
        <div className="flex shrink-0 items-center gap-0.5">
          {search}
          {actions}
        </div>
      </header>
    </Tooltip.Provider>
  );
};
