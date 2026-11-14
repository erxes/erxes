import { LIST_MAX } from '@erxes/core-contract';
import { type ContentType, type Db, newId, tags } from '@erxes/core-db';
import { and, asc, eq, ilike, inArray, sql } from 'drizzle-orm';
import { type Actor, requirePermission } from '~/http/auth';
import { HttpError, notFound, pgCode } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { containsPattern, wholeList } from '~/lib/keyset';
import { lockKeys } from '~/lib/locks';
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

/**
 * Adds tags of one type. The UI reads a type's tags whole (`listTags`), so an
 * organisation holds at most `LIST_MAX` of them: past that it is 409 TAG_LIMIT.
 * Adds of one type take turns, so two at once can't pass the limit together.
 */
export const addTags = async (
  client: Db,
  actor: Actor,
  type: ContentType,
  values: { name: string; colorCode?: string | null }[],
) => {
  await lockKeys(client, [`tags:${actor.orgId}:${type}`]);

  const held = await client.$count(tags, eq(tags.type, type));

  if (held + values.length > LIST_MAX) {
    throw new HttpError(
      409,
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
        createdBy: actor.userId,
      })),
    )
    .returning();
};

export const createTag = async (
  client: Db,
  actor: Actor,
  input: { type: ContentType; name: string; colorCode?: string | null },
) => {
  try {
    return oneRow(await addTags(client, actor, input.type, [input]));
  } catch (error) {
    return taken(error);
  }
};

export const updateTag = async (
  client: Db,
  id: string,
  input: { name?: string; colorCode?: string | null },
) => {
  await findTag(client, id);

  try {
    const row = oneRow(
      await client
        .update(tags)
        .set({
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.colorCode !== undefined ? { colorCode: input.colorCode } : {}),
          updatedAt: sql`now()`,
        })
        .where(eq(tags.id, id))
        .returning(),
    );

    return row;
  } catch (error) {
    return taken(error);
  }
};

/** Deletes the tag; its links to customers or companies go with it (foreign keys). */
export const removeTag = async (client: Db, actor: Actor, id: string) => {
  requirePermission(actor, 'tags.delete');

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
