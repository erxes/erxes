import { z } from 'zod';
import {
  aiAgentConnectionSchema,
  normalizeAiAgentConnection,
  TAiAgentConnection,
} from '@/automations/components/settings/components/agents/states/AiAgentConnectionSchema';
import { TAiAgentProvider } from '@/automations/components/settings/components/agents/constants/providers';

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
  purpose: z.enum(['core', 'knowledge', 'policy', 'examples']).optional(),
  status: z.enum(['uploaded', 'indexing', 'indexed', 'failed']).optional(),
  chunkCount: z.number().int().nonnegative().optional(),
  indexedAt: z.string().optional(),
  contentHash: z.string().optional(),
  indexError: z.string().optional(),
  versions: z.array(aiAgentFileVersionSchema).default([]),
});

const baseAiAgentFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().max(500).default(''),
  connection: aiAgentConnectionSchema,
  runtime: z.object({
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().int().min(1).max(32768),
    timeoutMs: z.number().int().min(1000).max(30000),
  }),
  context: z.object({
    systemPrompt: z.string().max(4000).default(''),
    retrieval: z
      .object({
        enabled: z.boolean().default(true),
        strategy: z.enum(['keyword', 'vector', 'hybrid']).default('keyword'),
        topK: z.number().int().min(1).max(20).default(5),
        maxContextBytes: z.number().int().min(500).max(50000).default(8000),
        minScore: z.number().optional(),
      })
      .default({}),
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

export const buildAiAgentFormSchema = ({
  requireApiKey = false,
}: {
  requireApiKey?: boolean;
} = {}) =>
  baseAiAgentFormSchema.superRefine((value, ctx) => {
    if (
      requireApiKey &&
      ['grok', 'kimi', 'kimi-code', 'openai'].includes(
        value.connection.provider,
      ) &&
      !value.connection.config.apiKey?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['connection', 'config', 'apiKey'],
        message: 'API key is required',
      });
    }
  });

export const aiAgentFormSchema = buildAiAgentFormSchema();

export type TAiAgentForm = z.infer<typeof baseAiAgentFormSchema>;
type TAiAgentFormFileVersionInput = {
  key?: unknown;
  name?: unknown;
  size?: unknown;
  type?: unknown;
  uploadedAt?: unknown;
};

type TAiAgentFormFileInput = TAiAgentFormFileVersionInput & {
  id?: unknown;
  versions?: unknown;
};

export type TAiAgentFormDetail = {
  _id?: string;
  name?: string;
  description?: string;
  connection?: {
    provider?: TAiAgentConnection['provider'];
    model?: string;
    config?: Partial<TAiAgentConnection['config']> & Record<string, unknown>;
  };
  runtime?: {
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
  };
  context?: {
    systemPrompt?: string;
    retrieval?: {
      enabled?: boolean;
      strategy?: 'keyword' | 'vector' | 'hybrid';
      topK?: number;
      maxContextBytes?: number;
      minScore?: number;
    };
    files?: unknown;
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const normalizeAiAgentFileVersions = (versions: unknown[] = []) =>
  versions
    .map((version) => {
      const current = isRecord(version)
        ? (version as TAiAgentFormFileVersionInput)
        : {};
      const key =
        typeof current.key === 'string'
          ? current.key.trim()
          : String(current.key || '');
      const name =
        typeof current.name === 'string'
          ? current.name.trim()
          : String(current.name || '');
      const rawSize =
        typeof current.size === 'number' ? current.size : Number(current.size);

      return {
        key,
        name,
        size: Number.isFinite(rawSize) && rawSize >= 0 ? rawSize : undefined,
        type:
          typeof current.type === 'string' && current.type.trim()
            ? current.type.trim()
            : undefined,
        uploadedAt: normalizeUploadedAt(current.uploadedAt),
      };
    })
    .filter((version) => version.key && version.name);

const normalizeAiAgentFiles = (files: unknown[] = []) =>
  files
    .map((file, index) => {
      const current = isRecord(file) ? (file as TAiAgentFormFileInput) : {};
      const key =
        typeof current.key === 'string'
          ? current.key.trim()
          : String(current.key || '');
      const name =
        typeof current.name === 'string'
          ? current.name.trim()
          : String(current.name || '');
      const fallbackId = key || name || `context-file-${index + 1}`;
      const rawSize =
        typeof current.size === 'number' ? current.size : Number(current.size);

      return {
        id:
          typeof current.id === 'string' && current.id.trim()
            ? current.id.trim()
            : fallbackId,
        key,
        name,
        size: Number.isFinite(rawSize) && rawSize >= 0 ? rawSize : undefined,
        type:
          typeof current.type === 'string' && current.type.trim()
            ? current.type.trim()
            : undefined,
        uploadedAt: normalizeUploadedAt(current.uploadedAt),
        purpose:
          current.purpose === 'core' ||
          current.purpose === 'knowledge' ||
          current.purpose === 'policy' ||
          current.purpose === 'examples'
            ? current.purpose
            : 'knowledge',
        status:
          current.status === 'uploaded' ||
          current.status === 'indexing' ||
          current.status === 'indexed' ||
          current.status === 'failed'
            ? current.status
            : 'uploaded',
        chunkCount:
          typeof current.chunkCount === 'number' && current.chunkCount >= 0
            ? current.chunkCount
            : undefined,
        indexedAt: normalizeUploadedAt(current.indexedAt),
        contentHash:
          typeof current.contentHash === 'string'
            ? current.contentHash
            : undefined,
        indexError:
          typeof current.indexError === 'string'
            ? current.indexError
            : undefined,
        versions: normalizeAiAgentFileVersions(
          Array.isArray(current.versions) ? current.versions : [],
        ),
      };
    })
    .filter((file) => file.key && file.name);

export const normalizeAiAgentFormValues = (
  detail?: TAiAgentFormDetail,
  defaultProvider?: TAiAgentProvider,
): TAiAgentForm => ({
  name: detail?.name || '',
  description: detail?.description || '',
  connection: {
    ...normalizeAiAgentConnection({
      provider: detail?.connection?.provider || defaultProvider,
      model: detail?.connection?.model,
      config: {
        ...(detail?.connection?.config || {}),
        headers: isRecord(detail?.connection?.config?.headers)
          ? Object.fromEntries(
              Object.entries(detail.connection.config.headers).map(
                ([key, value]) => [key, String(value ?? '')],
              ),
            )
          : {},
      },
    } as Partial<TAiAgentConnection>),
  },
  runtime: {
    temperature: detail?.runtime?.temperature ?? 0.2,
    maxTokens: detail?.runtime?.maxTokens ?? 500,
    timeoutMs: detail?.runtime?.timeoutMs ?? 15000,
  },
  context: {
    systemPrompt: detail?.context?.systemPrompt || '',
    retrieval: {
      enabled: detail?.context?.retrieval?.enabled ?? true,
      strategy: detail?.context?.retrieval?.strategy || 'keyword',
      topK: detail?.context?.retrieval?.topK ?? 5,
      maxContextBytes: detail?.context?.retrieval?.maxContextBytes ?? 8000,
      minScore: detail?.context?.retrieval?.minScore,
    },
    files: normalizeAiAgentFiles(
      Array.isArray(detail?.context?.files) ? detail.context.files : [],
    ),
  },
});
