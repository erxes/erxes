import {
  AI_AGENT_DEFAULTS,
  AI_AGENT_PROVIDER_DEFAULT_MODELS,
} from '../../aiAgent/constants';
import type { TKimiAgentConnection } from '../../aiAgent/connection';
import { getFirstAiProviderEnv } from '../env';
import { TAiProviderResolutionInput } from '../types';

type TKimiResolutionInput = Omit<TAiProviderResolutionInput, 'connection'> & {
  connection: TKimiAgentConnection;
};

export const resolveKimiConnection = ({
  subdomain,
  connection,
}: TKimiResolutionInput): TKimiAgentConnection => {
  const config = connection.config || {};

  return {
    ...connection,
    provider: 'kimi',
    model:
      connection.model?.trim() ||
      getFirstAiProviderEnv({
        names: ['KIMI_DEFAULT_MODEL', 'MOONSHOT_DEFAULT_MODEL'],
        defaultValue: AI_AGENT_PROVIDER_DEFAULT_MODELS.kimi,
        subdomain,
      }),
    config: {
      ...config,
      apiKey:
        config.apiKey?.trim() ||
        getFirstAiProviderEnv({
          names: ['KIMI_API_KEY', 'MOONSHOT_API_KEY'],
          subdomain,
        }),
      baseUrl:
        config.baseUrl?.trim() ||
        getFirstAiProviderEnv({
          names: ['KIMI_BASE_URL', 'MOONSHOT_BASE_URL'],
          defaultValue: AI_AGENT_DEFAULTS.kimiBaseUrl,
          subdomain,
        }),
    },
  };
};
