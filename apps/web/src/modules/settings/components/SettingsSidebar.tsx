import { paths, propertyPaths } from '~/lib/paths';
import {
  IconSourceCode,
  IconBellCog,
  IconCash,
  IconChevronLeft,
  IconCloudUpload,
  IconApps,
  IconArrowUpRight,
  IconHierarchy2,
  IconLifebuoy,
  IconLock,
  IconMail,
  IconMoodSmile,
  IconPlugConnected,
  IconRobot,
  IconSettings,
  IconShieldCheck,
  IconShieldHalf,
  IconSparkles,
  IconCode,
  IconKey,
  IconPlug,
  IconTrash,
  IconCreditCard,
  IconCurrencyDollar,
  IconUserCircle,
  IconUsersGroup,
  IconWebhook,
  IconWorldWww,
  type Icon,
} from '@tabler/icons-react';
import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { Children, type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCan } from '~/modules/auth/session';
import { pluginPropertyTypes } from '~/modules/plugins/pluginProperties';
import { pluginName, usePluginText } from '~/modules/plugins/pluginText';
import { usePlugins } from '~/modules/plugins/usePlugins';
import { usePlan } from '~/modules/saas/usePlan';
import { useMayOpenIntegrations } from '../integrations/catalog';

interface SettingsPath {
  name: string;
  to: string;
  icon: Icon;
}

/** The settings "Workspace" group. */
const useSettingsWorkspacePaths = (): SettingsPath[] => {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const can = useCan();
  const mayOpenIntegrations = useMayOpenIntegrations();
  const plan = usePlan().data;

  return [
    { name: t('general', 'General'), to: paths.settings.general, icon: IconSettings },
    { name: t('team-member'), to: paths.settings.teamMembers, icon: IconUsersGroup },
    { name: t('roles', 'Roles'), to: paths.settings.roles, icon: IconShieldHalf },
    { name: t('structure', 'Structure'), to: paths.settings.structure, icon: IconHierarchy2 },
    { name: t('file-upload', 'File upload'), to: paths.settings.fileUpload, icon: IconCloudUpload },
    {
      name: t('exchange-rates', 'Exchange Rates'),
      to: paths.settings.exchangeRates,
      icon: IconCurrencyDollar,
    },
    ...(plan?.pluginsManaged
      ? []
      : [{ name: t('plugins', 'Plugins'), to: paths.settings.plugins, icon: IconApps }]),
    ...(plan?.saas
      ? [{ name: t('plan', 'Plan'), to: paths.settings.plan, icon: IconCreditCard }]
      : []),
    ...(plan?.saas && can('support.manage')
      ? [
          {
            name: t('support-access', 'Support access'),
            to: paths.settings.supportAccess,
            icon: IconLifebuoy,
          },
        ]
      : []),
    ...(can('contacts.delete')
      ? [{ name: t('recycle-bin', 'Recycle bin'), to: paths.settings.recycleBin, icon: IconTrash }]
      : []),
    ...(can('payments.manage')
      ? [{ name: t('payments', 'Payments'), to: paths.settings.payments, icon: IconCash }]
      : []),
    ...(can('integrations.manage')
      ? [
          {
            name: t('email-sending', 'Organization email'),
            to: paths.settings.email,
            icon: IconMail,
          },
        ]
      : []),
    ...(mayOpenIntegrations
      ? [
          {
            name: t('integrations', 'Integrations'),
            to: paths.settings.integrations,
            icon: IconPlugConnected,
          },
        ]
      : []),
    ...(can('audit.view')
      ? [{ name: t('audit-log', 'Audit log'), to: paths.settings.auditLog, icon: IconShieldCheck }]
      : []),
  ];
};

/**
 * The settings "Developer" group: the API reference (core's and the plugins'), keys, the portals
 * customers sign in to (their apps, sign-in and portal keys), then what sends events out.
 */
const useSettingsDeveloperPaths = (): SettingsPath[] => {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const can = useCan();

  return [
    {
      name: t('api-reference', 'API reference'),
      to: paths.settings.apiReference,
      icon: IconSourceCode,
    },
    { name: t('api-keys', 'API keys'), to: paths.settings.apiKeys, icon: IconKey },
    { name: t('mcp', 'MCP server'), to: paths.settings.mcp, icon: IconPlug },
    ...(can('contacts.view')
      ? [{ name: t('portals', 'Portals'), to: paths.settings.portals, icon: IconWorldWww }]
      : []),
    ...(can('webhooks.manage')
      ? [{ name: t('webhooks', 'Webhooks'), to: paths.settings.webhooks, icon: IconWebhook }]
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
  // toArray drops empty nodes, which Children.count counts: a plugin without settings
  // pages or properties passes `[[], undefined]` and gets no group.
  if (Children.toArray(children).length === 0) return null;

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

const useSettingsAssistantPaths = (): SettingsPath[] => {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const can = useCan();

  return [
    ...(can('assistant.chat')
      ? [
          {
            name: t('assistant-appearance', 'Appearance'),
            to: paths.settings.assistantAppearance,
            icon: IconMoodSmile,
          },
          { name: t('agents', 'Agents'), to: paths.settings.agents, icon: IconRobot },
        ]
      : []),
    ...(can('assistant.manage')
      ? [
          {
            name: t('assistant-model', 'Default model'),
            to: paths.settings.assistantModel,
            icon: IconSparkles,
          },
          {
            name: t('assistant-code-mode', 'Code mode'),
            to: paths.settings.assistantCodeMode,
            icon: IconCode,
          },
        ]
      : []),
  ];
};

/**
 * One link per plugin the member may use that has settings: to its first settings page, which
 * the plugin draws in its own layout, else to the properties of its first record type.
 */
function PluginSettingsLinks() {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const { plugins } = usePlugins();
  const text = usePluginText();
  const propertyTypes = pluginPropertyTypes(plugins);

  const links = plugins.flatMap(({ remote, config }) => {
    const properties = propertyTypes.find((entry) => entry.plugin === config.name);
    const to = config.settings[0]?.path ?? (properties && propertyPaths(properties.type).list);

    return to ? [{ remote, to, name: pluginName(text, config.name), icon: config.icon }] : [];
  });

  return (
    <SettingsNavigationGroup name={t('plugin-settings', 'Plugin settings')}>
      {links.map((link) => (
        <NavigationMenuLinkItem
          key={link.remote}
          to={link.to}
          name={link.name}
          icon={link.icon ?? IconApps}
        >
          {!link.to.startsWith(paths.settings.root) && (
            <IconArrowUpRight className="text-muted-foreground ml-auto" />
          )}
        </NavigationMenuLinkItem>
      ))}
    </SettingsNavigationGroup>
  );
}

/** Exit, the member's own account first, then the workspace settings, the assistant's, then links to the plugins'. */
export function SettingsSidebar() {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const workspace = useSettingsWorkspacePaths();
  const developer = useSettingsDeveloperPaths();
  const account = useSettingsAccountPaths();
  const assistant = useSettingsAssistantPaths();

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
        <SettingsNavigationGroup name={t('developer', 'Developer')}>
          {developer.map((item) => (
            <NavigationMenuLinkItem key={item.to} to={item.to} name={item.name} icon={item.icon} />
          ))}
        </SettingsNavigationGroup>
        <SettingsNavigationGroup name={t('assistant', 'Assistant')}>
          {assistant.map((item) => (
            <NavigationMenuLinkItem key={item.to} to={item.to} name={item.name} icon={item.icon} />
          ))}
        </SettingsNavigationGroup>
        <PluginSettingsLinks />
      </Sidebar.Content>
    </>
  );
}
