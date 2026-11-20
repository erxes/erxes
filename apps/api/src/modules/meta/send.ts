import type { MetaSendInput } from '@erxes/core-contract';
import { type Db, metaSends, withOrg } from '@erxes/core-db';
import { and, eq, lt, sql } from 'drizzle-orm';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { inOrder } from '~/lib/sequence';
import { readFileBytes } from '~/modules/files/files.service';
import { type ConnectionRow, findConnection, markRefused, tokenOf } from './connections.service';
import { graph, MetaRefused } from './graph';

const LOVE = 'love';

const STALE_CLAIM = '2 minutes';

const Sent = z.object({ message_id: z.string() });

const Created = z.object({ id: z.string() });

interface FilePart {
  name: string;
  contentType: string;
  body: Buffer;
}

const formOf = (fields: Record<string, unknown>, fileField: string, file: FilePart) => {
  const form = new FormData();

  for (const [name, value] of Object.entries(fields))
    form.set(name, typeof value === 'string' ? value : JSON.stringify(value));

  form.set(fileField, new Blob([new Uint8Array(file.body)], { type: file.contentType }), file.name);

  return form;
};

const refusedWith4xx = (error: unknown) =>
  error instanceof MetaRefused && error.status >= 400 && error.status < 500;

const sendMessage = async (
  token: string,
  input: Extract<MetaSendInput, { kind: 'message' }>,
  files: FilePart[],
) => {
  const fields = {
    recipient: { id: input.recipientId },
    ...(input.humanAgent
      ? { messaging_type: 'MESSAGE_TAG', tag: 'HUMAN_AGENT' }
      : { messaging_type: 'RESPONSE' }),
  };

  const send = async (part: FilePart | null, quote: string | undefined) => {
    const replyTo = quote ? { reply_to: { mid: quote } } : {};

    const body = part
      ? {
          form: formOf(
            {
              ...fields,
              message: {
                ...replyTo,
                attachment: {
                  type: part.contentType.startsWith('image/') ? 'image' : 'file',
                  payload: { is_reusable: false },
                },
              },
            },
            'filedata',
            part,
          ),
        }
      : { body: { ...fields, message: { ...replyTo, text: input.text } } };

    return Sent.parse(await graph('me/messages', token, { method: 'POST', ...body })).message_id;
  };

  const parts: (FilePart | null)[] = [...(input.text ? [null] : []), ...files];
  const ids: string[] = [];

  await inOrder(parts, async (part, index) => {
    const quote = index === 0 ? input.replyToMessageId : undefined;

    const id = await send(part, quote).catch((error: unknown) => {
      if (!quote || !refusedWith4xx(error)) throw error;

      return send(part, undefined);
    });

    ids.push(id);
  });

  return ids[0] ?? null;
};

const replyToComment = async (
  row: ConnectionRow,
  token: string,
  input: Extract<MetaSendInput, { kind: 'comment_reply' }>,
  file: FilePart | undefined,
) => {
  if (row.kind === 'instagram') {
    if (file) throw fail('META_REFUSED', 'Instagram comment replies take text only');

    return Created.parse(
      await graph(`${input.commentId}/replies`, token, {
        method: 'POST',
        body: { message: input.text },
      }),
    ).id;
  }

  const fields = { message: input.text };

  return Created.parse(
    await graph(`${input.commentId}/comments`, token, {
      method: 'POST',
      ...(file ? { form: formOf(fields, 'source', file) } : { body: fields }),
    }),
  ).id;
};

const react = async (token: string, input: Extract<MetaSendInput, { kind: 'reaction' }>) => {
  await graph('me/messages', token, {
    method: 'POST',
    body: {
      recipient: { id: input.recipientId },
      sender_action: input.on ? 'react' : 'unreact',
      payload: input.on
        ? { message_id: input.messageId, reaction: LOVE }
        : { message_id: input.messageId },
    },
  });

  return null;
};

const likeComment = async (row: ConnectionRow, token: string, commentId: string) => {
  if (row.kind === 'instagram') throw fail('META_REFUSED', 'Instagram comments take no likes');

  await graph(`${commentId}/likes`, token, { method: 'POST' });

  return null;
};

const filesOf = (orgId: string, ids: string[]) =>
  Promise.all(
    ids.map(async (id) => {
      const { row, body } = await readFileBytes(orgId, id);

      return { name: row.name, contentType: row.contentType, body };
    }),
  );

const perform = async (orgId: string, row: ConnectionRow, input: MetaSendInput) => {
  const token = tokenOf(row);

  switch (input.kind) {
    case 'message':
      return sendMessage(token, input, await filesOf(orgId, input.fileIds));
    case 'comment_reply':
      return replyToComment(
        row,
        token,
        input,
        input.fileId ? (await filesOf(orgId, [input.fileId]))[0] : undefined,
      );
    case 'reaction':
      return react(token, input);
    case 'comment_like':
      return likeComment(row, token, input.commentId);
  }
};

const claim = (orgId: string, input: MetaSendInput) =>
  withOrg(orgId, async (tx) => {
    const row = await findConnection(tx, input.connectionId);

    const [claimed] = await tx
      .insert(metaSends)
      .values({ idempotencyKey: input.idempotencyKey, connectionId: row.id })
      .onConflictDoNothing()
      .returning({ key: metaSends.idempotencyKey });

    if (claimed) return { row, done: null };

    const [retaken] = await tx
      .update(metaSends)
      .set({ createdAt: sql`now()` })
      .where(
        and(
          eq(metaSends.idempotencyKey, input.idempotencyKey),
          sql`${metaSends.result} is null`,
          lt(metaSends.createdAt, sql`now() - ${STALE_CLAIM}::interval`),
        ),
      )
      .returning({ key: metaSends.idempotencyKey });

    if (retaken) return { row, done: null };

    const [existing] = await tx
      .select({ result: metaSends.result })
      .from(metaSends)
      .where(eq(metaSends.idempotencyKey, input.idempotencyKey))
      .limit(1);

    if (!existing?.result) throw fail('SEND_IN_PROGRESS', 'This send is still going');

    return { row, done: existing.result };
  });

export const sendOnce = async (orgId: string, input: MetaSendInput) => {
  const { row, done } = await claim(orgId, input);

  if (done) return done;

  try {
    const id = await perform(orgId, row, input);
    const result = { id };

    await withOrg(orgId, (tx) =>
      tx
        .update(metaSends)
        .set({ result })
        .where(eq(metaSends.idempotencyKey, input.idempotencyKey)),
    );

    return result;
  } catch (error) {
    await withOrg(orgId, (tx) =>
      tx.delete(metaSends).where(eq(metaSends.idempotencyKey, input.idempotencyKey)),
    );
    await markRefused(orgId, row.id, error);

    if (error instanceof MetaRefused) throw fail('META_REFUSED', `Meta refused: ${error.message}`);

    throw error;
  }
};

export const pruneSends = (client: Db, days: number) =>
  client
    .delete(metaSends)
    .where(lt(metaSends.createdAt, sql`now() - make_interval(days => ${days})`));
