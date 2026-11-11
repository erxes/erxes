import { type ContentType, Db, newId, tags } from '@erxes/core-db';
import { and, asc, eq, ilike, inArray, sql } from 'drizzle-orm';
import { type Actor, requireManager } from '~/http/auth';
import { HttpError, notFound, pgCode } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { containsPattern } from '~/lib/keyset';

type TagRow = typeof tags.$inferSelect;

const toTagDto = (row: TagRow) => ({
  id: row.id,
  type: row.type,
  name: row.name,
  colorCode: row.colorCode,
  createdAt: row.createdAt.toISOString(),
});

const taken = (error: unknown): never => {
  if (pgCode(error) === '23505') {
    throw new HttpError(409, 'TAG_EXISTS', 'A tag with this name already exists');
  }

  throw error;
};

const findTag = async (client: Db, orgId: string, id: string) => {
  const [row] = await client
    .select()
    .from(tags)
    .where(and(eq(tags.orgId, orgId), eq(tags.id, id)))
    .limit(1);

  if (!row) {
    throw notFound('Tag');
  }

  return row;
};

export const listTags = async (
  client: Db,
  actor: Actor,
  query: { type: ContentType; search?: string },
) => {
  const rows = await client
    .select()
    .from(tags)
    .where(
      and(
        eq(tags.orgId, actor.orgId),
        eq(tags.type, query.type),
        query.search ? ilike(tags.name, containsPattern(query.search)) : undefined,
      ),
    )
    .orderBy(asc(sql`lower(${tags.name})`))
    .limit(500);

  return { data: rows.map(toTagDto) };
};

export const createTag = async (
  client: Db,
  actor: Actor,
  input: { type: ContentType; name: string; colorCode?: string | null },
) => {
  try {
    const [row] = await client
      .insert(tags)
      .values({
        id: newId(),
        orgId: actor.orgId,
        type: input.type,
        name: input.name,
        colorCode: input.colorCode ?? null,
        createdBy: actor.userId,
      })
      .returning();

    return toTagDto(row!);
  } catch (error) {
    return taken(error);
  }
};

export const updateTag = async (
  client: Db,
  actor: Actor,
  id: string,
  input: { name?: string; colorCode?: string | null },
) => {
  await findTag(client, actor.orgId, id);

  try {
    const [row] = await client
      .update(tags)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.colorCode !== undefined ? { colorCode: input.colorCode } : {}),
        updatedAt: sql`now()`,
      })
      .where(and(eq(tags.orgId, actor.orgId), eq(tags.id, id)))
      .returning();

    return toTagDto(row!);
  } catch (error) {
    return taken(error);
  }
};

/** Deletes the tag; its links to customers or companies go with it (foreign keys). */
export const removeTag = async (client: Db, actor: Actor, id: string) => {
  requireManager(actor, 'Only owners and admins can delete tags');

  await findTag(client, actor.orgId, id);
  await client.delete(tags).where(and(eq(tags.orgId, actor.orgId), eq(tags.id, id)));

  return { ok: true as const };
};

/** The given tag ids, deduplicated; 400 INVALID_TAG unless all are `type` tags of the organisation. */
export const checkTagIds = async (client: Db, orgId: string, type: ContentType, ids: string[]) => {
  const wanted = unique(ids);

  if (!wanted.length) {
    return wanted;
  }

  const found = await client
    .select({ id: tags.id })
    .from(tags)
    .where(and(eq(tags.orgId, orgId), eq(tags.type, type), inArray(tags.id, wanted)));

  if (found.length !== wanted.length) {
    throw new HttpError(400, 'INVALID_TAG', `Unknown ${type} tag`);
  }

  return wanted;
};
