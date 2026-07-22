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

// Tool of a generateText agent. Both kinds get their target from the canvas
// wiring (optionalConnects, optionalConnectId = tool id): helper runs the
// wired workflow inline and feeds the result back into the conversation;
// handoff ends the turn and routes execution to the wired node.
const aiAgentToolSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().default(''),
  kind: z.enum(['helper', 'handoff']),
});

const generateTextSchema = z.object({
  goalType: z.literal('generateText'),
  prompt: z.string().optional().default(''),
  fallbackText: z.string().optional().default(''),
  captureFields: z.array(aiAgentObjectFieldSchema).optional().default([]),
  tools: z.array(aiAgentToolSchema).optional().default([]),
});

export type TAiAgentToolConfig = z.infer<typeof aiAgentToolSchema>;

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

const commonAiAgentConfigFormSchema = z.object({
  aiAgentId: z.string().min(1),
  input: z.string().optional(),
  inputMapping: aiActionInputMappingSchema.optional(),
  optionalConnects: z.array(optionalConnectSchema).optional().default([]),
  memory: aiActionMemorySchema.default({
    read: {
      enabled: false,
      namespace: 'main',
    },
    write: {
      enabled: false,
      namespace: 'main',
      key: 'lastResult',
      resultPath: '',
      mode: 'replace',
      ttlMinutes: 1440,
    },
  }),
});

export const aiAgentActionConfigSchema = z.intersection(
  goalTypesSchema,
  commonAiAgentConfigFormSchema,
);

export type TAiAgentActionConfig = z.infer<typeof aiAgentActionConfigSchema>;

export type TAiToolCallTrace = {
  name: string;
  kind: 'helper' | 'handoff';
  arguments: Record<string, unknown>;
  result?: unknown;
  error?: string;
};

export type TAiActionExecutionResult =
  | {
      type: 'generateText';
      text: string;
      attributes?: Record<string, unknown>;
      // Tool calls made during generation (history/debugging)
      toolCalls?: TAiToolCallTrace[];
      // Tool definitions offered to the provider on this run (debugging)
      toolsOffered?: string[];
      // Set when the agent handed the conversation off to a tool route
      handoff?: {
        toolId: string;
        name: string;
        args: Record<string, unknown>;
      };
      // Handoff arguments, exposed for {{ actions.<id>.args.* }} placeholders
      args?: Record<string, unknown>;
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
