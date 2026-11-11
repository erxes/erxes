import {
  IconBellCog,
  IconChevronLeft,
  IconCloudUpload,
  IconApps,
  IconHierarchy2,
  IconPlugConnected,
  IconShieldCheck,
  IconShieldHalf,
  IconTag,
  IconUserCircle,
  IconUsersGroup,
  type Icon,
} from '@tabler/icons-react';
import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { Children, type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCan } from '~/modules/auth/session';

interface SettingsPath {
  name: string;
  path: string;
  icon: Icon;
}

/** Old core-ui settings "Workspace" group, limited to what core has. */
export const useSettingsWorkspacePaths = (): SettingsPath[] => {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const can = useCan();

  return [
    { name: t('team-member'), path: 'team-members', icon: IconUsersGroup },
    { name: t('roles', 'Roles'), path: 'roles', icon: IconShieldHalf },
    { name: t('tags'), path: 'tags', icon: IconTag },
    { name: t('properties', 'Properties'), path: 'properties', icon: IconHierarchy2 },
    { name: t('file-upload', 'File upload'), path: 'file-upload', icon: IconCloudUpload },
    { name: t('plugins', 'Plugins'), path: 'plugins', icon: IconApps },
    ...(can('audit.view') ? [{ name: t('audit-log', 'Audit log'), path: 'audit-log', icon: IconShieldCheck }] : []),
    ...(can('events.view') ? [{ name: t('event-delivery', 'Event delivery'), path: 'event-delivery', icon: IconPlugConnected }] : []),
  ];
};

export function SettingsNavigationGroup({ name, children }: Readonly<{ name: string; children: ReactNode }>) {
  if (Children.count(children) === 0) return null;

  return (
    <Sidebar.Group className="px-4 py-1">
      <Sidebar.GroupLabel>{name}</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>{children}</Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
}

/** Router history index (react-router keeps it in `history.state.idx`). */
const historyIndex = () => {
  const state: unknown = window.history.state;

  return state && typeof state === 'object' && 'idx' in state && typeof state.idx === 'number' ? state.idx : 0;
};

/** History index of the first settings page of this visit. */
let settingsEntryIndex = 0;

/** Remembers where settings were entered; `SettingsLayout` calls it once per visit. */
export const useSettingsEntry = () => {
  useEffect(() => {
    settingsEntryIndex = historyIndex();
  }, []);
};

/**
 * Back to where settings were opened from (old core-ui used its page history);
 * opened directly, it goes home.
 */
export function SettingsExitButton() {
  const navigate = useNavigate();
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });

  const handleExitSettings = () => {
    if (settingsEntryIndex > 0) navigate(-(historyIndex() - settingsEntryIndex + 1));
    else navigate('/');
  };

  return (
    <Sidebar.Header className="sticky top-0 z-10 bg-sidebar px-2 pt-0 pb-1 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-4 after:bg-gradient-to-b after:from-sidebar after:to-transparent">
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <Sidebar.MenuButton onClick={handleExitSettings}>
            <IconChevronLeft />
            <span>{t('exit-settings')}</span>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
    </Sidebar.Header>
  );
}

/** Settings that belong to the signed-in member, not the organisation. */
const useSettingsAccountPaths = (): SettingsPath[] => {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });

  return [
    { name: t('profile', 'Profile'), path: 'profile', icon: IconUserCircle },
    { name: t('notifications', 'Notifications'), path: 'notifications', icon: IconBellCog },
  ];
};

/** Old core-ui `SettingsSidebar`: exit, then the workspace settings core has. */
export function SettingsSidebar() {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const workspace = useSettingsWorkspacePaths();
  const account = useSettingsAccountPaths();

  return (
    <>
      <SettingsExitButton />
      <Sidebar.Content className="styled-scroll gap-1">
        <SettingsNavigationGroup name={t('workspace')}>
          {workspace.map((item) => (
            <NavigationMenuLinkItem
              key={item.path}
              pathPrefix="settings"
              path={item.path}
              name={item.name}
              icon={item.icon}
            />
          ))}
        </SettingsNavigationGroup>
        <SettingsNavigationGroup name={t('account', 'Account')}>
          {account.map((item) => (
            <NavigationMenuLinkItem
              key={item.path}
              pathPrefix="settings"
              path={item.path}
              name={item.name}
              icon={item.icon}
            />
          ))}
        </SettingsNavigationGroup>
      </Sidebar.Content>
    </>
  );
}
