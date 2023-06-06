import { getService, getServices } from '../redis';
import retry from '../util/retry';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
dotenv.config();

export type ErxesProxyTarget = {
  name: string;
  address: string;
  pathRegex?: RegExp;
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
    pathRegex: new RegExp(`^\\/pl(:|-)${name}(?=(\\b|\\/))`, 'i')
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
    successLog: `Plugin ${name} joined service discovery.`
  });
}

async function ensureGraphqlEndpointIsUp({
  address,
  name
}: ErxesProxyTarget): Promise<void> {
  if (!address) return;

  const endponit = `${address}/graphql`;

  const res = await fetch(endponit, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
          query _ErxesGatewaySubgraphCheck_ {
            _service {
              sdl
            }
          }
          `
    })
  });
  if (res.status === 200) {
    return;
  }

  throw new Error(
    `Plugin ${name}'s graphql endpoint ${endponit} is not ready yet`
  );
}

async function retryEnsureGraphqlEndpointIsUp(target: ErxesProxyTarget) {
  const { name, address } = target;
  const endpoint = `${address}/graphql`;
  const intervalSeconds = 1;
  await retry({
    fn: () => ensureGraphqlEndpointIsUp(target),
    intervalMs: intervalSeconds * 1000,
    maxTries: maxPluginRetry,
    retryExhaustedLog: `Plugin ${name}'s graphql endpoint ${endpoint} is still not ready after checking for ${maxPluginRetry} times with ${intervalSeconds} second(s) interval. Retry exhausted.`,
    retryLog: `Waiting for service ${name}'s graphql endpoint ${endpoint} to be up.`,
    successLog: `Plugin ${name}'s graphql endpoint ${endpoint} is up.`
  });
}

export async function retryGetProxyTargets(): Promise<ErxesProxyTarget[]> {
  try {
    const serviceNames = await getServices();
    const proxyTargets: ErxesProxyTarget[] = await Promise.all(
      serviceNames.map(retryGetProxyTarget)
    );
    await Promise.all(proxyTargets.map(retryEnsureGraphqlEndpointIsUp));
    return proxyTargets;
  } catch (e) {
    console.log(
      '-----------------------------------------ERRRORR retryGetProxyTargets-------------------------------------------'
    );
    console.log(e);
    console.error(e);
    process.exit(1);
  }
}

type ProxyTargetByPath0 = Record<string, ErxesProxyTarget | undefined | null>;

export function proxyConfigByPath0(
  targets: ErxesProxyTarget[]
): ProxyTargetByPath0 {
  const result: ProxyTargetByPath0 = {};
  for (const target of targets) {
    if (target.name === 'graphql') {
      result['graphql'] = target;
    } else {
      const path01 = `pl:${target.name}`;
      const path02 = `pl-${target.name}`;
      result[path01] = target;
      result[path02] = target;
    }
  }
  return result;
}
