import { AI_AGENT_DEFAULTS } from '../../aiAgent/constants';
import { TCloudflareAiGatewayMode } from '../types';

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, '');

const getCloudflareGatewayProviderPath = (mode: TCloudflareAiGatewayMode) => {
  return mode === 'openai-provider' ? 'openai' : 'compat';
};

export const buildCloudflareAiGatewayBaseUrl = ({
  accountId,
  gatewayId,
  mode,
  rootBaseUrl = AI_AGENT_DEFAULTS.cloudflareAiGatewayBaseUrl,
}: {
  accountId: string;
  gatewayId: string;
  mode: TCloudflareAiGatewayMode;
  rootBaseUrl?: string;
}) => {
  const cleanAccountId = trimSlashes(accountId.trim());
  const cleanGatewayId = trimSlashes(gatewayId.trim());

  if (!cleanAccountId || !cleanGatewayId) {
    return '';
  }

  return [
    rootBaseUrl.replace(/\/+$/g, ''),
    cleanAccountId,
    cleanGatewayId,
    getCloudflareGatewayProviderPath(mode),
  ].join('/');
};

