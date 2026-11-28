import {
  IconAddressBook,
  IconApps,
  IconBolt,
  IconChartPie,
  IconPackage,
  IconSettings,
  IconSpeakerphone,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { useCan } from '~/modules/auth/session';
import { pluginApps } from '~/modules/plugins/pluginConfig';
import { pluginName, usePluginText } from '~/modules/plugins/pluginText';
import { usePlugins } from '~/modules/plugins/usePlugins';

/** Something the top bar can open: a core app or a plugin. */
export interface NavApp {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** First path segment, without slashes. */
  path: string;
  kind: 'core' | 'plugin';
}

export const SETTINGS_APP: NavApp = {
  id: 'settings',
  label: 'Settings',
  icon: IconSettings,
  path: 'settings',
  kind: 'core',
};

const CORE_APPS: NavApp[] = [
  { id: 'contacts', label: 'Contacts', icon: IconAddressBook, path: 'contacts', kind: 'core' },
  { id: 'products', label: 'Products', icon: IconPackage, path: 'products', kind: 'core' },
  { id: 'automations', label: 'Automations', icon: IconBolt, path: 'automations', kind: 'core' },
  {
    id: 'broadcasts',
    label: 'Broadcasts',
    icon: IconSpeakerphone,
    path: 'broadcasts',
    kind: 'core',
  },
  { id: 'reports', label: 'Reports', icon: IconChartPie, path: 'reports', kind: 'core' },
];

/** A core app's name in the member's language; a plugin's comes from its own text (`usePluginText`). */
export const useCoreAppLabel = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (app: NavApp) => t(`apps.${app.id}`, app.label);
};

/** Core apps and the plugins the member can use (settings has its own button). */
export const useNavApps = (): NavApp[] => {
  const { plugins } = usePlugins();
  const can = useCan();
  const coreLabel = useCoreAppLabel();
  const text = usePluginText();

  return [
    ...CORE_APPS.filter((app) => {
      if (app.id === 'automations') return can('automations.view');

      if (app.id === 'broadcasts') return can('broadcasts.view');

      return app.id === 'reports' ? can('contacts.view') : true;
    }).map((app) => ({ ...app, label: coreLabel(app) })),
    ...plugins.flatMap(({ remote, config, extends: extended }) =>
      pluginApps(config).map((app): NavApp => ({
        id: app.name === config.name ? `plugin:${remote}` : `plugin:${remote}/${app.name}`,
        label:
          app.name === config.name
            ? pluginName(text, config.name)
            : text(config.name, capitalized(app.name)),
        icon: app.icon ?? IconApps,
        path: app.path.replace(/^\/+|\/+$/g, ''),
        // A part of core (erxes' enterprise edition) sits with core's apps; usePlugins puts a
        // plugin's own extension right after it.
        kind: extended === 'core' ? 'core' : 'plugin',
      })),
    ),
  ];
};

const capitalized = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

export const appOfPath = (apps: NavApp[], pathname: string) =>
  apps.find((app) => pathname === `/${app.path}` || pathname.startsWith(`/${app.path}/`));
