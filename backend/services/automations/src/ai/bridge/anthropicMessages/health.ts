import { TAiBridgeHealthInput, TAiBridgeHealthResult } from '../types';

export const checkAnthropicMessagesHealth = async ({
  connection,
}: TAiBridgeHealthInput): Promise<TAiBridgeHealthResult> => {
  const errors: string[] = [];

  if (!connection.config.apiKey?.trim()) {
    errors.push('API key is not configured.');
  }

  if (!connection.config.baseUrl?.trim()) {
    errors.push('Base URL is not configured.');
  }

  if (!connection.model?.trim()) {
    errors.push('Model is not configured.');
  }

  return {
    ready: errors.length === 0,
    errors,
    warnings: [
      'Health check validates configuration only. The Anthropic Messages endpoint is tested during execution.',
    ],
    checks: {
      credentials: connection.config.apiKey?.trim() ? 'ok' : 'error',
      endpoint: connection.config.baseUrl?.trim() ? 'ok' : 'error',
      model: connection.model?.trim() ? 'ok' : 'error',
    },
  };
};
