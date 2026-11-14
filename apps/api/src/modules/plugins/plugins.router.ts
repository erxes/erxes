import {
  installPlugin,
  listPlugins,
  pluginSession,
  pluginSignal,
  uninstallPlugin,
} from '~/modules/plugins/installations.service';
import { issuePluginToken, registerManifest } from '~/modules/plugins/plugins.service';
import { scoped, unscoped } from '~/orpc';

export const pluginsRouter = {
  token: unscoped.plugins.token.handler(({ input }) => issuePluginToken(input)),
  registerManifest: unscoped.plugins.registerManifest.handler(({ input }) =>
    registerManifest(input),
  ),
  list: scoped.plugins.list.handler(() => listPlugins()),
  install: scoped.plugins.install.handler(({ input }) => installPlugin(input.name)),
  uninstall: scoped.plugins.uninstall.handler(({ input }) => uninstallPlugin(input.name)),
  session: scoped.plugins.session.handler(({ input }) => pluginSession(input.name)),
  signal: scoped.plugins.signal.handler(({ input }) => pluginSignal(input)),
};
