import { z } from 'zod';
import { AI_AGENT_LIMITS, AI_AGENT_DEFAULTS } from './constants';
import { aiAgentConnectionSchema } from './connection';

const aiAgentFileVersionSchema = z.object({
  key: z.string().trim().min(1),
  name: z.string().trim().min(1),
  size: z.number().int().nonnegative().optional(),
  type: z.string().optional(),
  uploadedAt: z.union([z.string(), z.date()]).optional(),
});

const aiAgentFileSchema = z.object({
  id: z.string().min(1),
  key: z.string().trim().min(1),
  name: z.string().trim().min(1),
  size: z.number().int().nonnegative().optional(),
  type: z.string().optional(),
  uploadedAt: z.union([z.string(), z.date()]).optional(),
  purpose: z.enum(['core', 'knowledge', 'policy', 'examples']).optional(),
  status: z.enum(['uploaded', 'indexing', 'indexed', 'failed']).optional(),
  chunkCount: z.number().int().nonnegative().optional(),
  indexedAt: z.union([z.string(), z.date()]).optional(),
  contentHash: z.string().optional(),
  indexError: z.string().optional(),
  versions: z.array(aiAgentFileVersionSchema).default([]),
});

const aiAgentKnowledgeSourceSchema = z.object({
  pluginName: z.string().trim().min(1),
  moduleName: z.string().trim().min(1),
  key: z.string().trim().min(1),
  sourceIds: z.array(z.string().trim().min(1)).max(1000).default([]),
  config: z.record(z.unknown()).default({}),
});

const aiAgentToolSchema = z.object({
  pluginName: z.string().trim().min(1),
  moduleName: z.string().trim().min(1),
  key: z.string().trim().min(1),
  enabled: z.boolean().default(true),
  config: z.record(z.unknown()).default({}),
});

const aiAgentRuntimeSchema = z
  .object({
    temperature: z
      .number()
      .min(0)
      .max(2)
      .default(AI_AGENT_DEFAULTS.temperature),
    maxTokens: z
      .number()
      .int()
      .min(1)
      .max(AI_AGENT_LIMITS.maxMaxTokens)
      .default(AI_AGENT_DEFAULTS.maxTokens),
    timeoutMs: z
      .number()
      .int()
      .min(AI_AGENT_LIMITS.minTimeoutMs)
      .max(AI_AGENT_LIMITS.maxTimeoutMs)
      .default(AI_AGENT_DEFAULTS.timeoutMs),
  })
  .default({});

const aiAgentContextSchema = z
  .object({
    systemPrompt: z
      .string()
      .max(AI_AGENT_LIMITS.maxSystemPromptChars)
      .default(''),
    retrieval: z
      .object({
        enabled: z.boolean().default(true),
        strategy: z.enum(['keyword', 'vector', 'hybrid']).default('keyword'),
        topK: z.number().int().min(1).max(20).default(5),
        maxContextBytes: z.number().int().min(500).max(50_000).default(8000),
        minScore: z.number().optional(),
      })
      .default({}),
    files: z.array(aiAgentFileSchema).max(AI_AGENT_LIMITS.maxFiles).default([]),
    knowledgeSources: z.array(aiAgentKnowledgeSourceSchema).max(20).default([]),
    tools: z.array(aiAgentToolSchema).max(20).default([]),
  })
  .default({});

export const aiAgentInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Agent name is required')
    .max(AI_AGENT_LIMITS.maxNameChars),
  description: z.string().max(AI_AGENT_LIMITS.maxDescriptionChars).default(''),
  connection: aiAgentConnectionSchema,
  runtime: aiAgentRuntimeSchema,
  context: aiAgentContextSchema,
});

export type TAiAgentInput = z.infer<typeof aiAgentInputSchema>;
export type TAiAgentFile = z.infer<
  typeof aiAgentInputSchema
>['context']['files'][number];
export type TAiAgentKnowledgeSource = z.infer<
  typeof aiAgentInputSchema
>['context']['knowledgeSources'][number];
export type TAiAgentTool = z.infer<
  typeof aiAgentInputSchema
>['context']['tools'][number];

export const parseAiAgentInput = (input: unknown): TAiAgentInput => {
  return aiAgentInputSchema.parse(input);
};
