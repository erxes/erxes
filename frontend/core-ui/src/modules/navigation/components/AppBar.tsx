import { OrgLogoIcon } from '@/auth/components/Logo';
import { isHomePath } from '@/home/utils/isHomePath';
import { AppLauncher } from '@/navigation/components/AppLauncher';
import { AppLogo } from '@/navigation/components/AppLogo';
import { NavigationUserMenu } from '@/navigation/components/NavigationUserMenu';
import { VisitedPageTabs } from '@/navigation/components/visited-page-tabs/VisitedPageTabs';
import { useCurrentApp } from '@/navigation/hooks/useCurrentApp';
import { useUnreadNotificationCount } from '@/notification/hooks/useUnreadNotificationCount';
import { globalSearchOpenState } from '@/search/states/globalSearchState';
import { WORKSPACE_SETTINGS_PATH } from '@/settings/constants/workspaceSettingsPath';
import { AppPath } from '@/types/paths/AppPath';
import {
  IconChevronDown,
  IconInbox,
  IconLayoutSidebar,
  IconSearch,
  IconSettings,
} from '@tabler/icons-react';
import { Badge, Button, cn, Kbd, Sidebar } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { currentOrganizationState } from 'ui-modules';

/** The workspace logo, always one click from home. */
const HomeLink = () => {
  const { t } = useTranslation('common', { keyPrefix: 'shell' });

  return (
    <Button asChild variant="ghost" size="icon" className="size-9">
      <Link to={`/${AppPath.Home}`} aria-label={t('home')} title={t('home')}>
        <span className="grid size-[26px] shrink-0 place-items-center rounded-[6px] border bg-background [&>img]:size-4! [&>svg]:size-4!">
          <OrgLogoIcon className="text-primary" />
        </span>
      </Link>
    </Button>
  );
};

/** Shows which app you are in and opens the launcher to switch apps. */
const AppSwitcher = () => {
  const { t } = useTranslation('common', { keyPrefix: 'shell' });
  const { pathname } = useLocation();
  const app = useCurrentApp();
  const organization = useAtomValue(currentOrganizationState);
  const isSettings = pathname.startsWith(`/${AppPath.Settings}`);
  const isHome = isHomePath(pathname);
  const name =
    app?.label ?? (isHome ? t('home') : organization?.name ?? 'erxes');

  return (
    <AppLauncher>
      <Button
        variant="ghost"
        className="h-9 min-w-0 gap-2 px-1.5 text-[15px] font-semibold tracking-[-0.01em]"
        aria-label={t('switch-plugin-label', { name })}
        title={t('switch-plugin')}
      >
        {app && <AppLogo activity={app} size={22} />}
        <span className="truncate">{name}</span>
        {isSettings && (
          <span className="hidden truncate font-normal text-muted-foreground sm:inline">
            {t('settings')}
          </span>
        )}
        <IconChevronDown className="size-4! text-muted-foreground" />
      </Button>
    </AppLauncher>
  );
};

const InboxButton = () => {
  const { t } = useTranslation('common', { keyPrefix: 'shell' });
  const { pathname } = useLocation();
  const { unreadNotificationsCount } = useUnreadNotificationCount();
  const active = pathname.startsWith(`/${AppPath.MyInbox}`);

  return (
    <Button
      asChild
      variant="ghost"
      className={cn('gap-1.5 px-2', active && 'bg-accent')}
    >
      <Link
        to={`/${AppPath.MyInbox}`}
        aria-label={t('inbox-unread', { count: unreadNotificationsCount })}
      >
        <IconInbox />
        <span className="hidden lg:inline">{t('inbox')}</span>
        {unreadNotificationsCount > 0 && (
          <Badge className="h-5 min-w-5 justify-center px-1 tabular-nums">
            {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
          </Badge>
        )}
      </Link>
    </Button>
  );
};

/** The top bar of every page: where you are, your open tabs, global tools. */
export const AppBar = ({ withSidebar }: { withSidebar: boolean }) => {
  const { t } = useTranslation('common', { keyPrefix: 'shell' });
  const { toggleSidebar } = Sidebar.useSidebar();
  const setSearchOpen = useSetAtom(globalSearchOpenState);
  const { pathname } = useLocation();

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-12 items-center gap-1 border-b bg-sidebar px-2">
      <div className="flex min-w-0 shrink-0 items-center gap-1 md:max-w-80">
        {withSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label={t('toggle-sidebar')}
            title={t('toggle-sidebar')}
          >
            <IconLayoutSidebar />
          </Button>
        )}
        <HomeLink />
        <span className="text-muted-foreground/50" aria-hidden>
          /
        </span>
        <AppSwitcher />
      </div>
      <span className="mx-1 hidden h-5 w-px shrink-0 bg-border md:block" />
      <VisitedPageTabs />
      <div className="ml-auto flex shrink-0 items-center gap-0.5">
        <Button
          variant="ghost"
          onClick={() => setSearchOpen(true)}
          aria-label={t('search')}
          title={t('search-shortcut')}
          className="gap-2 px-2 text-muted-foreground"
        >
          <IconSearch />
          <Kbd className="hidden lg:inline-flex">⌘K</Kbd>
        </Button>
        <InboxButton />
        <Button
          asChild
          variant="ghost"
          size="icon"
          className={cn(
            pathname.startsWith(`/${AppPath.Settings}`) && 'bg-accent',
          )}
        >
          <Link
            to={WORKSPACE_SETTINGS_PATH}
            aria-label={t('workspace-settings')}
            title={t('workspace-settings')}
          >
            <IconSettings />
          </Link>
        </Button>
        <NavigationUserMenu />
      </div>
    </header>
  );
};
