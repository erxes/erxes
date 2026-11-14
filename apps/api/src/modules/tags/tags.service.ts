import { LIST_MAX } from '@erxes/core-contract';
import { caller, type ContentType, type Db, newId, requestOrgId, tags } from '@erxes/core-db';
import { and, asc, eq, ilike, inArray, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { containsPattern, wholeList } from '~/lib/keyset';
import { lockKeys } from '~/lib/locks';
import { oneRow } from '~/lib/rows';

const findTag = async (client: Db, id: string) => {
  const [row] = await client.select().from(tags).where(eq(tags.id, id)).limit(1);

  if (!row) {
    throw notFound('Tag');
  }

  return row;
};

export const listTags = async (client: Db, query: { type: ContentType; search?: string }) => {
  const rows = await wholeList((limit) =>
    client
      .select()
      .from(tags)
      .where(
        and(
          eq(tags.type, query.type),
          query.search ? ilike(tags.name, containsPattern(query.search)) : undefined,
        ),
      )
      .orderBy(asc(sql`lower(${tags.name})`))
      .limit(limit),
  );

  return { data: rows };
};

/**
 * Adds tags of one type. The UI reads a type's tags whole (`listTags`), so an
 * organisation holds at most `LIST_MAX` of them: past that it is 409 TAG_LIMIT.
 * Adds of one type take turns, so two at once can't pass the limit together.
 */
export const addTags = async (
  client: Db,
  type: ContentType,
  values: { name: string; colorCode?: string | null }[],
) => {
  await lockKeys(client, [`tags:${requestOrgId()}:${type}`]);

  const held = await client.$count(tags, eq(tags.type, type));

  if (held + values.length > LIST_MAX) {
    throw fail(
      'TAG_LIMIT',
      `An organisation holds at most ${LIST_MAX} ${type} tags. Delete ones you don't use first.`,
    );
  }

  return client
    .insert(tags)
    .values(
      values.map(({ name, colorCode }) => ({
        id: newId(),
        type,
        name,
        colorCode: colorCode ?? null,
        createdBy: caller('user').userId,
      })),
    )
    .returning();
};

export const createTag = async (
  client: Db,
  input: { type: ContentType; name: string; colorCode?: string | null },
) => {
  return oneRow(await addTags(client, input.type, [input]));
};

export const updateTag = async (
  client: Db,
  id: string,
  changes: { name?: string; colorCode?: string | null },
) => {
  await findTag(client, id);

  return oneRow(
    await client
      .update(tags)
      .set({ ...changes, updatedAt: sql`now()` })
      .where(eq(tags.id, id))
      .returning(),
  );
};

/** Deletes the tag; its links to customers or companies go with it (foreign keys). */
export const removeTag = async (client: Db, id: string) => {
  await findTag(client, id);
  await client.delete(tags).where(eq(tags.id, id));

  return { ok: true as const };
};

/** The given tag ids, deduplicated; 400 INVALID_TAG unless all are `type` tags of the organisation. */
export const checkTagIds = async (client: Db, type: ContentType, ids: string[]) => {
  const wanted = unique(ids);

  if (!wanted.length) {
    return wanted;
  }

  const found = await client
    .select({ id: tags.id })
    .from(tags)
    .where(and(eq(tags.type, type), inArray(tags.id, wanted)));

  if (found.length !== wanted.length) {
    throw fail('INVALID_TAG', `Unknown ${type} tag`);
  }

  return wanted;
};
