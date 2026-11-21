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

const AgentFields = z.object({
  name: z.string().trim().min(1).max(100),
  instructions: z.string().trim().min(1).max(12_000),
  /** Null: the organisation's default provider and its default model. */
  provider: AssistantProvider.nullable().default(null),
  model: AssistantModelId.nullable().default(null),
  /** It acts for the customer a conversation is with, through plugins' website and customer routes. */
  customers: z.boolean().default(false),
});

/** What it may do: the rules of its API key, as a regular key's (`apiKeys.update` changes them later). */
const AgentAccess = z.object({
  areas: ApiKeyAreas,
  pluginAccess: ApiKeyPlugins.default({}),
  actions: ApiKeyActions.default({}),
});

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
    .route({ method: 'GET', path: '/agents', summary: "The organisation's agents" })
    .output(listOf(Agent)),
  get: base
    .route({
      method: 'GET',
      path: '/agents/{id}',
      summary: 'One agent, with the key whose rules it acts by',
    })
    .input(z.object({ id: Id }))
    .output(Agent.extend({ key: ApiKey })),
  create: base
    .errors({ BEYOND_OWN_PERMISSIONS })
    .route({
      method: 'POST',
      path: '/agents',
      successStatus: 201,
      summary:
        "Make an agent with its own API key, which nobody sees: it acts by that key's rules, never beyond yours. 403 BEYOND_OWN_PERMISSIONS: access your role lacks",
    })
    .input(
      AgentFields.extend({ template: AgentTemplate.nullable().default(null), access: AgentAccess }),
    )
    .output(Agent),
  update: base
    .route({
      method: 'PATCH',
      path: '/agents/{id}',
      summary: 'Change its name, instructions, model or who it talks to',
    })
    .input(AgentFields.partial().extend({ id: Id }))
    .output(Agent),
  remove: base
    .route({
      method: 'DELETE',
      path: '/agents/{id}',
      summary: 'Delete an agent and its key; plugins that send to it get 404',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  try: running
    .route({
      method: 'POST',
      path: '/agents/{id}/try',
      summary:
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
      summary:
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
