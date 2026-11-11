import { IconAddressBook, IconApps, IconSettings } from '@tabler/icons-react';
import type { ComponentType } from 'react';
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

export const CORE_APPS: NavApp[] = [
  { id: 'contacts', label: 'Contacts', icon: IconAddressBook, path: 'contacts', kind: 'core' },
];

const label = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

/** Core apps and the plugins the member can use (settings has its own button). */
export const useNavApps = (): NavApp[] => {
  const { plugins } = usePlugins();

  return [
    ...CORE_APPS,
    ...plugins.map(
      ({ remote, config }): NavApp => ({
        id: `plugin:${remote}`,
        label: label(config.name),
        icon: config.icon ?? IconApps,
        path: config.path.replace(/^\/+|\/+$/g, ''),
        kind: 'plugin',
      }),
    ),
  ];
};

export const appOfPath = (apps: NavApp[], pathname: string) =>
  apps.find((app) => pathname === `/${app.path}` || pathname.startsWith(`/${app.path}/`));
