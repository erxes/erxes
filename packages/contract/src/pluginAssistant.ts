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

export const PluginAssistant = z
  .object({
    skills: z
      .array(PluginAssistantSkill)
      .max(8)
      .refine(uniqueNames, 'skill names repeat')
      .default([]),
  })
  .describe(
    'What the plugin adds to the assistant: skills. Its procedures come from its member API document (api.docs): the assistant calls each route as <plugin>:<operationId> with the member’s session token, and a route that is not a GET follows the approval mode.',
  );
