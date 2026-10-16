import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';

/**
 * Development only. Nx serves each remote on localhost:<port>, which resolves
 * only on the dev machine. Loading remotes through the dev server's
 * `/__remotes/<port>/` proxy also works when the app is opened from another
 * host, such as a tunnel or tailnet URL.
 */
const devRemotesRuntimePlugin = (): FederationRuntimePlugin => ({
  name: 'erxes-dev-remotes',
  beforeInit(args) {
    args.userOptions.remotes = args.userOptions.remotes?.map((remote) =>
      'entry' in remote
        ? {
            ...remote,
            entry: remote.entry.replace(
              /^http:\/\/localhost:(\d+)\//,
              '/__remotes/$1/',
            ),
          }
        : remote,
    );

    return args;
  },
});

// Module Federation loads runtime plugins through their default export.
export default devRemotesRuntimePlugin;
