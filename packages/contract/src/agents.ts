import { AGENT_TEMPLATES } from '@erxes/core-db/enums';
import { agents } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { AssistantModelId } from './assistant';
import { ApiKey } from './apiKeys';
import { Id, isoDate, listOf } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import { ApiKeyActions, ApiKeyAreas, ApiKeyPlugins, AssistantProvider, PluginName } from './values';

/** The template an agent started from; each fills in instructions and access. */
export const AgentTemplate = z.enum(AGENT_TEMPLATES);

export type AgentTemplate = z.infer<typeof AgentTemplate>;

export const Agent = createSelectSchema(agents, {
  id: Id,
  template: AgentTemplate.nullable(),
  provider: AssistantProvider.nullable(),
  createdAt: isoDate,
  updatedAt: isoDate,
}).omit({ orgId: true });

export type Agent = z.infer<typeof Agent>;

/** The plugin's key for one conversation, such as its own conversation id. */
export const AgentConversationKey = z
  .string()
  .regex(/^[A-Za-z0-9._-]{1,128}$/, 'letters, digits, dots, hyphens and underscores');

const WebUrl = z.url({ protocol: /^https?$/ }).max(2000);

const Label = z.string().trim().min(1).max(200);

/**
 * One thing an agent shows below its answer: a picture, a product, a link, or a payment page to
 * pay on. The agent takes every URL and price from the API, never makes one up.
 */
export const AgentBlock = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('image'), url: WebUrl, alt: Label.nullable().default(null) }),
  z.object({
    kind: z.literal('product'),
    title: Label,
    /** As the shop shows it, with its currency: "450,000₮". */
    price: z.string().trim().max(50).nullable().default(null),
    text: z.string().trim().max(500).nullable().default(null),
    imageUrl: WebUrl.nullable().default(null),
    url: WebUrl.nullable().default(null),
  }),
  z.object({ kind: z.literal('link'), title: Label, url: WebUrl }),
  z.object({
    kind: z.literal('payment'),
    title: Label,
    url: WebUrl,
    amount: z.string().trim().max(50).nullable().default(null),
  }),
]);

export type AgentBlock = z.infer<typeof AgentBlock>;

/** The most blocks one answer shows. */
export const AGENT_BLOCKS_MAX = 10;

/** What a run answered: its text, and what it showed below it. */
export const AgentAnswer = z.object({
  answer: z.string(),
  blocks: z.array(AgentBlock).max(AGENT_BLOCKS_MAX),
});

/** What `core.agent.finished` carries to the plugin that sent the message: the run's answer. */
export const AgentFinished = AgentAnswer.extend({
  agentId: Id,
  plugin: PluginName,
  key: AgentConversationKey,
});

/** What `core.agent.failed` carries to the plugin: why the run gave no answer. */
export const AgentFailed = z.object({
  agentId: Id,
  plugin: PluginName,
  key: AgentConversationKey,
  reason: z.string(),
});

/**
 * What an agent says and runs on. No defaults here: zod applies a default inside `.partial()`
 * too, so a change of its instructions alone would clear its provider and portal.
 */
export const AgentSettings = z.object({
  name: z.string().trim().min(1).max(100),
  instructions: z.string().trim().min(1).max(12_000),
  /** Null: the organisation's default provider and its default model. */
  provider: AssistantProvider.nullable(),
  model: AssistantModelId.nullable(),
  /**
   * The portal whose customers it serves: it acts for the customer a conversation is with,
   * through that portal's plugin routes. Null: it acts for nobody but itself.
   */
  portalId: Id.nullable(),
});

export type AgentSettings = z.infer<typeof AgentSettings>;

/** What it may do: the rules of its API key, as a regular key's (`apiKeys.update` changes them later). */
const AgentAccess = z.object({
  areas: ApiKeyAreas,
  pluginAccess: ApiKeyPlugins.default({}),
  actions: ApiKeyActions.default({}),
});

/** A new agent: its settings, the template it came from and what it may do. */
export const NewAgent = AgentSettings.extend({
  provider: AgentSettings.shape.provider.default(null),
  model: AgentSettings.shape.model.default(null),
  portalId: AgentSettings.shape.portalId.default(null),
  template: AgentTemplate.nullable().default(null),
  access: AgentAccess,
});

export type NewAgent = z.infer<typeof NewAgent>;

const {
  ASSISTANT_BUSY,
  ASSISTANT_KEY_UNREADABLE,
  ASSISTANT_NO_CONNECTION,
  BEYOND_OWN_PERMISSIONS,
} = ERRORS;

const base = oc.errors(COMMON_ERRORS);

const running = base.errors({ ASSISTANT_BUSY, ASSISTANT_KEY_UNREADABLE, ASSISTANT_NO_CONNECTION });

/**
 * Agents: bots an admin makes, each with its instructions, model and access. A plugin such as
 * frontline sends them its customers' messages (`submit`); the answer comes back as
 * `core.agent.finished`.
 */
export const agentsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/agents',
      summary: 'List agents',
      description: "The organisation's agents",
    })
    .output(listOf(Agent)),
  get: base
    .route({
      method: 'GET',
      path: '/agents/{id}',
      summary: 'Get an agent',
      description: 'One agent, with the key whose rules it acts by',
    })
    .input(z.object({ id: Id }))
    .output(Agent.extend({ key: ApiKey })),
  create: base
    .errors({ BEYOND_OWN_PERMISSIONS })
    .route({
      method: 'POST',
      path: '/agents',
      successStatus: 201,
      summary: 'Make an agent',
      description:
        "Make an agent with its own API key, which nobody sees: it acts by that key's rules, never beyond yours. 403 BEYOND_OWN_PERMISSIONS: access your role lacks",
    })
    .input(NewAgent)
    .output(Agent),
  update: base
    .route({
      method: 'PATCH',
      path: '/agents/{id}',
      summary: 'Change an agent',
      description: 'Change its name, instructions, model or the portal whose customers it serves',
    })
    .input(AgentSettings.partial().extend({ id: Id }))
    .output(Agent),
  remove: base
    .route({
      method: 'DELETE',
      path: '/agents/{id}',
      summary: 'Delete an agent',
      description: 'Delete an agent and its key; plugins that send to it get 404',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  try: running
    .route({
      method: 'POST',
      path: '/agents/{id}/try',
      summary: 'Try an agent',
      description:
        'Send the agent a message as a test and wait for its answer. Your conversation with it goes on until you start again',
    })
    .input(
      z.object({
        id: Id,
        text: z.string().trim().min(1).max(20_000),
        restart: z.boolean().default(false),
      }),
    )
    .output(AgentAnswer),
  submit: running
    .route({
      method: 'POST',
      path: '/agents/{id}/conversations/{key}/messages',
      summary: 'Send a message to an agent',
      description:
        'A plugin sends a message into one conversation of an agent, starting it on first use. customerId binds the conversation to that customer on its first message and must not change. The run happens on the server; core.agent.finished or core.agent.failed comes back to this plugin. requestId makes a retry land once',
    })
    .input(
      z.object({
        id: Id,
        key: AgentConversationKey,
        customerId: Id.optional(),
        text: z.string().trim().min(1).max(20_000),
        requestId: z.string().min(1).max(128).optional(),
      }),
    )
    .output(z.object({ ok: z.literal(true) })),
};
