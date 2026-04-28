import {
  AI_AGENT_DEFAULTS,
  AI_AGENT_PROVIDER_DEFAULT_MODELS,
} from '../../aiAgent/constants';
import type { TOpenAiAgentConnection } from '../../aiAgent/connection';
import { getFirstAiProviderEnv } from '../env';
import { TAiProviderResolutionInput } from '../types';

type TOpenAiResolutionInput = Omit<TAiProviderResolutionInput, 'connection'> & {
  connection: TOpenAiAgentConnection;
};

export const resolveOpenAiConnection = ({
  subdomain,
  connection,
}: TOpenAiResolutionInput): TOpenAiAgentConnection => {
  const config = connection.config || {};

  return {
    ...connection,
    provider: 'openai',
    model:
      connection.model?.trim() ||
      getFirstAiProviderEnv({
        names: ['OPENAI_DEFAULT_MODEL'],
        defaultValue: AI_AGENT_PROVIDER_DEFAULT_MODELS.openai,
        subdomain,
      }),
    config: {
      ...config,
      apiKey:
        config.apiKey?.trim() ||
        getFirstAiProviderEnv({
          names: ['OPENAI_API_KEY'],
          subdomain,
        }),
      baseUrl: config.baseUrl?.trim() || AI_AGENT_DEFAULTS.openAiBaseUrl,
    },
  };
};
