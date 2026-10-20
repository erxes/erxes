import { render, waitFor } from '@testing-library/react';
import { useAtomValue } from 'jotai';
import { RenderPluginsComponent } from '../RenderPluginsComponent';
import { loadRemoteComponent } from '../../utils/loadRemoteComponent';

jest.mock('jotai', () => ({ useAtomValue: jest.fn() }));
jest.mock('ui-modules', () => ({ pluginsConfigState: {} }));
jest.mock('erxes-ui', () => ({ Spinner: () => null }));
jest.mock('@sentry/react', () => ({ captureException: jest.fn() }));
jest.mock('../RenderPluginsComponentErrorState', () => ({
  RenderPluginsComponentErrorState: () => null,
}));
jest.mock('../RenderPluginsComponentCrashState', () => ({
  RenderPluginsComponentCrashState: () => null,
}));
jest.mock('../../utils/loadRemoteComponent', () => ({
  getLoadedRemoteComponent: jest.fn(),
  getRemoteComponentKey: (plugin: string, module: string) =>
    `${plugin}/${module}`,
  loadRemoteComponent: jest.fn(),
}));

describe('page and widget remote loading', () => {
  beforeEach(() => {
    jest.mocked(useAtomValue).mockReturnValue({
      inventory_ui: { name: 'inventory', path: 'inventory' },
      inventory_tools_ui: { name: 'inventory-tools', path: 'inventory-tools' },
    });
    jest.mocked(loadRemoteComponent).mockReset();
    jest.mocked(loadRemoteComponent).mockResolvedValue(() => <div>Loaded</div>);
  });

  it.each([
    'inventory',
    'relationWidget',
    'formWidget',
    'recordPickerWidget',
    'relationSettingsWidget',
    'floatingWidget',
  ])('loads %s without rewriting the expose name', async (expose) => {
    const { unmount } = render(
      <RenderPluginsComponent
        pluginName="inventory-tools_ui"
        remoteModuleName={expose}
      />,
    );
    await waitFor(() =>
      expect(loadRemoteComponent).toHaveBeenCalledWith(
        'inventory_tools_ui',
        expose,
      ),
    );
    unmount();
  });

  it('keeps undashed plugin loading unchanged', async () => {
    render(
      <RenderPluginsComponent
        pluginName="inventory_ui"
        remoteModuleName="inventory"
      />,
    );
    await waitFor(() =>
      expect(loadRemoteComponent).toHaveBeenCalledWith(
        'inventory_ui',
        'inventory',
      ),
    );
  });

  it('resolves widgets from a differently normalized CONFIG.name', async () => {
    jest.mocked(useAtomValue).mockReturnValue({
      inventory_tools_ui: { name: 'inventoryTools', path: 'inventory-tools' },
    });
    render(
      <RenderPluginsComponent
        pluginName="inventoryTools_ui"
        remoteModuleName="relationWidget"
      />,
    );
    await waitFor(() =>
      expect(loadRemoteComponent).toHaveBeenCalledWith(
        'inventory_tools_ui',
        'relationWidget',
      ),
    );
  });
});
