import { z } from 'zod';

const aiActionInputMappingSchema = z.object({
  source: z.enum(['trigger', 'previousAction', 'custom']),
  path: z.string().optional(),
  customValue: z.string().optional(),
});

const aiAgentTopicSchema = z.object({
  id: z.string(),
  topicName: z.string().min(1),
  prompt: z.string(),
});

const aiAgentObjectFieldSchema = z.object({
  id: z.string(),
  fieldName: z.string().min(1),
  prompt: z.string(),
  dataType: z.enum(['string', 'number', 'boolean', 'object', 'array']),
  validation: z.string(),
});

const generateTextSchema = z.object({
  goalType: z.literal('generateText'),
  prompt: z.string().min(1),
});

const splitTopicSchema = z.object({
  goalType: z.literal('splitTopic'),
  topics: z.array(aiAgentTopicSchema).min(1),
});

const classificationSchema = z.object({
  goalType: z.literal('classification'),
  objectFields: z.array(aiAgentObjectFieldSchema).min(1),
});

const goalTypesSchema = z.discriminatedUnion('goalType', [
  generateTextSchema,
  splitTopicSchema,
  classificationSchema,
]);

const commonAiAgentConfigFormSchema = z.object({
  aiAgentId: z.string().min(1),
  inputMapping: aiActionInputMappingSchema.default({
    source: 'trigger',
    path: '',
    customValue: '',
  }),
});

export const aiAgentConfigFormSchema = z.intersection(
  goalTypesSchema,
  commonAiAgentConfigFormSchema,
);

export type TAiAgentConfigForm = z.infer<typeof aiAgentConfigFormSchema>;
