import { BACKGROUND_CONTEXT } from '@earendil-works/chord/context';
import type { Op } from '@earendil-works/chord/delta';
import {
  type ConversationId,
  type ConversationView,
  createRegistry,
  Harness,
  ROOT_CONVERSATION_ID,
} from '@earendil-works/pi-durable';
import { Repeater } from '@repeaterjs/repeater';
import { eq, sql } from 'drizzle-orm';
import { type Db, schema } from '@erxes/core-db';
import { logger } from '~/logger';
import { liveHub, type LiveSignal } from '~/modules/live/hub';
import type { Agent, AgentScope } from './agent';
import { isPluginAgent, pluginAgent } from './pluginAgents';
import { openAgentStorage, StorageBusy } from './storage';

/** How long a conversation nothing uses or runs stays open on this server. */
const IDLE_MS = 60_000;

const log = logger.child({ component: 'agents' });

interface Running {
  harness: Harness;
  holds: number;
  idle?: NodeJS.Timeout;
}

const running = new Map<string, Promise<Running>>();

const agents = new Map<string, Agent>();

/** Makes an agent available by its name; the app registers each agent once at start. */
export const registerAgent = (agent: Agent) => {
  agents.set(agent.name, agent);
};

/** A registered agent, or a plugin's (`frontline.bot`), whose setup reads its manifest. */
export const agentNamed = (name: string) => {
  const agent = agents.get(name) ?? (isPluginAgent(name) ? pluginAgent(name) : undefined);

  if (!agent) throw new Error(`No agent is named ${name}`);

  return agent;
};

const storageKeyOf = (agent: Agent, key: string) => `${agent.name}:${key}`;

const open = async (agent: Agent, scope: AgentScope, readOnly: boolean) => {
  const storageKey = storageKeyOf(agent, scope.key);
  const storage = await openAgentStorage(scope.orgId, storageKey, { readOnly });

  try {
    const setup = await agent.setup(scope);
    const registry = createRegistry();

    for (const extension of setup.extensions) registry.install(extension);

    const harness = await Harness.open(
      storage,
      {
        models: setup.models,
        registry,
        readOnly,
        ...(setup.settings ? { settings: setup.settings } : {}),
        onReport: (report) =>
          log.warn(
            { err: report.error, kind: report.kind, storageKey },
            'agents: the harness reported a failure',
          ),
      },
      BACKGROUND_CONTEXT,
    );

    if (!readOnly)
      await harness.root(BACKGROUND_CONTEXT, setup.agent ? { agent: setup.agent } : {});

    return harness;
  } catch (error) {
    await storage.close(BACKGROUND_CONTEXT).catch(() => undefined);
    throw error;
  }
};

const close = async (storageKey: string, entry: Running) => {
  running.delete(storageKey);
  await entry.harness.close(BACKGROUND_CONTEXT).catch((error: unknown) => {
    log.warn({ err: error, storageKey }, 'agents: could not close a conversation');
  });
};

const closeWhenIdle = (storageKey: string, entry: Running) => {
  clearTimeout(entry.idle);
  entry.idle = setTimeout(() => {
    const wake = entry.harness.wake();

    if (entry.holds > 0) return;

    if (wake.active || wake.at !== undefined) closeWhenIdle(storageKey, entry);
    else void close(storageKey, entry);
  }, IDLE_MS);
  entry.idle.unref();
};

const start = (agent: Agent, scope: AgentScope, storageKey: string) => {
  const started = open(agent, scope, false).then((harness) => {
    const entry: Running = { harness, holds: 0 };

    // A storage error or a lost lease ends the Harness; the next use opens it again.
    void harness.closed.finally(() => {
      clearTimeout(entry.idle);

      if (running.get(storageKey) === started) running.delete(storageKey);
    });

    return entry;
  });

  running.set(storageKey, started);
  started.catch(() => {
    if (running.get(storageKey) === started) running.delete(storageKey);
  });

  return started;
};

/** The conversation's Harness on this server, held until `release()`; rejects with `StorageBusy`. */
const hold = async (agent: Agent, scope: AgentScope) => {
  const storageKey = storageKeyOf(agent, scope.key);
  const entry = await (running.get(storageKey) ?? start(agent, scope, storageKey));

  entry.holds += 1;
  clearTimeout(entry.idle);

  return {
    harness: entry.harness,
    release: () => {
      entry.holds -= 1;

      if (entry.holds === 0) closeWhenIdle(storageKey, entry);
    },
  };
};

/**
 * Runs `fn` with the conversation's Harness on this server, opening it when no server runs it.
 * Rejects with `StorageBusy` while another server does. The Harness stays open while `fn` runs,
 * and closes once nothing uses or runs it for a minute.
 */
export const withHarness = async <T>(
  agent: Agent,
  scope: AgentScope,
  fn: (harness: Harness) => Promise<T>,
) => {
  const held = await hold(agent, scope);

  try {
    return await fn(held.harness);
  } finally {
    held.release();
  }
};

/** Reads a conversation another server runs: a read-only Harness over what it committed. */
const readView = async (agent: Agent, scope: AgentScope, conversationId: ConversationId) => {
  const harness = await open(agent, scope, true);

  try {
    const conversation = await harness.conversation(conversationId, BACKGROUND_CONTEXT);

    if (!conversation) return null;

    const watch = await conversation.watch(BACKGROUND_CONTEXT);

    await watch.stop();

    return watch.value;
  } finally {
    await harness.close(BACKGROUND_CONTEXT);
  }
};

/** A conversation as a browser follows it: the view, then the Chord operations of each change. */
export type AgentWatchEvent = { value: ConversationView } | { ops: readonly Op[] };

/**
 * The conversation as this server commits it, until the client leaves or the Harness closes. A
 * change waits until the client took the one before, so pi folds the changes made meanwhile.
 */
const followHere = (harness: Harness, conversationId: ConversationId, signal: AbortSignal) =>
  new Repeater<AgentWatchEvent>(async (push, stop) => {
    const conversation = await harness.conversation(conversationId, BACKGROUND_CONTEXT);

    if (!conversation) {
      stop();

      return;
    }

    const watch = await conversation.watch(BACKGROUND_CONTEXT);

    signal.addEventListener('abort', () => stop(), { once: true });
    void watch.closed.finally(() => stop());
    watch.start(async (call) => {
      if (call.kind === 'value') await push({ ops: call.ops });
    });
    await push({ value: watch.value });
    await stop;
    await watch.stop();
  });

/**
 * Follows one conversation. The server running it streams each change as it commits, until the
 * client leaves or the Harness closes. Any other server sends what is stored and ends; the client
 * watches again a moment later.
 */
export async function* watchConversation(
  agent: Agent,
  scope: AgentScope,
  conversationId: ConversationId,
  signal: AbortSignal,
): AsyncGenerator<AgentWatchEvent> {
  const held = await hold(agent, scope).catch((error: unknown) => {
    if (error instanceof StorageBusy) return null;

    throw error;
  });

  if (!held) {
    const value = await readView(agent, scope, conversationId);

    if (value) yield { value };

    return;
  }

  try {
    yield* followHere(held.harness, conversationId, signal);
  } finally {
    held.release();
  }
}

const stopHere = async (storageKey: string) => {
  const started = running.get(storageKey);

  if (!started) return;

  const { harness } = await started;
  const conversation = await harness.conversation(ROOT_CONVERSATION_ID, BACKGROUND_CONTEXT);

  await conversation?.abort(BACKGROUND_CONTEXT);
};

/**
 * Stops the root conversation's run: here when this server runs it, else on the server that
 * does, once `client`'s transaction commits. What the run wrote stays.
 */
export const stopAgent = async (client: Db, agent: Agent, scope: AgentScope) => {
  const storageKey = storageKeyOf(agent, scope.key);

  if (running.has(storageKey)) {
    await stopHere(storageKey);

    return;
  }

  const signal = JSON.stringify({ o: scope.orgId, k: 'agent-stop', s: storageKey });

  await client.execute(sql`select pg_notify('core_live', ${signal})`);
};

liveHub.on('signal', (signal: LiveSignal) => {
  if (signal.k !== 'agent-stop') return;

  stopHere(signal.s).catch((error: unknown) => {
    log.warn({ err: error, storageKey: signal.s }, 'agents: could not stop a conversation');
  });
});

const STORAGE_TABLES = [
  schema.agentDurableMetadata,
  schema.agentRecordIds,
  schema.agentConversations,
  schema.agentEntries,
  schema.agentTasks,
  schema.agentSubmissions,
  schema.agentDocuments,
  schema.agentDocumentRevisions,
];

/**
 * Deletes everything `scope`'s storage holds, in `client`'s transaction, and closes it on this
 * server. A server that still runs it loses its lease at its next commit.
 */
export const removeAgent = async (client: Db, agent: Agent, scope: AgentScope) => {
  const storageKey = storageKeyOf(agent, scope.key);
  const entry = await running.get(storageKey)?.catch(() => null);

  if (entry) await close(storageKey, entry);

  await client.execute(sql`select set_config('pi.storage_key', ${storageKey}, true)`);
  await Promise.all(
    STORAGE_TABLES.map((table) => client.delete(table).where(eq(table.storageKey, storageKey))),
  );
};

/** Closes every conversation this server runs, at shutdown; their tasks resume elsewhere. */
export const closeAgents = () =>
  Promise.all(
    [...running.entries()].map(async ([storageKey, started]) =>
      close(storageKey, await started).catch(() => undefined),
    ),
  );
