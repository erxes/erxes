import { z } from 'zod';
import {
  type ClientOptions,
  defineIntegration,
  GatewayError,
  gatewayHttp,
  secret,
} from '@erxes/plugin-sdk/integrations';

const keys = z.object({ apiKey: secret('API key') });

interface ModelProviderSpec {
  key: string;
  name: string;
  summary: string;
  dashboard: string;
  baseUrl: string;
  modelsPath?: string;
  checkPath?: string;
  headers?: (apiKey: string) => Record<string, string>;
}

const bearer = (apiKey: string) => ({ Authorization: `Bearer ${apiKey}` });

const UNCHECKABLE = new Set([404, 405]);

const REJECTED = new Set([401, 403]);

const modelClient = (
  spec: ModelProviderSpec,
  apiKey: string,
  options: ClientOptions,
  base = options.baseUrl ?? spec.baseUrl,
) => ({
  apiKey,
  baseUrl: base,
  modelsUrl: `${base}${spec.modelsPath ?? '/models'}`,
  headers: (spec.headers ?? bearer)(apiKey),
  send: gatewayHttp(spec.name, base, options),
});

export type ModelClient = ReturnType<typeof modelClient>;

export const modelProvider = (spec: ModelProviderSpec) =>
  defineIntegration({
    key: spec.key,
    name: spec.name,
    summary: spec.summary,
    dashboard: spec.dashboard,
    category: 'ai',
    countries: [],
    permission: 'assistant.manage',
    keys,
    client: ({ apiKey }, options: ClientOptions) => modelClient(spec, apiKey, options),
    async verify({ send, headers }) {
      try {
        await send(spec.checkPath ?? spec.modelsPath ?? '/models', { headers });
      } catch (error) {
        if (!(error instanceof GatewayError) || error.status === null) throw error;

        if (UNCHECKABLE.has(error.status)) return;

        throw new GatewayError(
          REJECTED.has(error.status)
            ? `the API key was not accepted (${error.status})`
            : `it answered ${error.status}`,
          error.status,
        );
      }
    },
  });
