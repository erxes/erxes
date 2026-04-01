import { z } from 'zod';

const aiAgentFileSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  size: z.number().optional(),
  type: z.string().optional(),
  uploadedAt: z.string().optional(),
});

const baseAiAgentFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().max(500).default(''),
  connection: z.object({
    provider: z.enum(['openai-compatible']),
    model: z.string().trim().min(1, 'Model is required'),
    config: z.object({
      apiKey: z.string().optional().default(''),
      baseUrl: z.string().trim().url('Enter a valid base URL'),
      headers: z.record(z.string(), z.string()).default({}),
    }),
  }),
  runtime: z.object({
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().int().min(1).max(4000),
    timeoutMs: z.number().int().min(1000).max(30000),
  }),
  context: z.object({
    systemPrompt: z.string().max(4000).default(''),
    files: z.array(aiAgentFileSchema).max(10).default([]),
  }),
});

export const buildAiAgentFormSchema = ({
  requireApiKey = false,
}: {
  requireApiKey?: boolean;
} = {}) =>
  baseAiAgentFormSchema.superRefine((value, ctx) => {
    if (requireApiKey && !value.connection.config.apiKey?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['connection', 'config', 'apiKey'],
        message: 'API key is required',
      });
    }
  });

export const aiAgentFormSchema = buildAiAgentFormSchema();

export type TAiAgentForm = z.infer<typeof baseAiAgentFormSchema>;

export const normalizeAiAgentFormValues = (detail?: any): TAiAgentForm => ({
  name: detail?.name || '',
  description: detail?.description || '',
  connection: {
    provider: detail?.connection?.provider || 'openai-compatible',
    model: detail?.connection?.model || '',
    config: {
      apiKey: '',
      baseUrl:
        detail?.connection?.config?.baseUrl || 'https://api.openai.com/v1',
      headers: detail?.connection?.config?.headers || {},
    },
  },
  runtime: {
    temperature: detail?.runtime?.temperature ?? 0.2,
    maxTokens: detail?.runtime?.maxTokens ?? 500,
    timeoutMs: detail?.runtime?.timeoutMs ?? 15000,
  },
  context: {
    systemPrompt: detail?.context?.systemPrompt || '',
    files: detail?.context?.files || [],
  },
});
