import { BACKGROUND_CONTEXT } from '@earendil-works/chord/context';
import { completeSimple } from '@earendil-works/pi-ai/compat';
import { ROOT_CONVERSATION_ID } from '@earendil-works/pi-durable';
import type { AssistantProvider, AssistantSendRequest } from '@erxes/core-contract';
import { assistantThreads, caller, type Db, newId, requestOrgId, withOrg } from '@erxes/core-db';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { logger } from '~/logger';
import {
  agentNamed,
  removeAgent,
  stopAgent,
  watchConversation,
  withHarness,
} from '~/modules/agents/host';
import { StorageBusy } from '~/modules/agents/storage';
import { readContents } from './attachments';
import { findConnection, openKey } from './connections.service';
import { DEFAULT_MODELS, modelOf, unreadableKey } from './providers';
import { findThread, removeThread } from './threads.service';
import { modelInput, readTurnContext, withTurnContext } from './turnContext';

/** The assistant's agent name; `./agent` registers it under this name. */
export const ASSISTANT_AGENT = 'assistant';

const TITLE_INSTRUCTIONS =
  'Write a short title of at most six words for a conversation that starts with the message below. Use the language of the message. Reply with the title only, without quotes or punctuation at the end.';

const TITLE_LIMIT = 120;

const log = logger.child({ component: 'assistant' });

/** The message's parts as the transcript keeps them, for the panel to show. */
const StoredParts = z.array(z.json());

const createThread = async (client: Db) => {
  const [row] = await client
    .insert(assistantThreads)
    .values({ id: newId(), userId: caller('user').userId })
    .returning();

  if (!row) throw new Error('The new thread was not returned');

  return row;
};

const usableKey = async (client: Db, provider: AssistantProvider | undefined) => {
  const connection = await findConnection(client, provider);

  if (!connection) {
    throw fail('ASSISTANT_NO_CONNECTION', 'Add a model provider key to use the assistant');
  }

  const apiKey = openKey(connection.sealedKey);

  if (apiKey === null) throw fail('ASSISTANT_KEY_UNREADABLE', unreadableKey(connection.provider));

  return { provider: connection.provider, apiKey };
};

const cleanTitle = (text: string) =>
  text
    .replace(/^["'`\s]+|["'`.\s]+$/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, TITLE_LIMIT);

const titleThread = async (
  orgId: string,
  threadId: string,
  key: { provider: AssistantProvider; apiKey: string },
  modelId: string,
  prompt: string,
) => {
  const model = modelOf(key.provider, modelId);

  if (!model || !prompt) return;

  const answer = await completeSimple(
    model,
    {
      systemPrompt: TITLE_INSTRUCTIONS,
      messages: [{ role: 'user', content: prompt.slice(0, 2000), timestamp: Date.now() }],
    },
    { apiKey: key.apiKey, maxTokens: 64, signal: AbortSignal.timeout(30_000) },
  );

  const title = cleanTitle(
    answer.content.flatMap((part) => (part.type === 'text' ? [part.text] : [])).join(''),
  );

  if (!title) return;

  await withOrg(orgId, (tx) =>
    tx
      .update(assistantThreads)
      .set({ title })
      .where(and(eq(assistantThreads.id, threadId), isNull(assistantThreads.title))),
  );
};

/**
 * Sends the member's message to a thread's conversation, starting the thread without an id. The
 * reply runs on this server; the panel follows it with `watchThread`.
 */
export const sendMessage = async (request: AssistantSendRequest) => {
  const orgId = requestOrgId();
  const turn = await withOrg(orgId, () => readTurnContext(request.message));
  const contents = await readContents(orgId, [...turn.files, ...turn.snapshots]);

  const { thread, key, parts } = await withOrg(orgId, async (tx) => {
    const usable = await usableKey(tx, request.provider);
    const row = request.threadId ? await findThread(tx, request.threadId) : await createThread(tx);

    await tx
      .update(assistantThreads)
      .set({ updatedAt: sql`now()` })
      .where(eq(assistantThreads.id, row.id));

    return {
      thread: row,
      key: usable,
      parts: await withTurnContext(tx, row.id, request.message.parts, turn),
    };
  });

  const modelId = request.model ?? DEFAULT_MODELS[key.provider];

  await withHarness(agentNamed(ASSISTANT_AGENT), { orgId, key: thread.id }, async (harness) => {
    const root = await harness.root(BACKGROUND_CONTEXT);

    await root.configure(
      {
        model: { provider: key.provider, modelId },
        thinkingLevel: request.thinkingLevel ?? 'off',
      },
      BACKGROUND_CONTEXT,
    );

    await root.submit(
      {
        type: 'input',
        content: modelInput(parts, contents),
        entry: { kind: 'assistant.user', data: StoredParts.parse(parts) },
      },
      BACKGROUND_CONTEXT,
    );
  }).catch((error: unknown) => {
    if (error instanceof StorageBusy) {
      throw fail('ASSISTANT_BUSY', 'Another server is writing in this thread; try again shortly');
    }

    throw error;
  });

  if (thread.title === null) {
    const prompt = parts
      .flatMap((part) =>
        part.type === 'text' && typeof part['text'] === 'string' ? [part['text']] : [],
      )
      .join(' ')
      .trim();

    titleThread(orgId, thread.id, key, modelId, prompt).catch((error: unknown) => {
      log.warn({ err: error, threadId: thread.id }, 'assistant: no title for the thread');
    });
  }

  return { threadId: thread.id };
};

/** The thread's conversation as it commits; see `watchConversation`. */
export async function* watchThread(id: string, signal: AbortSignal) {
  const orgId = requestOrgId();

  await withOrg(orgId, (tx) => findThread(tx, id));

  yield* watchConversation(
    agentNamed(ASSISTANT_AGENT),
    { orgId, key: id },
    ROOT_CONVERSATION_ID,
    signal,
  );
}

/** Stops the thread's reply on whichever server writes it; what it wrote stays. */
export const stopThread = async (client: Db, id: string) => {
  const thread = await findThread(client, id);

  await stopAgent(client, agentNamed(ASSISTANT_AGENT), { orgId: thread.orgId, key: thread.id });

  return { ok: true as const };
};

/** Deletes a thread with its conversation. */
export const deleteThread = async (client: Db, id: string) => {
  const thread = await findThread(client, id);

  await removeAgent(client, agentNamed(ASSISTANT_AGENT), { orgId: thread.orgId, key: thread.id });

  return removeThread(client, id);
};
