import { type ORPCErrorConstructorMap, ORPCError } from '@orpc/server';
import { and, desc, eq, getTableColumns, ilike, sql } from 'drizzle-orm';
import { z } from 'zod';
import { PERMISSIONS } from '#/core.ts';
import { uniqueViolation } from '#/db/client.ts';
import { ITEM_NAME_INDEX, items } from '#/db/schema.ts';
import { reads, writes } from '#/orpc.ts';

/** What a procedure returns: the row without `org_id`, which the caller already knows. */
const { orgId, ...columns } = getTableColumns(items);

const Name = z.string().trim().min(1).max(200);
const Description = z.string().trim().max(5000);

const Item = z.object({
  id: z.string(),
  name: Name,
  description: Description,
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/** The failures a client can branch on: `isDefinedError(error) && error.code === ...`. */
const itemErrors = {
  ITEM_NAME_TAKEN: {
    status: 409,
    message: 'Another item has this name',
    data: z.object({ name: z.string() }),
  },
};

/** The one place Postgres's 23505 on the name index becomes ITEM_NAME_TAKEN. */
const nameTaken =
  (errors: ORPCErrorConstructorMap<typeof itemErrors>, name: string) =>
  (error: unknown): never => {
    if (uniqueViolation(error) === ITEM_NAME_INDEX)
      throw errors.ITEM_NAME_TAKEN({ data: { name } });

    throw error;
  };

const escapeLike = (text: string) => text.replaceAll(/[\\%_]/g, '\\$&');

/** Newest first, in keyset pages: `nextCursor` is the id to pass for the next page. */
const list = reads(PERMISSIONS.view)
  .input(
    z.object({
      search: z.string().trim().max(200).optional(),
      /** Only the items this member created. */
      createdBy: z.string().optional(),
      cursor: z.string().optional(),
      limit: z.number().int().min(1).max(100).default(50),
    }),
  )
  .output(z.object({ items: z.array(Item), nextCursor: z.string().nullable() }))
  .handler(async ({ input, context: { tx } }) => {
    const after = input.cursor
      ? sql`(${items.createdAt}, ${items.id}) < (select created_at, id from ${items} where id = ${input.cursor})`
      : undefined;

    const rows = await tx
      .select(columns)
      .from(items)
      .where(
        and(
          input.search ? ilike(items.name, `%${escapeLike(input.search)}%`) : undefined,
          input.createdBy ? eq(items.createdBy, input.createdBy) : undefined,
          after,
        ),
      )
      .orderBy(desc(items.createdAt), desc(items.id))
      .limit(input.limit + 1);

    const page = rows.slice(0, input.limit);

    return {
      items: page,
      nextCursor: rows.length > input.limit ? (page.at(-1)?.id ?? null) : null,
    };
  });

const create = writes(PERMISSIONS.manage)
  .errors(itemErrors)
  .input(z.object({ name: Name, description: Description.default('') }))
  .output(Item)
  .handler(async ({ input, context: { tx, member }, errors }) => {
    const [item] = await tx
      .insert(items)
      .values({ ...input, orgId: member.orgId, createdBy: member.userId })
      .returning(columns)
      .catch(nameTaken(errors, input.name));

    if (!item) throw new ORPCError('INTERNAL_SERVER_ERROR');

    return item;
  });

const update = writes(PERMISSIONS.manage)
  .errors(itemErrors)
  .input(z.object({ id: z.string(), name: Name, description: Description.optional() }))
  .output(Item)
  .handler(async ({ input: { id, ...fields }, context: { tx }, errors }) => {
    const [item] = await tx
      .update(items)
      .set(fields)
      .where(eq(items.id, id))
      .returning(columns)
      .catch(nameTaken(errors, fields.name));

    if (!item) throw new ORPCError('NOT_FOUND', { message: 'No such item' });

    return item;
  });

const remove = writes(PERMISSIONS.manage)
  .input(z.object({ id: z.string() }))
  .output(z.object({ id: z.string() }))
  .handler(async ({ input, context: { tx } }) => {
    const [item] = await tx.delete(items).where(eq(items.id, input.id)).returning({ id: items.id });

    if (!item) throw new ORPCError('NOT_FOUND', { message: 'No such item' });

    return item;
  });

export const itemProcedures = { list, create, update, remove };
