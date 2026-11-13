import {
  IconAddressBook,
  IconApps,
  IconBolt,
  IconChartPie,
  IconPackage,
  IconSettings,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';
import { useCan } from '~/modules/auth/session';
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
  { id: 'reports', label: 'Reports', icon: IconChartPie, path: 'reports', kind: 'core' },
];

const label = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

/** Core apps and the plugins the member can use (settings has its own button). */
export const useNavApps = (): NavApp[] => {
  const { plugins } = usePlugins();
  const can = useCan();

  return [
    ...CORE_APPS.filter((app) =>
      app.id === 'automations'
        ? can('automations.view')
        : app.id === 'reports'
          ? can('contacts.view')
          : true,
    ),
    ...plugins.map(({ remote, config }): NavApp => ({
      id: `plugin:${remote}`,
      label: label(config.name),
      icon: config.icon ?? IconApps,
      path: config.path.replace(/^\/+|\/+$/g, ''),
      kind: 'plugin',
    })),
  ];
};

export const appOfPath = (apps: NavApp[], pathname: string) =>
  apps.find((app) => pathname === `/${app.path}` || pathname.startsWith(`/${app.path}/`));
