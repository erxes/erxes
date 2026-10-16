import { AppLogo } from '@/navigation/components/AppLogo';
import { SidebarFooter } from '@/navigation/components/SidebarFooter';
import { SidebarLink } from '@/navigation/components/SidebarLink';
import { WORKSPACE_SETTINGS_PATH } from '@/settings/constants/workspaceSettingsPath';
import { useAppPlaces } from '@/navigation/hooks/useAppPlaces';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { AppPath } from '@/types/paths/AppPath';
import { HomePath } from '@/types/paths/HomePath';
import { useUnreadNotificationCount } from '@/notification/hooks/useUnreadNotificationCount';
import {
  IconBuildingCommunity,
  IconClock,
  IconHome,
  IconInbox,
  IconStar,
} from '@tabler/icons-react';
import { ScrollArea, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const INBOX_PATH = `/${AppPath.MyInbox}`;

const HOME_LINKS = [
  { labelKey: 'for-you', to: `/${AppPath.Home}`, icon: IconHome },
  { labelKey: 'inbox', to: INBOX_PATH, icon: IconInbox },
  {
    labelKey: 'recent',
    to: `/${AppPath.Home}${HomePath.Recent}`,
    icon: IconClock,
  },
  {
    labelKey: 'starred',
    to: `/${AppPath.Home}${HomePath.Starred}`,
    icon: IconStar,
  },
];

const AppGroup = ({
  label,
  apps,
}: {
  label: string;
  apps: INavigationActivity[];
}) => {
  const { placeOf } = useAppPlaces();

  if (apps.length === 0) return null;

  return (
    <Sidebar.Group className="px-2 py-1">
      <Sidebar.GroupLabel className="font-mono uppercase">
        {label}
      </Sidebar.GroupLabel>
      <Sidebar.Menu>
        {apps.map((app) => (
          <SidebarLink
            key={app.id}
            to={placeOf(app).to}
            icon={<AppLogo activity={app} size={18} />}
          >
            {app.label}
          </SidebarLink>
        ))}
      </Sidebar.Menu>
    </Sidebar.Group>
  );
};

/** Workspace-wide navigation: your pages first, then every app. */
export const HomeSidebar = () => {
  const { t } = useTranslation('common', { keyPrefix: 'shell' });
  const { pathname } = useLocation();
  const activities = useNavigationActivities();
  const { unreadNotificationsCount } = useUnreadNotificationCount();
  const isActive = (to: string) =>
    to === INBOX_PATH
      ? pathname.startsWith(to)
      : pathname.replace(/\/$/, '') === to;

  return (
    <>
      <ScrollArea className="min-h-0 flex-1">
        <Sidebar.Group className="px-2 py-1">
          <Sidebar.Menu>
            {HOME_LINKS.map(({ labelKey, to, icon: Icon }) => (
              <SidebarLink
                key={to}
                to={to}
                icon={<Icon />}
                isActive={isActive(to)}
              >
                {t(labelKey)}
                {to === INBOX_PATH && unreadNotificationsCount > 0 && (
                  <span className="ml-auto font-mono text-xs tabular-nums text-primary">
                    {unreadNotificationsCount}
                  </span>
                )}
              </SidebarLink>
            ))}
          </Sidebar.Menu>
        </Sidebar.Group>
        <AppGroup
          label={t('plugins')}
          apps={activities.filter((activity) => activity.kind === 'plugin')}
        />
        <AppGroup
          label={t('shared')}
          apps={activities.filter((activity) => activity.kind === 'core')}
        />
      </ScrollArea>
      <SidebarFooter>
        <SidebarLink
          to={WORKSPACE_SETTINGS_PATH}
          icon={<IconBuildingCommunity />}
        >
          {t('workspace-settings')}
        </SidebarLink>
      </SidebarFooter>
    </>
  );
};
