import { AI_AGENT_DEFAULT_PROVIDER } from '../aiAgent/constants';
import type { TAiAgentConnection } from '../aiAgent/connection';
import { resolveCloudflareAiGatewayConnection } from './cloudflareAiGateway';
import { resolveOpenAiConnection } from './openai';
import { TAiProviderResolutionInput } from './types';

export const resolveAiProviderConnection = ({
  subdomain,
  connection,
}: TAiProviderResolutionInput): TAiAgentConnection => {
  const effectiveConnection = {
    ...connection,
    provider: connection.provider || AI_AGENT_DEFAULT_PROVIDER,
  } as TAiAgentConnection;

  let resolved: TAiAgentConnection;

  if (effectiveConnection.provider === 'cloudflare-ai-gateway') {
    resolved = resolveCloudflareAiGatewayConnection({
      subdomain,
      connection: effectiveConnection,
    });
    console.log(resolved);
  } else if (effectiveConnection.provider === 'openai') {
    resolved = resolveOpenAiConnection({
      subdomain,
      connection: effectiveConnection,
    });
  } else {
    throw new Error('Unsupported AI provider');
  }

  if (resolved.provider === 'openai' && !resolved.config.apiKey?.trim()) {
    throw new Error(
      `AI provider "${resolved.provider}" API key is not configured.`,
    );
  }

  if (!resolved.config.baseUrl?.trim()) {
    throw new Error(
      `AI provider "${resolved.provider}" base URL is not configured.`,
    );
  }

  return resolved;
};
