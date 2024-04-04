import { getService, getServices } from '@erxes/api-utils/src/serviceDiscovery';
import retry from '../util/retry';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
dotenv.config();

export type ErxesProxyTarget = {
  name: string;
  address: string;
  config: any;
};

const { MAX_PLUGIN_RETRY } = process.env;

const maxPluginRetry = Number(MAX_PLUGIN_RETRY) || Number.MAX_SAFE_INTEGER;

async function getProxyTarget(name: string): Promise<ErxesProxyTarget> {
  const service = await getService(name);

  if (!service.address) {
    throw new Error(`Plugin ${name} has no address value in service discovery`);
  }
  return {
    name,
    address: service.address,
    config: service.config,
  };
}

async function retryGetProxyTarget(name: string): Promise<ErxesProxyTarget> {
  const intervalSeconds = 1;
  return retry({
    fn: () => getProxyTarget(name),
    intervalMs: intervalSeconds * 1000,
    maxTries: maxPluginRetry,
    retryExhaustedLog: `Plugin ${name} still hasn't joined the service discovery after checking for ${maxPluginRetry} time(s) with ${intervalSeconds} second(s) interval. Retry exhausted.`,
    retryLog: `Waiting for plugin ${name} to join service discovery`,
    successLog: `Plugin ${name} joined service discovery.`,
  });
}

async function ensureGraphqlEndpointIsUp({
  address,
  name,
}: ErxesProxyTarget): Promise<void> {
  if (!address) return;

  const endponit = `${address}/graphql`;

  /*
    query: 'query SubgraphIntrospectQuery {\n' +
      '    # eslint-disable-next-line\n' +
      '    _service {\n' +
      '        sdl\n' +
      '    }\n' +
      '}',

  */
  const res = await fetch(endponit, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      variables: null,
      query: `
          query SubgraphIntrospectQuery {
            _service {
              sdl
            }
          }
          `,
      operationName: 'SubgraphIntrospectQuery',
    }),
  });
  if (res.ok) {
    return;
  }

  throw new Error(
    `Plugin ${name}'s graphql endpoint ${endponit} is not ready yet`,
  );
}

async function retryEnsureGraphqlEndpointIsUp(target: ErxesProxyTarget) {
  const { name, address } = target;
  const endpoint = `${address}/graphql`;
  await retry({
    fn: () => ensureGraphqlEndpointIsUp(target),
    intervalMs: 5 * 1000,
    maxTries: maxPluginRetry,
    retryExhaustedLog: `ERROR: ${name} graphql endpoint ${endpoint} isn't running.`,
    retryLog: `WAITING FOR: ${name} graphql endpoint ${endpoint}`,
    successLog: `UP: ${name} graphql endpoint ${endpoint}`,
  });
}

export async function retryGetProxyTargets(): Promise<ErxesProxyTarget[]> {
  try {
    const serviceNames = await getServices();

    const proxyTargets: ErxesProxyTarget[] = await Promise.all(
      serviceNames.map(retryGetProxyTarget),
    );

    await Promise.all(proxyTargets.map(retryEnsureGraphqlEndpointIsUp));

    return proxyTargets;
  } catch (e) {
    console.log(e);
    console.error(e);
    process.exit(1);
  }
}
