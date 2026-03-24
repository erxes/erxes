import { z } from 'zod';

const aiAgentTopicSchema = z.object({
  id: z.string(),
  topicName: z.string(),
  prompt: z.string(),
});

const aiAgentObjectFieldSchema = z.object({
  id: z.string(),
  fieldName: z.string(),
  prompt: z.string(),
  dataType: z.enum(['string', 'number', 'boolean', 'object', 'array']),
  validation: z.string(),
});

const generateObjectSchema = z.object({
  goalType: z.literal('generateObject'),
  objectFields: z.array(aiAgentObjectFieldSchema),
});

const classifyTopicSchema = z.object({
  goalType: z.literal('classifyTopic'),
  topics: z.array(aiAgentTopicSchema),
});

const generateTextSchema = z.object({
  goalType: z.literal('generateText'),
  prompt: z.string(),
});

const goalTypesSchema = z.discriminatedUnion('goalType', [
  generateTextSchema,
  classifyTopicSchema,
  generateObjectSchema,
]);

const commonAiAgentConfigFormSchema = z.object({ aiAgentId: z.string() });

export const aiAgentConfigFormSchema = z.intersection(
  goalTypesSchema,
  commonAiAgentConfigFormSchema,
);

export type TAiAgentConfigForm = z.infer<typeof aiAgentConfigFormSchema>;
