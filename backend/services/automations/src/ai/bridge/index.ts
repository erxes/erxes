import type { TAiAgentInput } from '../aiAgent';
import { openAiCompatibleBridge } from './openaiCompatible';
import type { IAiProviderBridge, TAiBridgeMessage } from './types';
import { resolveAiProviderConnection } from '../providers';

const providerBridgeRegistry: Record<string, IAiProviderBridge> = {
  'cloudflare-ai-gateway': openAiCompatibleBridge,
  openai: openAiCompatibleBridge,
};

export const getAiProviderBridge = (provider: string): IAiProviderBridge => {
  const bridge = providerBridgeRegistry[provider];

  if (!bridge) {
    throw new Error(`Unsupported AI provider "${provider}"`);
  }

  return bridge;
};

export const checkAiProviderHealth = async (
  agent: TAiAgentInput,
  subdomain?: string,
) => {
  const connection = resolveAiProviderConnection({
    subdomain,
    connection: agent.connection,
  });
  const bridge = getAiProviderBridge(connection.provider);

  return await bridge.checkHealth({
    connection,
    runtime: agent.runtime,
  });
};

export const invokeAiProvider = async (
  agent: TAiAgentInput,
  messages: TAiBridgeMessage[],
  subdomain?: string,
) => {
  const connection = resolveAiProviderConnection({
    subdomain,
    connection: agent.connection,
  });
  const bridge = getAiProviderBridge(connection.provider);

  return await bridge.invoke({
    connection,
    runtime: agent.runtime,
    messages,
  });
};

export * from './types';
export * from './openaiCompatible';
