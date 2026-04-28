import { z } from 'zod';
import {
  AI_AGENT_DEFAULTS,
  AI_AGENT_LIMITS,
  AI_AGENT_PROVIDER_DEFAULT_MODELS,
} from './constants';

const headersSchema = z.record(z.string(), z.string()).default({});
const optionalUrlSchema = z
  .string()
  .trim()
  .refine((value) => !value || z.string().url().safeParse(value).success, {
    message: 'Invalid url',
  });

export const cloudflareAiGatewayConnectionSchema = z.object({
  provider: z.literal('cloudflare-ai-gateway'),
  model: z
    .string()
    .trim()
    .min(1, 'Connection model is required')
    .max(AI_AGENT_LIMITS.maxModelChars)
    .default(AI_AGENT_PROVIDER_DEFAULT_MODELS['cloudflare-ai-gateway']),
  config: z
    .object({
      apiKey: z
        .string()
        .trim()
        .max(AI_AGENT_LIMITS.maxSecretChars)
        .optional()
        .default(''),
      baseUrl: optionalUrlSchema.optional().default(''),
      headers: headersSchema,
      accountId: z.string().trim().optional().default(''),
      gatewayId: z.string().trim().optional().default(''),
      gatewayToken: z
        .string()
        .trim()
        .max(AI_AGENT_LIMITS.maxSecretChars)
        .optional()
        .default(''),
      mode: z
        .enum(['compat', 'openai-provider'])
        .optional()
        .default(AI_AGENT_DEFAULTS.cloudflareAiGatewayMode),
    })
    .default({}),
});

export const openAiConnectionSchema = z.object({
  provider: z.literal('openai'),
  model: z
    .string()
    .trim()
    .min(1, 'Connection model is required')
    .max(AI_AGENT_LIMITS.maxModelChars)
    .default(AI_AGENT_PROVIDER_DEFAULT_MODELS.openai),
  config: z
    .object({
      apiKey: z
        .string()
        .trim()
        .max(AI_AGENT_LIMITS.maxSecretChars)
        .optional()
        .default(''),
      baseUrl: z
        .string()
        .trim()
        .url()
        .optional()
        .default(AI_AGENT_DEFAULTS.openAiBaseUrl),
      headers: headersSchema,
    })
    .default({}),
});

export const aiAgentConnectionSchema = z
  .discriminatedUnion('provider', [
    cloudflareAiGatewayConnectionSchema,
    openAiConnectionSchema,
  ])
  .default({
    provider: 'cloudflare-ai-gateway',
    model: AI_AGENT_PROVIDER_DEFAULT_MODELS['cloudflare-ai-gateway'],
    config: {},
  });

export type TAiAgentConnection = z.infer<typeof aiAgentConnectionSchema>;
export type TCloudflareAiGatewayAgentConnection = Extract<
  TAiAgentConnection,
  { provider: 'cloudflare-ai-gateway' }
>;
export type TOpenAiAgentConnection = Extract<
  TAiAgentConnection,
  { provider: 'openai' }
>;
