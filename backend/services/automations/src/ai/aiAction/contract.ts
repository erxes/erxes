import { z } from 'zod';

const aiActionInputMappingSchema = z.object({
  source: z.enum(['trigger', 'previousAction', 'custom']).default('trigger'),
  path: z.string().optional().default(''),
  customValue: z.string().optional().default(''),
});

const aiAgentTopicSchema = z.object({
  id: z.string().min(1),
  topicName: z.string().min(1),
  prompt: z.string().default(''),
});

const aiAgentObjectFieldSchema = z.object({
  id: z.string().min(1),
  fieldName: z.string().min(1),
  prompt: z.string().default(''),
  dataType: z.enum(['string', 'number', 'boolean', 'object', 'array']),
  validation: z.string().default(''),
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

const optionalConnectSchema = z.object({
  sourceId: z.string().optional(),
  actionId: z.string().optional(),
  optionalConnectId: z.string().optional(),
});

const commonAiAgentConfigFormSchema = z.object({
  aiAgentId: z.string().min(1),
  inputMapping: aiActionInputMappingSchema.default({
    source: 'trigger',
    path: '',
    customValue: '',
  }),
  optionalConnects: z.array(optionalConnectSchema).optional().default([]),
});

export const aiAgentActionConfigSchema = z.intersection(
  goalTypesSchema,
  commonAiAgentConfigFormSchema,
);

export type TAiAgentActionConfig = z.infer<typeof aiAgentActionConfigSchema>;

export type TAiActionExecutionResult =
  | {
      type: 'generateText';
      text: string;
      usage?: {
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
      };
    }
  | {
      type: 'splitTopic';
      topicId: string | null;
      matched: boolean;
      usage?: {
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
      };
    }
  | {
      type: 'classification';
      attributes: Record<string, unknown>;
      usage?: {
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
      };
    };

export const parseAiAgentActionConfig = (input: unknown) => {
  return aiAgentActionConfigSchema.parse(input);
};
