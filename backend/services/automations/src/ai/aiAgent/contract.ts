import { z } from 'zod';
import {
  AI_AGENT_LIMITS,
  AI_AGENT_DEFAULTS,
} from './constants';
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
  versions: z.array(aiAgentFileVersionSchema).default([]),
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
    files: z.array(aiAgentFileSchema).max(AI_AGENT_LIMITS.maxFiles).default([]),
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

export const parseAiAgentInput = (input: unknown): TAiAgentInput => {
  return aiAgentInputSchema.parse(input);
};
