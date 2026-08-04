import type { TAiAgentConnection } from '../aiAgent/connection';

export type TAiProvider = TAiAgentConnection['provider'];

export type TCloudflareAiGatewayMode = 'compat' | 'openai-provider';

export type TAiProviderResolutionInput = {
  subdomain?: string;
  connection: TAiAgentConnection;
};

export type TAiProviderResolver = (
  input: TAiProviderResolutionInput,
) => TAiAgentConnection;
