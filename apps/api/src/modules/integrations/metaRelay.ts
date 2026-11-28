import { GatewayError, gatewayHttp, json, parse } from '@erxes/plugin-sdk/integrations';
import { z } from 'zod';
import { config } from '~/config';

const NAME = 'The Meta relay';

const RELAYED = new Set(['facebook']);

const RELAY_STATE = /^v1\.[\w-]+\./;

const Install = z.object({ id: z.string().regex(/^[\w-]+$/) });

export const metaRelayFor = (key: string) => {
  const relay = config.integrations.metaRelay;

  if (!relay || !RELAYED.has(key)) return null;

  const call = (path: string, method: 'PUT' | 'DELETE', body?: Record<string, string>) =>
    gatewayHttp(
      NAME,
      relay.url,
      {},
    )(path, {
      method,
      headers: { Authorization: `Bearer ${relay.key}` },
      body: body && json(body),
    });

  const routePath = (page: string) => `/v1/routes/${key}/${encodeURIComponent(page)}`;

  return {
    url: relay.url,
    redirectUrl: `${relay.url}/service/${key}/authorize-redirector`,
    async register(callbackUrl: string) {
      const text = await call('/v1/installs/me', 'PUT', { callbackUrl });

      return parse(NAME, Install, text, 'an unreadable install answer').id;
    },
    async route(page: string, url: string) {
      await call(routePath(page), 'PUT', { url });
    },
    async unroute(page: string) {
      try {
        await call(routePath(page), 'DELETE');
      } catch (error) {
        if (!(error instanceof GatewayError) || error.status !== 404) throw error;
      }
    },
  };
};

export const withoutRelayPrefix = (state: string) => state.replace(RELAY_STATE, '');
