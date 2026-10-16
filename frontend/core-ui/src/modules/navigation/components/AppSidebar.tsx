import { AppLogo } from '@/navigation/components/AppLogo';
import { NavigationPluginPanelContent } from '@/navigation/components/NavigationPlugins';
import { SidebarFooter } from '@/navigation/components/SidebarFooter';
import { SidebarLink } from '@/navigation/components/SidebarLink';
import { useStarredPages } from '@/navigation/hooks/useStarredPages';
import { useAppPlaces } from '@/navigation/hooks/useAppPlaces';
import {
  useAppSettings,
  useCurrentApp,
} from '@/navigation/hooks/useCurrentApp';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { SettingsSidebar } from '@/settings/components/SettingsSidebar';
import { WORKSPACE_SETTINGS_PATH } from '@/settings/constants/workspaceSettingsPath';
import { AppPath } from '@/types/paths/AppPath';
import {
  IconBuildingCommunity,
  IconChevronLeft,
  IconSettings,
  IconStar,
} from '@tabler/icons-react';
import { ScrollArea, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const CoreAppMenu = ({ app }: { app: INavigationActivity }) => {
  const { pathname } = useLocation();
  const items = app.modules.flatMap((module) =>
    module.submenus?.length ? module.submenus : [module],
  );

  return (
    <Sidebar.Group className="px-2 py-1">
      <Sidebar.Menu>
        {items.map((item) => (
          <SidebarLink
            key={item.path}
            to={`/${item.path}`}
            icon={item.icon && <item.icon />}
            isActive={pathname.startsWith(`/${item.path}`)}
          >
            {item.name}
          </SidebarLink>
        ))}
      </Sidebar.Menu>
    </Sidebar.Group>
  );
};

const AppSettingsMenu = ({ app }: { app: INavigationActivity }) => {
  const { t } = useTranslation('common', { keyPrefix: 'shell' });
  const { getSettings } = useAppSettings();
  const { placeOf } = useAppPlaces();

  return (
    <>
      <Sidebar.Group className="px-2 pt-2 pb-0">
        <Sidebar.Menu>
          <SidebarLink to={placeOf(app).to} icon={<IconChevronLeft />}>
            {t('back-to', { name: app.label })}
          </SidebarLink>
        </Sidebar.Menu>
      </Sidebar.Group>
      {getSettings(app.id).navigations.map(({ name, Navigation }) => (
        <Navigation key={name} />
      ))}
    </>
  );
};

/** The user's starred pages inside this app, one click away. */
const AppStarred = ({ app }: { app: INavigationActivity }) => {
  const { t } = useTranslation('common', { keyPrefix: 'shell' });
  const { pathname, search } = useLocation();
  const starred = useStarredPages().filter((page) => page.app?.id === app.id);

  if (starred.length === 0) return null;

  return (
    <Sidebar.Group className="px-2 py-1">
      <Sidebar.GroupLabel className="font-mono uppercase">
        {t('starred')}
      </Sidebar.GroupLabel>
      <Sidebar.Menu>
        {starred.map((page) => (
          <SidebarLink
            key={page.to}
            to={page.to}
            icon={page.icon ? <page.icon /> : <IconStar />}
            isActive={`${pathname}${search}` === page.to}
          >
            {page.title}
          </SidebarLink>
        ))}
      </Sidebar.Menu>
    </Sidebar.Group>
  );
};

const MobileAppHeader = ({ app }: { app: INavigationActivity }) => {
  const { isMobile } = Sidebar.useSidebar();

  if (!isMobile) return null;

  return (
    <div className="flex h-12 shrink-0 items-center gap-2.5 border-b px-4 text-[15px] font-semibold">
      <AppLogo activity={app} size={26} />
      {app.label}
    </div>
  );
};

/** The current app's own pages, or its settings when inside /settings. */
export const AppSidebar = () => {
  const { t } = useTranslation('common', { keyPrefix: 'shell' });
  const { pathname } = useLocation();
  const app = useCurrentApp();
  const { getSettings, appPluginNames } = useAppSettings();
  const isSettings = pathname.startsWith(`/${AppPath.Settings}`);
  const settings = app ? getSettings(app.id) : null;

  if (isSettings && !(app && settings?.navigations.length)) {
    return (
      <ScrollArea className="min-h-0 flex-1">
        <SettingsSidebar excludePlugins={appPluginNames} />
      </ScrollArea>
    );
  }

  return (
    <>
      {app && <MobileAppHeader app={app} />}
      <ScrollArea
        className="min-h-0 flex-1"
        viewportClassName="[&>div]:block! [&>div]:min-w-0"
      >
        {app && isSettings && <AppSettingsMenu app={app} />}
        {app?.kind === 'plugin' && !isSettings && (
          <NavigationPluginPanelContent activityId={app.id} />
        )}
        {app?.kind === 'core' && <CoreAppMenu app={app} />}
        {app && !isSettings && <AppStarred app={app} />}
      </ScrollArea>
      {isSettings && (
        <SidebarFooter>
          <SidebarLink
            to={WORKSPACE_SETTINGS_PATH}
            icon={<IconBuildingCommunity />}
          >
            {t('workspace-settings')}
          </SidebarLink>
        </SidebarFooter>
      )}
      {!isSettings && settings?.path && (
        <SidebarFooter>
          <SidebarLink to={settings.path} icon={<IconSettings />}>
            {t('app-settings', { name: app?.label })}
          </SidebarLink>
        </SidebarFooter>
      )}
    </>
  );
};
