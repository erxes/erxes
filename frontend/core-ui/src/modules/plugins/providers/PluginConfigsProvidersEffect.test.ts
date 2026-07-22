import { i18nInstance } from '~/i18n';
import { loadPluginI18nNamespace } from './PluginConfigsProvidersEffect';

jest.mock('~/i18n', () => ({
  i18nInstance: {
    loadNamespaces: jest.fn(),
  },
}));

jest.mock('@module-federation/enhanced/runtime', () => ({
  getInstance: jest.fn(),
  loadRemote: jest.fn(),
}));

jest.mock('jotai', () => ({
  useSetAtom: jest.fn(),
}));

jest.mock('ui-modules', () => ({
  loadingPluginsConfigState: {},
  pluginsConfigState: {},
}));

describe('loadPluginI18nNamespace', () => {
  const loadNamespaces = jest.mocked(i18nInstance.loadNamespaces);

  beforeEach(() => {
    loadNamespaces.mockReset();
    loadNamespaces.mockResolvedValue(undefined);
  });

  it('loads an explicit namespace for plugins whose locale name differs', async () => {
    await loadPluginI18nNamespace({
      name: 'erxes_agent',
      i18nNamespace: 'mastra',
    });

    expect(loadNamespaces).toHaveBeenCalledWith('mastra');
  });

  it('keeps loading the plugin name for legacy i18n configs', async () => {
    await loadPluginI18nNamespace({
      name: 'mushop',
      i18n: true,
    });

    expect(loadNamespaces).toHaveBeenCalledWith('mushop');
  });

  it('does not load a namespace for plugins without translations', async () => {
    await loadPluginI18nNamespace({ name: 'sales' });

    expect(loadNamespaces).not.toHaveBeenCalled();
  });
});
