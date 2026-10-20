import { render, waitFor } from '@testing-library/react';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { useSetAtom } from 'jotai';
import { pluginsConfigState } from 'ui-modules';
import { PluginConfigsProvidersEffect } from '../PluginConfigsProvidersEffect';

jest.mock('@module-federation/enhanced/runtime', () => ({
  getInstance: () => ({
    options: {
      remotes: [{ name: 'inventory_ui' }, { name: 'inventory_tools_ui' }],
    },
  }),
  loadRemote: jest.fn(),
}));
jest.mock('~/i18n', () => ({ i18nInstance: { loadNamespaces: jest.fn() } }));
jest.mock('jotai', () => ({ useSetAtom: jest.fn() }));
jest.mock('ui-modules', () => ({
  pluginsConfigState: { key: 'configs' },
  loadingPluginsConfigState: { key: 'loading' },
}));

describe('discovered config identity', () => {
  it.each(['inventory-tools', 'inventory_tools'])(
    'stores CONFIG.name %s under its actual remote key without rewriting CONFIG',
    async (name) => {
      const configs = {
        inventory_ui: { name: 'inventory', path: 'inventory' },
        inventory_tools_ui: { name, path: 'inventory-tools' },
      };
      const setConfigs = jest.fn();
      jest
        .mocked(useSetAtom)
        .mockImplementation((atom) =>
          atom === pluginsConfigState ? setConfigs : jest.fn(),
        );
      jest.mocked(loadRemote).mockReset();
      jest
        .mocked(loadRemote)
        .mockResolvedValueOnce({ CONFIG: configs.inventory_ui })
        .mockResolvedValueOnce({ CONFIG: configs.inventory_tools_ui });

      const { unmount } = render(<PluginConfigsProvidersEffect />);
      await waitFor(() => expect(setConfigs).toHaveBeenCalledTimes(2));

      expect(loadRemote).toHaveBeenNthCalledWith(1, 'inventory_ui/config');
      expect(loadRemote).toHaveBeenNthCalledWith(
        2,
        'inventory_tools_ui/config',
      );
      const state = setConfigs.mock.calls.reduce(
        (prev, [update]) => update(prev),
        {},
      );
      expect(state).toEqual(configs);
      expect(state.inventory_tools_ui).toBe(configs.inventory_tools_ui);
      unmount();
    },
  );
});
