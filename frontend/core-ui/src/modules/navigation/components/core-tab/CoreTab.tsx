import { Button, Tooltip, activePluginState, cn } from 'erxes-ui';
import { IconInbox, IconSearch } from '@tabler/icons-react';
import { INBOX_TAB_ID, useAppTabs } from '@/navigation/hooks/useAppTabs';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import { AppPath } from '@/types/paths/AppPath';
import { CoreTabAppSwitcher } from '@/navigation/components/core-tab/CoreTabAppSwitcher';
import { CoreTabAppTabs } from '@/navigation/components/core-tab/CoreTabAppTabs';
import { CoreTabTooltip } from '@/navigation/components/core-tab/CoreTabTooltip';
import { CoreTabUserMenu } from '@/navigation/components/core-tab/CoreTabUserMenu';
import { Link } from 'react-router-dom';
import { NotificationCount } from '@/notification/components/MyInboxNavigationItem';
import { OrgLogoIcon } from '@/auth/components/Logo';
import { currentOrganizationState } from 'ui-modules';
import { AssistantButton } from '@/agent/components/AssistantButton';
import { globalSearchOpenState } from '@/search/states/globalSearchState';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const coreTabIconClassName = (active: boolean) =>
  cn(
    'relative size-7 shrink-0',
    active && 'bg-primary/10 text-primary hover:bg-primary/15',
  );

/**
 * The only navigation core draws: a top bar of browser-like app tabs plus
 * global actions. Everything below it, sidebar included, belongs to the
 * open app.
 */
export const CoreTab = () => {
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
  const routeActivityId = routeActivity?.id;
  const isInboxActive = routeActivityId === INBOX_TAB_ID;
  const inboxActivity = activities.find(
    (activity) => activity.id === INBOX_TAB_ID,
  );
  const appActivities = activities.filter(
    (activity) => activity.id !== INBOX_TAB_ID,
  );
  const companyName =
    organization?.orgShortName || organization?.name || 'erxes';

  // Search scopes to the open plugin; the inbox tab is not a plugin.
  useEffect(() => {
    if (
      routeActivityId &&
      routeActivityId !== INBOX_TAB_ID &&
      routeActivityId !== activeActivityId
    ) {
      setActiveActivityId(routeActivityId);
    }
  }, [activeActivityId, routeActivityId, setActiveActivityId]);

  return (
    <Tooltip.Provider delayDuration={300}>
      <header className="flex h-12 shrink-0 items-center gap-1 border-b bg-sidebar px-2">
        <CoreTabTooltip label={companyName}>
          <Button
            asChild
            className="size-7 shrink-0 px-0"
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
        <CoreTabAppSwitcher
          activeActivityId={routeActivityId || null}
          activities={appActivities}
          onSelect={selectActivity}
        />
        <CoreTabAppTabs
          activeTabId={routeActivityId}
          tabs={tabs}
          onClose={closeTab}
          onCloseOthers={closeOtherTabs}
          onCloseToRight={closeTabsToRight}
          onMove={moveTab}
          onSelect={selectTab}
        />
        <div className="flex shrink-0 items-center gap-0.5">
          <CoreTabTooltip label={t('search')} shortcut="⌘M">
            <Button
              aria-keyshortcuts="Control+M Meta+M"
              aria-label={t('search')}
              className="size-7 shrink-0 text-muted-foreground"
              size="icon"
              type="button"
              variant="ghost"
              onClick={() => setSearchOpen(true)}
            >
              <IconSearch className="size-4" />
            </Button>
          </CoreTabTooltip>
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
          <CoreTabUserMenu />
        </div>
      </header>
    </Tooltip.Provider>
  );
};
