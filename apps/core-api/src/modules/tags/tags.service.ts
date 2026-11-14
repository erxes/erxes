import { caller, type ContentType, type Db, newId, tags } from '@erxes/core-db';
import { and, asc, eq, ilike, inArray, sql } from 'drizzle-orm';
import { HttpError, notFound, pgCode } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { containsPattern, wholeList } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';

const taken = (error: unknown): never => {
  if (pgCode(error) === '23505') {
    throw new HttpError(409, 'TAG_EXISTS', 'A tag with this name already exists');
  }

  throw error;
};

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

export const createTag = async (
  client: Db,
  input: { type: ContentType; name: string; colorCode?: string | null },
) => {
  try {
    return oneRow(
      await client
        .insert(tags)
        .values({ id: newId(), ...input, createdBy: caller('user').userId })
        .returning(),
    );
  } catch (error) {
    return taken(error);
  }
};

export const updateTag = async (
  client: Db,
  id: string,
  changes: { name?: string; colorCode?: string | null },
) => {
  await findTag(client, id);

  try {
    return oneRow(
      await client
        .update(tags)
        .set({ ...changes, updatedAt: sql`now()` })
        .where(eq(tags.id, id))
        .returning(),
    );
  } catch (error) {
    return taken(error);
  }
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
    throw new HttpError(400, 'INVALID_TAG', `Unknown ${type} tag`);
  }

  return wanted;
};
