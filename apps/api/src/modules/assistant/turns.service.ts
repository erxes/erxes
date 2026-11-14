import { ASSISTANT_DATA_PARTS, type AssistantChatRequest } from '@erxes/core-contract';
import {
  type AssistantMessagePart,
  assistantMessages,
  assistantThreads,
  caller,
  type Db,
} from '@erxes/core-db';
import { safeValidateUIMessages, type ToolSet, type UIMessage } from 'ai';
import { and, eq, isNull, max, sql } from 'drizzle-orm';
import { HttpError, notFound, pgCode } from '~/http/errors';
import { findConnection, openKey } from './connections.service';
import { continueReply } from './continuation';
import { unreadableKey } from './providers';
import { isRunning, ownThread, threadMessages } from './threads.service';
import { type TurnContext, withTurnContext } from './turnContext';

const lockThread = async (client: Db, id: string) => {
  const [row] = await client
    .select()
    .from(assistantThreads)
    .where(and(ownThread(), eq(assistantThreads.id, id)))
    .for('update')
    .limit(1);

  if (!row) throw notFound('Thread');

  if (isRunning(row)) {
    throw new HttpError(409, 'ASSISTANT_BUSY', 'A reply is still being written in this thread');
  }

  return row;
};

const createThread = async (client: Db, id: string) => {
  const [row] = await client
    .insert(assistantThreads)
    .values({ id, userId: caller('user').userId })
    .returning();

  if (!row) throw new Error('The new thread was not returned');

  return row;
};

const nextPosition = async (client: Db, threadId: string) => {
  const [row] = await client
    .select({ last: max(assistantMessages.position) })
    .from(assistantMessages)
    .where(eq(assistantMessages.threadId, threadId));

  return (row?.last ?? -1) + 1;
};

const partsOf = (message: UIMessage): AssistantMessagePart[] => message.parts;

const validated = async (messages: unknown[], tools: ToolSet) => {
  const result = await safeValidateUIMessages({
    messages,
    tools,
    dataSchemas: ASSISTANT_DATA_PARTS,
  });

  if (!result.success) {
    throw new HttpError(
      400,
      'ASSISTANT_INVALID_MESSAGE',
      'The message is not a valid chat message',
      {
        reason: result.error.message.slice(0, 500),
      },
    );
  }

  return result.data;
};

const addUserMessage = async (client: Db, threadId: string, message: UIMessage) => {
  try {
    await client.insert(assistantMessages).values({
      threadId,
      id: message.id,
      role: 'user',
      parts: partsOf(message),
      position: await nextPosition(client, threadId),
    });
  } catch (error) {
    if (pgCode(error) === '23505') {
      throw new HttpError(409, 'ASSISTANT_MESSAGE_EXISTS', 'This message is already in the thread');
    }

    throw error;
  }
};

export const beginTurn = async (
  client: Db,
  request: AssistantChatRequest,
  tools: ToolSet,
  turn: { threadId: string; context: TurnContext },
) => {
  const connection = await findConnection(client, request.provider);

  if (!connection) {
    throw new HttpError(
      400,
      'ASSISTANT_NO_CONNECTION',
      'Add a model provider key to use the assistant',
    );
  }

  const apiKey = openKey(connection.sealedKey);

  if (apiKey === null) {
    throw new HttpError(400, 'ASSISTANT_KEY_UNREADABLE', unreadableKey(connection.provider));
  }

  const thread = request.threadId
    ? await lockThread(client, request.threadId)
    : await createThread(client, turn.threadId);

  const stored = (await threadMessages(client, thread.id)).map(({ id, role, parts }) => ({
    id,
    role,
    parts,
  }));

  const continuing = request.message.role === 'assistant';

  const sent = continuing
    ? request.message
    : {
        ...request.message,
        parts: await withTurnContext(client, thread.id, request.message.parts, turn.context),
      };

  const history = continuing
    ? [...stored.slice(0, -1), continueReply(stored.at(-1), sent)]
    : [...stored, sent];

  const messages = await validated(history, tools);
  const latest = messages.at(-1);

  if (!latest) throw new Error('A turn has at least one message');

  if (continuing) {
    await client
      .update(assistantMessages)
      .set({ parts: partsOf(latest), updatedAt: sql`now()` })
      .where(and(eq(assistantMessages.threadId, thread.id), eq(assistantMessages.id, latest.id)));
  } else {
    await addUserMessage(client, thread.id, latest);
  }

  await client
    .update(assistantThreads)
    .set({ runningSince: sql`now()`, updatedAt: sql`now()` })
    .where(eq(assistantThreads.id, thread.id));

  return { thread, messages, provider: connection.provider, apiKey };
};

export const saveReply = async (client: Db, threadId: string, message: UIMessage | null) => {
  if (message) {
    await client
      .insert(assistantMessages)
      .values({
        threadId,
        id: message.id,
        role: 'assistant',
        parts: partsOf(message),
        position: await nextPosition(client, threadId),
      })
      .onConflictDoUpdate({
        target: [assistantMessages.threadId, assistantMessages.id],
        set: { parts: partsOf(message), updatedAt: sql`now()` },
      });
  }

  await client
    .update(assistantThreads)
    .set({ runningSince: null, updatedAt: sql`now()` })
    .where(eq(assistantThreads.id, threadId));
};

export const setTitle = (client: Db, threadId: string, title: string) =>
  client
    .update(assistantThreads)
    .set({ title })
    .where(and(eq(assistantThreads.id, threadId), isNull(assistantThreads.title)));
