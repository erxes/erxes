import {
  AI_AGENT_DEFAULTS,
  AI_AGENT_PROVIDER_DEFAULT_MODELS,
} from '../../aiAgent/constants';
import type { TKimiCodingAgentConnection } from '../../aiAgent/connection';
import { getFirstAiProviderEnv } from '../env';
import { TAiProviderResolutionInput } from '../types';

type TKimiCodingResolutionInput = Omit<
  TAiProviderResolutionInput,
  'connection'
> & {
  connection: TKimiCodingAgentConnection;
};

export const resolveKimiCodingConnection = ({
  subdomain,
  connection,
}: TKimiCodingResolutionInput): TKimiCodingAgentConnection => {
  const config = connection.config || {};
  const configuredModel = connection.model?.trim();
  const model =
    !configuredModel || configuredModel === 'kimi-code'
      ? AI_AGENT_PROVIDER_DEFAULT_MODELS['kimi-code']
      : configuredModel;

  return {
    ...connection,
    provider: 'kimi-code',
    model:
      model ||
      getFirstAiProviderEnv({
        names: ['KIMI_CODING_DEFAULT_MODEL', 'KIMI_CODE_DEFAULT_MODEL'],
        defaultValue: AI_AGENT_PROVIDER_DEFAULT_MODELS['kimi-code'],
        subdomain,
      }),
    config: {
      ...config,
      apiKey:
        config.apiKey?.trim() ||
        getFirstAiProviderEnv({
          names: ['KIMI_CODING_API_KEY', 'KIMI_CODE_API_KEY'],
          subdomain,
        }),
      baseUrl:
        config.baseUrl?.trim() ||
        getFirstAiProviderEnv({
          names: ['KIMI_CODING_BASE_URL', 'KIMI_CODE_BASE_URL'],
          defaultValue: AI_AGENT_DEFAULTS.kimiCodingBaseUrl,
          subdomain,
        }),
    },
  };
};
