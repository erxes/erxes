import { z } from 'zod';

const aiAgentFileVersionSchema = z.object({
  key: z.string(),
  name: z.string(),
  size: z.number().optional(),
  type: z.string().optional(),
  uploadedAt: z.string().optional(),
});

const aiAgentFileSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  size: z.number().optional(),
  type: z.string().optional(),
  uploadedAt: z.string().optional(),
  versions: z.array(aiAgentFileVersionSchema).default([]),
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

const normalizeUploadedAt = (value: unknown) => {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  }

  if (typeof value === 'number') {
    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  }

  return undefined;
};

const normalizeAiAgentFileVersions = (versions: any[] = []) =>
  versions
    .map((version) => {
      const key =
        typeof version?.key === 'string'
          ? version.key.trim()
          : String(version?.key || '');
      const name =
        typeof version?.name === 'string'
          ? version.name.trim()
          : String(version?.name || '');
      const rawSize =
        typeof version?.size === 'number'
          ? version.size
          : Number(version?.size);

      return {
        key,
        name,
        size: Number.isFinite(rawSize) && rawSize >= 0 ? rawSize : undefined,
        type:
          typeof version?.type === 'string' && version.type.trim()
            ? version.type.trim()
            : undefined,
        uploadedAt: normalizeUploadedAt(version?.uploadedAt),
      };
    })
    .filter((version) => version.key && version.name);

const normalizeAiAgentFiles = (files: any[] = []) =>
  files
    .map((file, index) => {
      const key =
        typeof file?.key === 'string'
          ? file.key.trim()
          : String(file?.key || '');
      const name =
        typeof file?.name === 'string'
          ? file.name.trim()
          : String(file?.name || '');
      const fallbackId = key || name || `context-file-${index + 1}`;
      const rawSize =
        typeof file?.size === 'number' ? file.size : Number(file?.size);

      return {
        id:
          typeof file?.id === 'string' && file.id.trim()
            ? file.id.trim()
            : fallbackId,
        key,
        name,
        size: Number.isFinite(rawSize) && rawSize >= 0 ? rawSize : undefined,
        type:
          typeof file?.type === 'string' && file.type.trim()
            ? file.type.trim()
            : undefined,
        uploadedAt: normalizeUploadedAt(file?.uploadedAt),
        versions: normalizeAiAgentFileVersions(file?.versions || []),
      };
    })
    .filter((file) => file.key && file.name);

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
    files: normalizeAiAgentFiles(detail?.context?.files || []),
  },
});
