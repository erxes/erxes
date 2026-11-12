import { HttpError } from '~/http/errors';
import {
  installPlugin,
  listPlugins,
  pluginSession,
  pluginSignal,
  uninstallPlugin,
} from '~/modules/plugins/installations.service';
import { issuePluginToken, registerManifest } from '~/modules/plugins/plugins.service';
import { pub, authed, plugin } from '~/orpc';

export const pluginsRouter = {
  token: pub.plugins.token.handler(({ input }) => issuePluginToken(input)),
  registerManifest: pub.plugins.registerManifest.handler(({ input, context }) => {
    if (!context.req.pluginService) throw new HttpError(401, 'UNAUTHORIZED', 'Sign in to continue');

    return registerManifest(context.req.pluginService, input);
  }),
  list: authed.plugins.list.handler(({ context }) => listPlugins(context.actor)),
  install: authed.plugins.install.handler(({ input, context }) =>
    installPlugin(context.actor, input.name),
  ),
  uninstall: authed.plugins.uninstall.handler(({ input, context }) =>
    uninstallPlugin(context.actor, input.name),
  ),
  session: authed.plugins.session.handler(({ input, context }) =>
    pluginSession(context.actor, input.name),
  ),
  signal: plugin.plugins.signal.handler(({ input, context }) =>
    pluginSignal(context.plugin, input),
  ),
};
