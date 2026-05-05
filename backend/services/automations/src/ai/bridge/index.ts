import { TAiAgentInput } from '../aiAgent';
import { openAiCompatibleBridge } from './openaiCompatible';
import { IAiProviderBridge, TAiBridgeMessage } from './types';

const providerBridgeRegistry: Record<string, IAiProviderBridge> = {
  openai: openAiCompatibleBridge,
};

export const getAiProviderBridge = (provider: string): IAiProviderBridge => {
  const bridge = providerBridgeRegistry[provider];

  if (!bridge) {
    throw new Error(`Unsupported AI provider "${provider}"`);
  }

  return bridge;
};

export const checkAiProviderHealth = async (agent: TAiAgentInput) => {
  const bridge = getAiProviderBridge(agent.connection.provider);

  return await bridge.checkHealth({
    connection: agent.connection,
    runtime: agent.runtime,
  });
};

export const invokeAiProvider = async (
  agent: TAiAgentInput,
  messages: TAiBridgeMessage[],
) => {
  const bridge = getAiProviderBridge(agent.connection.provider);

  return await bridge.invoke({
    connection: agent.connection,
    runtime: agent.runtime,
    messages,
  });
};

export * from './types';
export * from './openaiCompatible';
