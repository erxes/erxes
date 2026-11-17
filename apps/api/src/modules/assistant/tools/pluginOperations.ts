import { withOrg } from '@erxes/core-db';
import { RPCLink } from '@orpc/client/fetch';
import { ORPCError } from '@orpc/server';
import { outboundFetch } from '~/lib/outbound';
import { logger } from '~/logger';
import { pluginSession } from '~/modules/plugins/installations.service';
import type { InstalledPlugin } from '../plugins';
import { type ApiProcedure, carriesCredentials, isCredentialName, isRisky } from './apiCatalog';
import { bounded, describeError, refusal } from './results';

const PLUGIN_TIMEOUT_MS = 30_000;

const PLUGIN_MAX_BYTES = 1_000_000;

const log = logger.child({ component: 'assistant' });

export interface PluginProcedure extends ApiProcedure {
  plugin: string;
  apiUrl: string;
  operation: string;
}

export const pluginProcedures = (plugins: InstalledPlugin[]): PluginProcedure[] =>
  plugins.flatMap(({ name: plugin, apiUrl, operations }) =>
    apiUrl
      ? operations.map((operation) => {
          const method = operation.changes ? 'POST' : 'GET';

          return {
            name: `${plugin}:${operation.name}`,
            method,
            path: `${plugin} ${operation.name.replaceAll('.', ' ')}`,
            summary: operation.summary,
            input: operation.input ?? { type: 'object' },
            changes: operation.changes,
            denied:
              carriesCredentials([operation.input]) ||
              operation.name.split('.').some(isCredentialName),
            risky: isRisky(operation.name, method),
            plugin,
            apiUrl,
            operation: operation.name,
          };
        })
      : [],
  );

export const callPluginProcedure = async (
  orgId: string,
  entry: PluginProcedure,
  input: Record<string, unknown>,
) => {
  try {
    const session = await withOrg(orgId, () => pluginSession(entry.plugin));

    const link = new RPCLink({
      url: `${entry.apiUrl.replace(/\/+$/, '')}/rpc`,
      headers: { authorization: `Bearer ${session.token}` },
      fetch: outboundFetch({ timeoutMs: PLUGIN_TIMEOUT_MS, maxBytes: PLUGIN_MAX_BYTES }),
    });

    return bounded(await link.call(entry.operation.split('.'), input, { context: {} }));
  } catch (error) {
    if (error instanceof ORPCError) return describeError(error);

    log.warn(
      { err: error, plugin: entry.plugin, operation: entry.operation },
      'plugin call failed',
    );

    return refusal('PLUGIN_UNAVAILABLE', `The ${entry.plugin} plugin did not answer`);
  }
};
