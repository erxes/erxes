import { z } from 'zod/v4';
import {
  automationOptionalConnectsSchema,
  describeConfigField as described,
} from './configSchema';

const aiActionInputMappingSchema = z.object({
  source: z.enum(['trigger', 'previousAction', 'custom']).default('trigger'),
  path: z.string().optional().default(''),
  customValue: z.string().optional().default(''),
});

const aiAgentTopicSchema = z.object({
  id: described(
    z.string().min(1),
    'Topic id, the optionalConnectId of its branch.',
  ),
  topicName: z.string().min(1),
  prompt: described(
    z.string(),
    'When the message belongs to this topic.',
  ).default(''),
});

// One rule of a field's protocol: the value is returned only when the input
// satisfies the prompt; nothing is picked as "closest".
const aiAgentFieldOptionSchema = z.object({
  value: z.string().min(1),
  prompt: described(
    z.string(),
    'When this value is the answer; rules are tried top to bottom.',
  ).default(''),
});

const aiAgentObjectFieldSchema = z.object({
  id: z.string().min(1),
  fieldName: described(
    z.string().min(1),
    'Key the value is returned under, read later as {{ actions.<id>.attributes.<fieldName> }}.',
  ),
  prompt: described(
    z.string(),
    'What to read from the conversation into this field.',
  ).default(''),
  dataType: z.enum([
    'string',
    'number',
    'boolean',
    'object',
    'array',
    'option',
  ]),
  validation: z.string().default(''),
  options: described(
    z.array(aiAgentFieldOptionSchema),
    'Allowed values of an option field, at least one.',
  )
    .optional()
    .default([]),
});

// Both kinds get their target from the canvas wiring (optionalConnects,
// optionalConnectId = tool id): helper runs the wired workflow inline and
// feeds the result back; handoff ends the turn and routes to the wired node.
const aiAgentToolSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: described(
    z.string(),
    'When the agent calls this tool; also when it must not.',
  )
    .optional()
    .default(''),
  kind: described(
    z.enum(['helper', 'handoff']),
    "handoff ends the reply and continues the flow at the tool's branch (a ticket, an edit); helper runs its branch and answers with the result.",
  ),
  // Output keys of actions behind this tool kept in long-term memory, on top
  // of the fields each action is set to remember.
  memorizeFields: z
    .array(z.object({ actionId: z.string().min(1), key: z.string().min(1) }))
    .optional()
    .default([]),
});

const generateTextSchema = z.object({
  goalType: described(
    z.literal('generateText'),
    'One agent that replies, fills captureFields and routes through tools in the same run. The usual choice for a conversation.',
  ),
  prompt: described(
    z.string(),
    'Instructions for the reply; {{ }} placeholders allowed. The reply is read as {{ actions.<id>.text }}.',
  )
    .optional()
    .default(''),
  fallbackText: z.string().optional().default(''),
  captureFields: described(
    z.array(aiAgentObjectFieldSchema),
    'Values read from the conversation while replying (a priority option, a title, an email), output as {{ actions.<id>.attributes.<fieldName> }}. This is classification; no separate agent is needed.',
  )
    .optional()
    .default([]),
  tools: described(
    z.array(aiAgentToolSchema),
    'Routes the agent may take, one branch each through optionalConnects (optionalConnectId = tool id). This is topic routing; no separate agent is needed.',
  )
    .optional()
    .default([]),
});

const splitTopicSchema = z.object({
  goalType: described(
    z.literal('splitTopic'),
    'Only routes, without a reply. Prefer generateText with tools when the customer gets an answer.',
  ),
  topics: described(
    z.array(aiAgentTopicSchema).min(1),
    'Each topic is a branch: link it with optionalConnects.',
  ),
});

const classificationSchema = z.object({
  goalType: described(
    z.literal('classification'),
    'Only extracts objectFields, without a reply. Prefer generateText with captureFields when the customer gets an answer.',
  ),
  objectFields: z.array(aiAgentObjectFieldSchema).min(1),
});

const goalTypesSchema = z.discriminatedUnion('goalType', [
  generateTextSchema,
  splitTopicSchema,
  classificationSchema,
]);

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

const commonAiAgentConfigSchema = z.object({
  aiAgentId: described(
    z.string().min(1),
    '_id of an AI agent from automationsAiAgents.',
  ),
  input: described(
    z.string(),
    'Text the agent reads; {{ }} placeholders allowed. Empty reads the trigger message.',
  ).optional(),
  inputMapping: aiActionInputMappingSchema.optional(),
  optionalConnects: described(
    automationOptionalConnectsSchema,
    'Branch links: optionalConnectId is a topic id (splitTopic) or a tool id (generateText tools); actionId is the next action.',
  )
    .optional()
    .default([]),
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

/** What the engine runs an AI agent action with; parsing fills defaults. */
export const aiAgentActionConfigSchema = z.intersection(
  goalTypesSchema,
  commonAiAgentConfigSchema,
);

export type TAiAgentObjectField = z.infer<typeof aiAgentObjectFieldSchema>;
export type TAiAgentToolConfig = z.infer<typeof aiAgentToolSchema>;
export type TAiAgentActionConfig = z.infer<typeof aiAgentActionConfigSchema>;
