import { completeSimple } from '@earendil-works/pi-ai/compat';
import { ROOT_CONVERSATION_ID } from '@earendil-works/pi-durable';
import type { AssistantSendRequest } from '@erxes/core-contract';
import { assistantThreads, caller, type Db, newId, requestOrgId, withOrg } from '@erxes/core-db';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { logger } from '~/logger';
import {
  agentNamed,
  removeAgent,
  startRun,
  stopAgent,
  watchConversation,
} from '~/modules/agents/host';
import { StorageBusy } from '~/modules/agents/storage';
import { readContents } from './attachments';
import type { ProviderKey } from './connectedProviders';
import { modelKey } from './connections.service';
import { modelOf } from './providers';
import { findThread, removeThread } from './threads.service';
import { modelInput, readTurnContext, withTurnContext } from './turnContext';

/** The assistant's agent name; `./agent` registers it under this name. */
export const ASSISTANT_AGENT = 'assistant';

export const MEMBER_ENTRY = 'assistant.user';

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

const cleanTitle = (text: string) =>
  text
    .replace(/^["'`\s]+|["'`.\s]+$/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, TITLE_LIMIT);

const titleThread = async (
  orgId: string,
  threadId: string,
  key: ProviderKey,
  modelId: string,
  prompt: string,
) => {
  const model = modelOf(key, modelId);

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
    const usable = await modelKey(tx, { provider: request.provider, model: request.model });
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

  const modelId = key.model;

  await startRun(
    agentNamed(ASSISTANT_AGENT),
    { orgId, key: thread.id },
    {
      type: 'input',
      content: modelInput(parts, contents),
      entry: { kind: MEMBER_ENTRY, data: StoredParts.parse(parts) },
    },
    { model: { provider: key.provider, modelId }, thinkingLevel: request.thinkingLevel ?? 'off' },
  ).catch((error: unknown) => {
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
