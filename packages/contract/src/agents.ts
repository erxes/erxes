import { agentModels } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { AssistantModelId } from './assistant';
import { isoDate, listOf } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import { AssistantProvider } from './values';

const uniqueNames = (items: { name: string }[]) =>
  new Set(items.map((item) => item.name)).size === items.length;

export const PluginAgent = z
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
    tools: z
      .array(z.string().min(1).max(200))
      .max(50)
      .refine((names) => new Set(names).size === names.length, 'tools repeat')
      .default([]),
  })
  .describe(
    'An agent core runs for the plugin, as <plugin>.<name>: one durable conversation per key the plugin sends to (agents.submit). tools names operationIds of the plugin’s member API document (api.docs); core calls those routes with an agent call token (verifyAgentCall), never as a member. When a run answers, core sends core.agent.finished to the plugin if it subscribes.',
  );

export type PluginAgent = z.infer<typeof PluginAgent>;

/** Agents core runs for a plugin, such as a bot that answers its customers. */
export const PluginAgents = z.array(PluginAgent).max(8).refine(uniqueNames, 'agent names repeat');

/** An agent's full name: `<plugin>.<name>`, such as `frontline.bot`. */
export const AgentName = z
  .string()
  .regex(/^[a-z][a-z0-9_]*\.[a-z0-9]+(-[a-z0-9]+)*$/, 'an agent such as frontline.bot');

/** The plugin's key for one conversation, such as its own conversation id. */
export const AgentConversationKey = z
  .string()
  .regex(/^[A-Za-z0-9._-]{1,128}$/, 'letters, digits, dots, hyphens and underscores');

export const AgentModel = createSelectSchema(agentModels, { updatedAt: isoDate }).pick({
  agent: true,
  provider: true,
  model: true,
  updatedAt: true,
});

/** What `core.agent.finished` carries: the conversation and its run's answer. */
export const AgentFinished = z.object({
  agent: AgentName,
  key: AgentConversationKey,
  answer: z.string(),
});

const base = oc.errors(COMMON_ERRORS);

const { ASSISTANT_BUSY, ASSISTANT_KEY_UNREADABLE, ASSISTANT_NO_CONNECTION } = ERRORS;

export const agentsContract = {
  submit: base
    .errors({ ASSISTANT_BUSY, ASSISTANT_KEY_UNREADABLE, ASSISTANT_NO_CONNECTION })
    .route({
      method: 'POST',
      path: '/agents/{agent}/conversations/{key}/messages',
      summary: 'Send a message to a plugin agent',
      description:
        'A plugin sends a message into one conversation of its own agent, starting it on first use. The run happens on the server; core.agent.finished brings its answer. requestId makes a retry land once. 404 NOT_FOUND when the manifest declares no such agent',
    })
    .input(
      z.object({
        agent: AgentName,
        key: AgentConversationKey,
        text: z.string().trim().min(1).max(20_000),
        requestId: z.string().min(1).max(128).optional(),
      }),
    )
    .output(z.object({ ok: z.literal(true) })),
  models: base
    .route({
      method: 'GET',
      path: '/agents/models',
      summary: 'List the model each agent runs on',
      description:
        'The model each agent runs on, where an admin chose one; the others use the default provider and its default model',
    })
    .output(listOf(AgentModel)),
  setModel: base
    .route({
      method: 'PUT',
      path: '/agents/{agent}/model',
      summary: 'Choose an agent’s model',
      description:
        'Choose the provider and model an agent runs on. 404 NOT_FOUND when no key is saved for the provider',
    })
    .input(z.object({ agent: AgentName, provider: AssistantProvider, model: AssistantModelId }))
    .output(AgentModel),
};
