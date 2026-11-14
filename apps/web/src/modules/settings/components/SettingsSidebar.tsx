import { paths } from '~/lib/paths';
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
import { useLocation, useNavigate } from 'react-router-dom';
import { useCan } from '~/modules/auth/session';
import { usePlan } from '~/modules/saas/usePlan';

interface SettingsPath {
  name: string;
  to: string;
  icon: Icon;
}

/** The settings "Workspace" group. */
const useSettingsWorkspacePaths = (): SettingsPath[] => {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const can = useCan();
  const plan = usePlan().data;

  return [
    { name: t('general', 'General'), to: paths.settings.general, icon: IconSettings },
    { name: t('team-member'), to: paths.settings.teamMembers, icon: IconUsersGroup },
    { name: t('roles', 'Roles'), to: paths.settings.roles, icon: IconShieldHalf },
    { name: t('file-upload', 'File upload'), to: paths.settings.fileUpload, icon: IconCloudUpload },
    { name: t('plugins', 'Plugins'), to: paths.settings.plugins, icon: IconApps },
    ...(plan?.saas
      ? [{ name: t('plan', 'Plan'), to: paths.settings.plan, icon: IconCreditCard }]
      : []),
    ...(can('contacts.delete')
      ? [{ name: t('recycle-bin', 'Recycle bin'), to: paths.settings.recycleBin, icon: IconTrash }]
      : []),
    ...(can('payments.manage')
      ? [{ name: t('payments', 'Payments'), to: paths.settings.payments, icon: IconCash }]
      : []),
    ...(can('webhooks.manage')
      ? [{ name: t('webhooks', 'Webhooks'), to: paths.settings.webhooks, icon: IconWebhook }]
      : []),
    ...(can('audit.view')
      ? [{ name: t('audit-log', 'Audit log'), to: paths.settings.auditLog, icon: IconShieldCheck }]
      : []),
    ...(can('events.view')
      ? [
          {
            name: t('event-delivery', 'Event delivery'),
            to: paths.settings.eventDelivery,
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

/** The last address outside settings: where "Exit settings" goes. */
let returnTo: string = paths.home;

/**
 * Keeps the return address current; `MainLayout` calls it on every page. A history distance
 * would miscount, since nuqs adds entries for query changes without advancing the router's index.
 */
export const useSettingsReturn = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!pathname.startsWith(paths.settings.root)) returnTo = pathname + search;
  }, [pathname, search]);
};

/** Back to where settings were opened from; opened directly, it goes home. */
function SettingsExitButton() {
  const navigate = useNavigate();
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });

  const handleExitSettings = () => void navigate(returnTo);

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
    { name: t('profile', 'Profile'), to: paths.settings.profile, icon: IconUserCircle },
    { name: t('security', 'Password & security'), to: paths.settings.security, icon: IconLock },
    {
      name: t('notifications', 'Notifications'),
      to: paths.settings.notifications,
      icon: IconBellCog,
    },
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
            <NavigationMenuLinkItem key={item.to} to={item.to} name={item.name} icon={item.icon} />
          ))}
        </SettingsNavigationGroup>
        <SettingsNavigationGroup name={t('workspace')}>
          {workspace.map((item) => (
            <NavigationMenuLinkItem key={item.to} to={item.to} name={item.name} icon={item.icon} />
          ))}
        </SettingsNavigationGroup>
      </Sidebar.Content>
    </>
  );
}
