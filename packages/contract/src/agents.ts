import { AGENT_API_TOOLS, AGENT_RUN_STATUSES, AGENT_TEMPLATES } from '@erxes/core-db/enums';
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

/** The conversation a run event is about, and the plugin that talks in it (only it gets the event). */
const AgentRunEvent = z.object({ agentId: Id, plugin: PluginName, key: AgentConversationKey });

/** What `core.agent.finished` carries to the plugin that sent the message: the run's answer. */
export const AgentFinished = AgentAnswer.extend(AgentRunEvent.shape);

/** What `core.agent.failed` carries to the plugin: why the run gave no answer. */
export const AgentFailed = AgentRunEvent.extend({ reason: z.string() });

/**
 * What `core.agent.handed_off` carries to the plugin: the agent gave the conversation to a person,
 * and why. It comes after the run's `core.agent.finished`, whose answer tells the customer.
 */
export const AgentHandedOff = AgentRunEvent.extend({ reason: z.string() });

/** The most calls a run lists. */
export const AGENT_CALLS_MAX = 50;

/** One searchApi or callApi call of a run, and how it went. */
export const AgentCall = z.object({
  /** The model's id for the call, unique in its conversation. */
  id: z.string(),
  tool: z.enum(AGENT_API_TOOLS),
  /** callApi's procedure. */
  procedure: z.string().nullable(),
  /** searchApi's words. */
  query: z.string().nullable(),
  ok: z.boolean(),
  /** The HTTP status of a call that failed, when it had one. */
  status: z.int().nullable(),
  code: z.string().nullable(),
  message: z.string().nullable(),
});

/** One run of a conversation: the message it answered, the model, its calls and how it ended. */
export const AgentRun = z.object({
  at: isoDate(),
  text: z.string(),
  answer: z.string(),
  model: z.string().nullable(),
  status: z.enum(AGENT_RUN_STATUSES),
  /** Why a failed run gave no answer. */
  failure: z.string().nullable(),
  /** Why the agent handed the conversation to a person in this run. */
  handedOff: z.string().nullable(),
  calls: z.array(AgentCall).max(AGENT_CALLS_MAX),
});

export type AgentRun = z.infer<typeof AgentRun>;

/** The most conversations and runs `runs` answers. */
export const AGENT_RUNS_MAX = 10;

/** A conversation's latest runs, newest first; a member's own Try it has no plugin. */
export const AgentConversation = z.object({
  key: AgentConversationKey,
  plugin: PluginName.nullable(),
  customerId: Id.nullable(),
  runs: z.array(AgentRun).max(AGENT_RUNS_MAX),
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

/** The provider and model an agent runs on now: its own, or the organisation's default. */
const AgentModel = z.object({ provider: AssistantProvider, model: z.string() });

const ConversationRef = z.object({ id: Id, key: AgentConversationKey });

const {
  AGENT_RUN_FAILED,
  ASSISTANT_BUSY,
  ASSISTANT_KEY_UNREADABLE,
  ASSISTANT_NO_CONNECTION,
  BEYOND_OWN_PERMISSIONS,
} = ERRORS;

const base = oc.errors(COMMON_ERRORS);

const running = base.errors({
  AGENT_RUN_FAILED,
  ASSISTANT_BUSY,
  ASSISTANT_KEY_UNREADABLE,
  ASSISTANT_NO_CONNECTION,
});

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
      description:
        'One agent, with the key whose rules it acts by, the model it runs on now (null with no AI provider connected) and the plugins that send it messages',
    })
    .input(z.object({ id: Id }))
    .output(
      Agent.extend({
        key: ApiKey,
        runsOn: AgentModel.nullable(),
        plugins: z.array(PluginName),
      }),
    ),
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
        "Send the agent a message as a test and wait for its answer, with the model that gave it. Your conversation with it goes on until you start again. It talks as a visitor who hasn't signed in, so with a portal it has the portal's guest routes, such as checkout. 502 AGENT_RUN_FAILED: the run ended without an answer, such as when the AI provider refused it, and the message says why",
    })
    .input(
      z.object({
        id: Id,
        text: z.string().trim().min(1).max(20_000),
        restart: z.boolean().default(false),
      }),
    )
    .output(AgentAnswer.extend({ model: z.string(), handedOff: z.string().nullable() })),
  runs: base
    .route({
      method: 'GET',
      path: '/agents/{id}/runs',
      summary: "List an agent's runs",
      description: `The latest runs of one conversation (key), or of the agent's latest conversations, each with its model and its searchApi and callApi calls. A plugin reads only the conversations it talks in; 404 for another's key. At most ${AGENT_RUNS_MAX} conversations and ${AGENT_RUNS_MAX} runs each`,
    })
    .input(z.object({ id: Id, key: AgentConversationKey.optional() }))
    .output(z.object({ data: z.array(AgentConversation).max(AGENT_RUNS_MAX) })),
  restart: base
    .route({
      method: 'POST',
      path: '/agents/{id}/conversations/{key}/restart',
      summary: 'Restart an agent conversation',
      description:
        'Forget what the agent said in one conversation, so its next message starts afresh. The conversation keeps its plugin and customer. A plugin restarts only the conversations it talks in; 404 for another',
    })
    .input(ConversationRef)
    .output(z.object({ ok: z.literal(true) })),
  submit: running
    .route({
      method: 'POST',
      path: '/agents/{id}/conversations/{key}/messages',
      summary: 'Send a message to an agent',
      description:
        'A plugin sends a message into one conversation of an agent, starting it on first use. customerId binds the conversation to that customer on its first message and must not change. The run happens on the server; core.agent.finished or core.agent.failed comes back to this plugin, and core.agent.handed_off after finished when the agent gives the conversation to a person. requestId makes a retry land once',
    })
    .input(
      ConversationRef.extend({
        customerId: Id.optional(),
        text: z.string().trim().min(1).max(20_000),
        requestId: z.string().min(1).max(128).optional(),
      }),
    )
    .output(z.object({ ok: z.literal(true) })),
};
