import type { CursorQuery } from '@erxes/core-contract';
import { callerUserId, type Db, type EmailNode, emailTemplates, newId } from '@erxes/core-db';
import { eq, getTableColumns, ilike, sql } from 'drizzle-orm';
import { config } from '~/config';
import { fail, notFound } from '~/http/errors';
import { containsPattern, keysetPage } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';

/** Templates come with self-hosted erxes; on SaaS each call is 402 NOT_IN_PLAN. */
const selfHostedOnly = () => {
  if (config.saas.enabled) throw fail('NOT_IN_PLAN', 'Email templates come with self-hosted erxes');
};

/** A list leaves the documents out: one is read when it is used. */
const { content: _content, ...itemColumns } = getTableColumns(emailTemplates);

const findTemplate = async (client: Db, id: string) => {
  const [row] = await client
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.id, id))
    .limit(1);

  if (!row) throw notFound('Email template');

  return row;
};

/** Newest first; `search` matches the name. */
export const listEmailTemplates = async (client: Db, query: CursorQuery & { search?: string }) => {
  selfHostedOnly();

  return keysetPage(
    client,
    { table: emailTemplates, id: emailTemplates.id, createdAt: emailTemplates.createdAt },
    query.search ? ilike(emailTemplates.name, containsPattern(query.search)) : undefined,
    query,
    (where, orderBy, limit) =>
      client
        .select(itemColumns)
        .from(emailTemplates)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );
};

export const getEmailTemplate = async (client: Db, id: string) => {
  selfHostedOnly();

  return findTemplate(client, id);
};

/** 409 TAKEN when another template has the name (whatever the case). */
export const createEmailTemplate = async (
  client: Db,
  input: { name: string; content: EmailNode },
) => {
  selfHostedOnly();

  return oneRow(
    await client
      .insert(emailTemplates)
      .values({ ...input, id: newId(), createdBy: callerUserId() })
      .returning(),
  );
};

export const updateEmailTemplate = async (
  client: Db,
  id: string,
  changes: { name?: string; content?: EmailNode },
) => {
  selfHostedOnly();
  await findTemplate(client, id);

  return oneRow(
    await client
      .update(emailTemplates)
      .set({ ...changes, updatedAt: sql`now()` })
      .where(eq(emailTemplates.id, id))
      .returning(),
  );
};

/** Emails made with it keep their message: they hold a copy. */
export const removeEmailTemplate = async (client: Db, id: string) => {
  selfHostedOnly();

  const { name } = await findTemplate(client, id);

  await client.delete(emailTemplates).where(eq(emailTemplates.id, id));

  return { ok: true as const, name };
};
