import { resolvePluginRemoteName } from '../resolvePluginRemoteName';

describe('plugin federation identity', () => {
  const configs = {
    inventory_ui: { name: 'inventory', path: 'inventory' },
    inventory_tools_ui: { name: 'inventory-tools', path: 'inventory-tools' },
  };

  it.each([
    ['inventory_ui', 'inventory_ui'],
    ['inventory-tools_ui', 'inventory_tools_ui'],
    ['inventory_tools_ui', 'inventory_tools_ui'],
  ])('resolves page/widget request %s to %s', (request, remote) => {
    expect(resolvePluginRemoteName(request, configs)).toBe(remote);
  });

  it('uses the discovered identity even when CONFIG.name is different', () => {
    expect(
      resolvePluginRemoteName('inventoryTools_ui', {
        inventory_tools_ui: {
          name: 'inventoryTools',
          path: 'inventory-tools',
        },
      }),
    ).toBe('inventory_tools_ui');
  });

  it('normalizes only the container for widgets addressed before config loading', () => {
    expect(resolvePluginRemoteName('inventory-tools_ui', null)).toBe(
      'inventory_tools_ui',
    );
  });
});
