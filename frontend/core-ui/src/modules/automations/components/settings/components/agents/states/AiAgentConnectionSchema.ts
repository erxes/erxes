import {
  AI_AGENT_PROVIDER_DEFAULT_BASE_URLS,
  AI_AGENT_PROVIDER_DEFAULT_MODELS,
  TAiAgentProvider,
} from '@/automations/components/settings/components/agents/constants/providers';
import { z } from 'zod';

const headersSchema = z.record(z.string(), z.string()).default({});
const optionalUrlSchema = z
  .string()
  .trim()
  .refine((value) => !value || z.string().url().safeParse(value).success, {
    message: 'Enter a valid base URL',
  });

export const cloudflareAiGatewayConnectionSchema = z.object({
  provider: z.literal('cloudflare-ai-gateway'),
  model: z.string().trim().min(1, 'Model is required'),
  config: z.object({
    apiKey: z.string().optional().default(''),
    baseUrl: optionalUrlSchema.optional().default(''),
    headers: headersSchema,
    accountId: z.string().trim().optional().default(''),
    gatewayId: z.string().trim().optional().default(''),
    gatewayToken: z.string().optional().default(''),
    mode: z.enum(['compat', 'openai-provider']).default('compat'),
  }),
});

export const openAiConnectionSchema = z.object({
  provider: z.literal('openai'),
  model: z.string().trim().min(1, 'Model is required'),
  config: z.object({
    apiKey: z.string().optional().default(''),
    baseUrl: z
      .string()
      .trim()
      .url('Enter a valid base URL')
      .default(AI_AGENT_PROVIDER_DEFAULT_BASE_URLS.openai),
    headers: headersSchema,
  }),
});

export const aiAgentConnectionSchema = z.discriminatedUnion('provider', [
  cloudflareAiGatewayConnectionSchema,
  openAiConnectionSchema,
]);

export type TAiAgentConnection = z.infer<typeof aiAgentConnectionSchema>;
export type TCloudflareAiGatewayConnection = Extract<
  TAiAgentConnection,
  { provider: 'cloudflare-ai-gateway' }
>;
export type TOpenAiConnection = Extract<
  TAiAgentConnection,
  { provider: 'openai' }
>;
type TCloudflareAiGatewayConnectionConfig =
  TCloudflareAiGatewayConnection['config'];
type TOpenAiConnectionConfig = TOpenAiConnection['config'];

export const buildDefaultAiAgentConnection = (
  provider: TAiAgentProvider = 'cloudflare-ai-gateway',
): TAiAgentConnection => {
  if (provider === 'openai') {
    return {
      provider,
      model: AI_AGENT_PROVIDER_DEFAULT_MODELS.openai,
      config: {
        apiKey: '',
        baseUrl: AI_AGENT_PROVIDER_DEFAULT_BASE_URLS.openai,
        headers: {},
      },
    };
  }

  return {
    provider,
    model: AI_AGENT_PROVIDER_DEFAULT_MODELS['cloudflare-ai-gateway'],
    config: {
      apiKey: '',
      baseUrl: '',
      headers: {},
      accountId: '',
      gatewayId: '',
      gatewayToken: '',
      mode: 'compat',
    },
  };
};

export const normalizeAiAgentConnection = (
  detailConnection?: Partial<TAiAgentConnection> | null,
): TAiAgentConnection => {
  const provider =
    detailConnection?.provider === 'openai' ? 'openai' : 'cloudflare-ai-gateway';
  const defaults = buildDefaultAiAgentConnection(provider);
  const detailConfig = detailConnection?.config || {};

  if (provider === 'openai') {
    const openAiDefaults = defaults as TOpenAiConnection;
    const config = detailConfig as Partial<TOpenAiConnectionConfig>;

    return {
      provider,
      model: detailConnection?.model || openAiDefaults.model,
      config: {
        ...openAiDefaults.config,
        ...config,
        apiKey: '',
      },
    };
  }

  const cloudflareDefaults = defaults as TCloudflareAiGatewayConnection;
  const config = detailConfig as Partial<TCloudflareAiGatewayConnectionConfig>;

  return {
    provider,
    model: detailConnection?.model || cloudflareDefaults.model,
    config: {
      ...cloudflareDefaults.config,
      ...config,
      apiKey: '',
      gatewayToken: '',
      mode:
        config && 'mode' in config
          ? (config.mode as 'compat' | 'openai-provider') || 'compat'
          : 'compat',
    },
  };
};
