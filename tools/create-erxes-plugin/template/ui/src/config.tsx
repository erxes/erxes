import { IconPuzzle } from '@tabler/icons-react';
import { Suspense, lazy } from 'react';
import type { IUIConfig } from 'erxes-ui';

const ChangemoduleNavigation = lazy(() =>
  import('./modules/changemodule/Navigation').then((m) => ({
    default: m.ChangemoduleNavigation,
  })),
);

/**
 * The contract entry: core-ui calls loadRemote('<name>_ui/config') at boot
 * and registers routes, navigation and widgets from this object. Keep `name`
 * equal to the plugin name and every path under `path` inside this plugin.
 */
export const CONFIG: IUIConfig = {
  name: 'changeme',
  path: 'changeme',
  navigationGroup: {
    name: 'changeme',
    defaultPath: 'changeme/changemodule',
    icon: IconPuzzle,
    content: () => (
      <Suspense fallback={<div />}>
        <ChangemoduleNavigation />
      </Suspense>
    ),
  },
  modules: [{ name: 'changemodule', path: 'changemodule' }],
};
