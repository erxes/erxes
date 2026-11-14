import { z } from 'zod';

const uniqueNames = (items: { name: string }[]) =>
  new Set(items.map((item) => item.name)).size === items.length;

export const PluginAssistantSkill = z
  .object({
    name: z
      .string()
      .trim()
      .max(40)
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'lower case letters, digits and single hyphens'),
    description: z
      .string()
      .trim()
      .min(1)
      .max(300)
      .regex(/^[^\n\r]*$/, 'one line'),
    instructions: z.string().trim().min(1).max(12_000),
  })
  .describe(
    'Text-only guidance, mounted as <plugin>-<name>: the assistant sees the name and description every turn and loads the Markdown instructions when a request fits. Core rules, approvals and the member’s permissions always win.',
  );

export const PluginAssistantOperation = z
  .object({
    name: z
      .string()
      .trim()
      .max(80)
      .regex(/^[a-z][A-Za-z0-9]*(\.[a-z][A-Za-z0-9]*)+$/, 'a procedure path like leave.list'),
    summary: z.string().trim().min(1).max(300),
    changes: z.boolean().default(false),
    input: z
      .record(z.string(), z.unknown())
      .refine((value) => JSON.stringify(value).length <= 20_000, 'at most 20 KB')
      .describe('JSON Schema of the input, e.g. z.toJSONSchema(Input)')
      .optional(),
  })
  .describe(
    'A procedure of the plugin’s API the assistant may call, as <plugin>:<name>. Core calls <api.url>/rpc/<name with / for .> with oRPC’s RPC protocol and the member’s session token, so the plugin’s own checks apply. changes: true follows the approval mode.',
  );

export const PluginAssistant = z
  .object({
    skills: z
      .array(PluginAssistantSkill)
      .max(8)
      .refine(uniqueNames, 'skill names repeat')
      .default([]),
    operations: z
      .array(PluginAssistantOperation)
      .max(100)
      .refine(uniqueNames, 'operation names repeat')
      .default([]),
  })
  .describe('What the plugin adds to the assistant: skills, and operations of its API');
