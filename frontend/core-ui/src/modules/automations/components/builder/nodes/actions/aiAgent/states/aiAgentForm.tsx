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

const aiActionMemoryReadSchema = z.object({
  enabled: z.boolean().default(false),
  namespace: z.string().min(1).default('main'),
});

const aiActionMemoryWriteSchema = z.object({
  enabled: z.boolean().default(false),
  namespace: z.string().min(1).default('main'),
  key: z.string().min(1).default('lastResult'),
  resultPath: z.string().default(''),
  mode: z.enum(['replace', 'merge']).default('replace'),
  ttlMinutes: z.number().int().min(5).max(10080).default(1440),
});

const aiActionMemorySchema = z.object({
  read: aiActionMemoryReadSchema.default({
    enabled: false,
    namespace: 'main',
  }),
  write: aiActionMemoryWriteSchema.default({
    enabled: false,
    namespace: 'main',
    key: 'lastResult',
    resultPath: '',
    mode: 'replace',
    ttlMinutes: 1440,
  }),
});

export const getDefaultAiAgentMemoryConfig = (
  goalType?: 'generateText' | 'splitTopic' | 'classification',
) => {
  if (goalType === 'splitTopic') {
    return {
      read: {
        enabled: true,
        namespace: 'main',
      },
      write: {
        enabled: true,
        namespace: 'main',
        key: 'lastTopic',
        resultPath: 'topicId',
        mode: 'replace' as const,
        ttlMinutes: 1440,
      },
    };
  }

  if (goalType === 'classification') {
    return {
      read: {
        enabled: true,
        namespace: 'main',
      },
      write: {
        enabled: true,
        namespace: 'main',
        key: 'attributes',
        resultPath: 'attributes',
        mode: 'merge' as const,
        ttlMinutes: 1440,
      },
    };
  }

  if (goalType === 'generateText') {
    return {
      read: {
        enabled: true,
        namespace: 'main',
      },
      write: {
        enabled: false,
        namespace: 'main',
        key: 'lastReplyText',
        resultPath: 'text',
        mode: 'replace' as const,
        ttlMinutes: 1440,
      },
    };
  }

  return {
    read: {
      enabled: false,
      namespace: 'main',
    },
    write: {
      enabled: false,
      namespace: 'main',
      key: 'lastResult',
      resultPath: '',
      mode: 'replace' as const,
      ttlMinutes: 1440,
    },
  };
};

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
  memory: aiActionMemorySchema.default(getDefaultAiAgentMemoryConfig()),
});

export const aiAgentConfigFormSchema = z.intersection(
  goalTypesSchema,
  commonAiAgentConfigFormSchema,
);

export type TAiAgentConfigForm = z.infer<typeof aiAgentConfigFormSchema>;
