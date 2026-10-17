import { Button, activePluginState, cn } from 'erxes-ui';
import { IconInbox, IconSearch, IconSettings } from '@tabler/icons-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { startTransition, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import { AppPath } from '@/types/paths/AppPath';
import { CoreTabAppSwitcher } from '@/navigation/components/core-tab/CoreTabAppSwitcher';
import { CoreTabFavorites } from '@/navigation/components/core-tab/CoreTabFavorites';
import { CoreTabPluginTabs } from '@/navigation/components/core-tab/CoreTabPluginTabs';
import { CoreTabUserMenu } from '@/navigation/components/core-tab/CoreTabUserMenu';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { NotificationCount } from '@/notification/components/MyInboxNavigationItem';
import { OrgLogoIcon } from '@/auth/components/Logo';
import { currentOrganizationState } from 'ui-modules';
import { findNavigationActivityByPath } from '@/navigation/utils/navigationActivities';
import { globalSearchOpenState } from '@/search/states/globalSearchState';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { usePluginSettingsActivity } from '@/navigation/hooks/usePluginSettingsActivity';
import { useTranslation } from 'react-i18next';

const CoreTabIconLink = ({
  active,
  children,
  label,
  to,
}: Readonly<{
  active: boolean;
  children: React.ReactNode;
  label: string;
  to: string;
}>) => (
  <Button
    asChild
    className={cn(
      'relative size-8 shrink-0',
      active && 'bg-primary/10 text-primary hover:bg-primary/15',
    )}
    size="icon"
    variant="ghost"
  >
    <Link aria-label={label} title={label} to={to}>
      {children}
    </Link>
  </Button>
);

/**
 * The only navigation core draws: a top bar listing plugins plus global
 * actions. Everything below it, sidebar included, belongs to the open app.
 */
export const CoreTab = () => {
  const activities = useNavigationActivities();
  const organization = useAtomValue(currentOrganizationState);
  const [activeActivityId, setActiveActivityId] = useAtom(activePluginState);
  const setSearchOpen = useSetAtom(globalSearchOpenState);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const { t: sidebarT } = useTranslation('common', { keyPrefix: 'sidebar' });
  const isSettings = pathname.includes(`/${AppPath.Settings}`);
  const isInboxActive =
    pathname === `/${AppPath.MyInbox}` ||
    pathname.startsWith(`/${AppPath.MyInbox}/`);
  const pluginSettingsActivity = usePluginSettingsActivity();
  const isOrganizationSettings = isSettings && !pluginSettingsActivity;
  // A plugin's own settings belong to its app tab.
  const routeActivity = isSettings
    ? pluginSettingsActivity
    : findNavigationActivityByPath(activities, pathname);
  const companyName =
    organization?.orgShortName || organization?.name || 'erxes';

  useEffect(() => {
    if (routeActivity && routeActivity.id !== activeActivityId) {
      setActiveActivityId(routeActivity.id);
    }
  }, [activeActivityId, routeActivity, setActiveActivityId]);

  const handleSelectActivity = (activity: INavigationActivity) => {
    setActiveActivityId(activity.id);
    startTransition(() => {
      navigate(`/${activity.defaultPath.replace(/^\/+/, '')}`);
    });
  };

  return (
    <header className="flex h-12 shrink-0 items-center gap-1 border-b bg-sidebar px-2">
      <Button
        asChild
        className="size-8 shrink-0 px-0"
        size="icon"
        variant="ghost"
      >
        <Link aria-label={companyName} title={companyName} to={AppPath.Index}>
          <span className="flex size-7 items-center justify-center rounded-lg border border-border/60 bg-background shadow-xs [&>img]:size-5! [&>svg]:size-5!">
            <OrgLogoIcon className="text-primary" />
          </span>
        </Link>
      </Button>
      <CoreTabAppSwitcher
        activeActivityId={routeActivity?.id || null}
        activities={activities}
        onSelect={handleSelectActivity}
      />
      <CoreTabPluginTabs
        activeActivity={routeActivity}
        activities={activities}
        onSelect={handleSelectActivity}
      />
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          aria-keyshortcuts="Control+M Meta+M"
          aria-label={t('search')}
          className="h-8 gap-2 px-2.5 text-muted-foreground"
          title={t('search')}
          type="button"
          variant="ghost"
          onClick={() => setSearchOpen(true)}
        >
          <IconSearch className="size-4" />
          <span className="hidden text-sm font-normal lg:inline">
            {t('search')}
          </span>
        </Button>
        <CoreTabFavorites />
        <CoreTabIconLink
          active={isInboxActive}
          label={sidebarT('my-inbox')}
          to={`/${AppPath.MyInbox}`}
        >
          <IconInbox className="size-4" />
          <NotificationCount dot />
        </CoreTabIconLink>
        <CoreTabIconLink
          active={isOrganizationSettings}
          label={t('organization-settings')}
          to={`/${AppPath.Settings}`}
        >
          <IconSettings className="size-4" />
        </CoreTabIconLink>
        <CoreTabUserMenu />
      </div>
    </header>
  );
};
