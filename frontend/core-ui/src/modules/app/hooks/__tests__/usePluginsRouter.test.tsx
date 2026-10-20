/** @jest-environment node */
import { getPluginsRoutes } from '../usePluginsRouter';

let mockPluginName = '';
jest.mock('jotai', () => ({
  useAtom: () => [
    {
      inventory_tools_ui: { name: mockPluginName, path: 'inventory-tools' },
    },
  ],
}));
jest.mock('ui-modules', () => ({ pluginsConfigState: {} }));
jest.mock('~/plugins/components/RenderPluginsComponent', () => ({
  RenderPluginsComponent: () => null,
}));
jest.mock('@/auth/components/PermissionRouteGuard', () => ({
  PermissionRouteGuard: () => null,
}));

describe('plugin routes', () => {
  it.each(['inventory', 'inventory-tools', 'inventory_tools'])(
    'keeps CONFIG.name %s separate from the discovered remote and URL',
    (name) => {
      mockPluginName = name;

      const [route] = getPluginsRoutes();
      const guard = route.props.element;
      const remote = guard.props.children;

      expect(route.props.path).toBe('/inventory-tools/*');
      expect(guard.props.plugin).toBe(name);
      expect(remote.props.pluginName).toBe('inventory_tools_ui');
      expect(remote.props.remoteModuleName).toBe(name);
    },
  );
});
