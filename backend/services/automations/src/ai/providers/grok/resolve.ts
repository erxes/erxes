import {
  AI_AGENT_DEFAULTS,
  AI_AGENT_PROVIDER_DEFAULT_MODELS,
} from '../../aiAgent/constants';
import type { TGrokAgentConnection } from '../../aiAgent/connection';
import { getFirstAiProviderEnv } from '../env';
import { TAiProviderResolutionInput } from '../types';

type TGrokResolutionInput = Omit<TAiProviderResolutionInput, 'connection'> & {
  connection: TGrokAgentConnection;
};

export const resolveGrokConnection = ({
  subdomain,
  connection,
}: TGrokResolutionInput): TGrokAgentConnection => {
  const config = connection.config || {};

  return {
    ...connection,
    provider: 'grok',
    model:
      connection.model?.trim() ||
      getFirstAiProviderEnv({
        names: ['GROK_DEFAULT_MODEL', 'XAI_DEFAULT_MODEL'],
        defaultValue: AI_AGENT_PROVIDER_DEFAULT_MODELS.grok,
        subdomain,
      }),
    config: {
      ...config,
      apiKey:
        config.apiKey?.trim() ||
        getFirstAiProviderEnv({
          names: ['GROK_API_KEY', 'XAI_API_KEY'],
          subdomain,
        }),
      baseUrl:
        config.baseUrl?.trim() ||
        getFirstAiProviderEnv({
          names: ['GROK_BASE_URL', 'XAI_BASE_URL'],
          defaultValue: AI_AGENT_DEFAULTS.grokBaseUrl,
          subdomain,
        }),
    },
  };
};
