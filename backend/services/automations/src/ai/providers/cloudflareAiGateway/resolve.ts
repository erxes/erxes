import {
  AI_AGENT_DEFAULTS,
  AI_AGENT_PROVIDER_DEFAULT_MODELS,
} from '../../aiAgent/constants';
import type { TCloudflareAiGatewayAgentConnection } from '../../aiAgent/connection';
import { getFirstAiProviderEnv } from '../env';
import { TAiProviderResolutionInput } from '../types';
import { buildCloudflareAiGatewayBaseUrl } from './url';

type TCloudflareAiGatewayResolutionInput = Omit<
  TAiProviderResolutionInput,
  'connection'
> & {
  connection: TCloudflareAiGatewayAgentConnection;
};

export const resolveCloudflareAiGatewayConnection = ({
  subdomain,
  connection,
}: TCloudflareAiGatewayResolutionInput): TCloudflareAiGatewayAgentConnection => {
  const config = connection.config || {};
  const mode =
    config.mode ||
    getFirstAiProviderEnv({
      names: ['CLOUDFLARE_AI_GATEWAY_MODE'],
      defaultValue: AI_AGENT_DEFAULTS.cloudflareAiGatewayMode,
      subdomain,
    });

  const accountId =
    config.accountId?.trim() ||
    getFirstAiProviderEnv({
      names: [
        'CLOUDFLARE_AI_GATEWAY_ACCOUNT_ID',
        'CF_AI_GATEWAY_ACCOUNT_ID',
      ],
      subdomain,
    });
  const gatewayId =
    config.gatewayId?.trim() ||
    getFirstAiProviderEnv({
      names: ['CLOUDFLARE_AI_GATEWAY_ID', 'CF_AI_GATEWAY_ID'],
      subdomain,
    });
  const gatewayToken =
    config.gatewayToken?.trim() ||
    getFirstAiProviderEnv({
      names: ['CLOUDFLARE_AI_GATEWAY_TOKEN', 'CF_AI_GATEWAY_TOKEN'],
      subdomain,
    });
  const providerApiKey =
    config.apiKey?.trim() ||
    getFirstAiProviderEnv({
      names: [
        'CLOUDFLARE_AI_GATEWAY_PROVIDER_API_KEY',
        'CLOUDFLARE_AI_GATEWAY_API_KEY',
        'OPENAI_API_KEY',
      ],
      subdomain,
    });
  const rootBaseUrl = getFirstAiProviderEnv({
    names: ['CLOUDFLARE_AI_GATEWAY_BASE_URL'],
    defaultValue: AI_AGENT_DEFAULTS.cloudflareAiGatewayBaseUrl,
    subdomain,
  });
  const baseUrl =
    config.baseUrl?.trim() ||
    buildCloudflareAiGatewayBaseUrl({
      accountId,
      gatewayId,
      mode,
      rootBaseUrl,
    });

  return {
    ...connection,
    provider: 'cloudflare-ai-gateway',
    model:
      connection.model?.trim() ||
      getFirstAiProviderEnv({
        names: ['CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL'],
        defaultValue: AI_AGENT_PROVIDER_DEFAULT_MODELS['cloudflare-ai-gateway'],
        subdomain,
      }),
    config: {
      ...config,
      apiKey: providerApiKey,
      baseUrl,
      headers: {
        ...(config.headers || {}),
        ...(gatewayToken
          ? { 'cf-aig-authorization': `Bearer ${gatewayToken}` }
          : {}),
      },
    },
  };
};
