import {
  IconBellCog,
  IconCash,
  IconChevronLeft,
  IconCloudUpload,
  IconApps,
  IconLock,
  IconPlugConnected,
  IconSettings,
  IconShieldCheck,
  IconShieldHalf,
  IconTrash,
  IconCreditCard,
  IconUserCircle,
  IconUsersGroup,
  IconWebhook,
  type Icon,
} from '@tabler/icons-react';
import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { Children, type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCan } from '~/modules/auth/session';
import { usePlan } from '~/modules/saas/usePlan';

interface SettingsPath {
  name: string;
  path: string;
  icon: Icon;
}

/** The settings "Workspace" group. */
const useSettingsWorkspacePaths = (): SettingsPath[] => {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const can = useCan();
  const plan = usePlan().data;

  return [
    { name: t('general', 'General'), path: 'general', icon: IconSettings },
    { name: t('team-member'), path: 'team-members', icon: IconUsersGroup },
    { name: t('roles', 'Roles'), path: 'roles', icon: IconShieldHalf },
    { name: t('file-upload', 'File upload'), path: 'file-upload', icon: IconCloudUpload },
    { name: t('plugins', 'Plugins'), path: 'plugins', icon: IconApps },
    ...(plan?.saas ? [{ name: t('plan', 'Plan'), path: 'plan', icon: IconCreditCard }] : []),
    ...(can('contacts.delete')
      ? [{ name: t('recycle-bin', 'Recycle bin'), path: 'recycle-bin', icon: IconTrash }]
      : []),
    ...(can('payments.manage')
      ? [{ name: t('payments', 'Payments'), path: 'payments', icon: IconCash }]
      : []),
    ...(can('webhooks.manage')
      ? [{ name: t('webhooks', 'Webhooks'), path: 'webhooks', icon: IconWebhook }]
      : []),
    ...(can('audit.view')
      ? [{ name: t('audit-log', 'Audit log'), path: 'audit-log', icon: IconShieldCheck }]
      : []),
    ...(can('events.view')
      ? [
          {
            name: t('event-delivery', 'Event delivery'),
            path: 'event-delivery',
            icon: IconPlugConnected,
          },
        ]
      : []),
  ];
};

function SettingsNavigationGroup({
  name,
  children,
}: Readonly<{ name: string; children: ReactNode }>) {
  if (Children.count(children) === 0) return null;

  return (
    <Sidebar.Group variant="compact">
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

  return state && typeof state === 'object' && 'idx' in state && typeof state.idx === 'number'
    ? state.idx
    : 0;
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
 * Back to where settings were opened from; opened directly, it goes home.
 */
function SettingsExitButton() {
  const navigate = useNavigate();
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });

  const handleExitSettings = () => {
    if (settingsEntryIndex > 0) void navigate(-(historyIndex() - settingsEntryIndex + 1));
    else void navigate('/');
  };

  return (
    <Sidebar.Header variant="sticky">
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
    { name: t('security', 'Password & security'), path: 'security', icon: IconLock },
    { name: t('notifications', 'Notifications'), path: 'notifications', icon: IconBellCog },
  ];
};

/** Exit, the member's own account first, then the workspace settings. */
export function SettingsSidebar() {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const workspace = useSettingsWorkspacePaths();
  const account = useSettingsAccountPaths();

  return (
    <>
      <SettingsExitButton />
      <Sidebar.Content>
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
      </Sidebar.Content>
    </>
  );
}
