import {
  companies,
  companyTags,
  customers,
  customerTags,
  type Db,
  tags,
  users,
} from '@erxes/core-db';
import { and, eq, inArray, or, sql, type SQL } from 'drizzle-orm';
import { normalizeEmail, normalizePhone } from '~/lib/contacts';
import { inOrder } from '~/lib/sequence';
import { createCompany } from '~/modules/companies/companies.service';
import { addTags } from '~/modules/tags/tags.service';
import { CellError, type Column } from './columns';
import type { ImportRow } from './importState';

/** Lookups an import needs for every row, kept for the whole batch (run as the importer). */
export interface Context {
  imp: ImportRow;
  isCompany: boolean;
  columns: Map<string, Column>;
  owners: Map<string, string | null>;
  tags: Map<string, string>;
  companies: Map<string, string>;
}

/** Records a row created (`tag:<name>`, `company:<name>`), cached once its savepoint commits. */
export type Created = Map<string, string>;

/** The condition that finds the row's record by the import's match field, or null without a value. */
const matchCondition = (ctx: Context, input: Record<string, unknown>, id?: string): SQL | null => {
  const table = ctx.isCompany ? companies : customers;
  const value = (key: string) => (typeof input[key] === 'string' ? input[key] : null);

  switch (ctx.imp.options.matchBy) {
    case 'id':
      return id ? (or(eq(table.id, id), sql`${id} = any(${table.mergedIds})`) ?? null) : null;

    case 'email': {
      const email = value('primaryEmail');

      if (!email) return null;

      return (
        or(
          eq(sql`lower(${table.primaryEmail})`, normalizeEmail(email)),
          sql`${normalizeEmail(email)} = any(${table.emails})`,
        ) ?? null
      );
    }

    case 'phone': {
      const phone = value('primaryPhone');

      if (!phone) return null;

      return (
        or(
          eq(table.primaryPhone, normalizePhone(phone)),
          sql`${normalizePhone(phone)} = any(${table.phones})`,
        ) ?? null
      );
    }

    case 'code': {
      const code = value('code');

      return code ? eq(table.code, code) : null;
    }

    default: {
      const name = value('primaryName');

      return name && ctx.isCompany
        ? eq(sql`lower(${companies.primaryName})`, name.toLowerCase())
        : null;
    }
  }
};

/** The record this row is about, by the import's match field. */
export const findExisting = async (
  tx: Db,
  ctx: Context,
  input: Record<string, unknown>,
  refs: { id?: string },
) => {
  const where = matchCondition(ctx, input, refs.id);

  if (!where) return null;

  const table = ctx.isCompany ? companies : customers;

  const [row] = await tx.select({ id: table.id }).from(table).where(where).limit(1);

  return row?.id ?? null;
};

export const ownerId = async (tx: Db, ctx: Context, email: string) => {
  if (!ctx.owners.has(email)) {
    const [row] = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(sql`lower(${users.email})`, email))
      .limit(1);

    ctx.owners.set(email, row?.id ?? null);
  }

  const id = ctx.owners.get(email);

  if (!id) throw new CellError(`Owner: no team member with the email ${email}`);

  return id;
};

/**
 * Ids by lower-cased name: from the batch's cache, then this row's creations,
 * then one query for the rest (cached for the batch). `missing` are the names
 * still unknown, one per name, in the row's order.
 */
const lookUpNames = async (
  cache: Map<string, string>,
  created: Created,
  kind: 'tag' | 'company',
  names: string[],
  find: (keys: string[]) => Promise<{ id: string; key: string }[]>,
) => {
  const firstNames = new Map<string, string>();

  for (const name of names) {
    if (!firstNames.has(name.toLowerCase())) firstNames.set(name.toLowerCase(), name);
  }

  const byKey = new Map<string, string>();

  for (const key of firstNames.keys()) {
    const id = cache.get(key) ?? created.get(`${kind}:${key}`);

    if (id) byKey.set(key, id);
  }

  const unknown = [...firstNames.keys()].filter((key) => !byKey.has(key));

  for (const row of unknown.length ? await find(unknown) : []) {
    if (!byKey.has(row.key)) {
      byKey.set(row.key, row.id);
      cache.set(row.key, row.id);
    }
  }

  return {
    byKey,
    missing: [...firstNames].flatMap(([key, name]) => (byKey.has(key) ? [] : [name])),
  };
};

/** Tag ids by name; missing tags are created (one insert) when the import allows it. */
export const tagIds = async (tx: Db, ctx: Context, names: string[], created: Created) => {
  const type: 'company' | 'customer' = ctx.isCompany ? 'company' : 'customer';
  const lower = sql<string>`lower(${tags.name})`;

  const { byKey, missing } = await lookUpNames(ctx.tags, created, 'tag', names, (keys) =>
    tx
      .select({ id: tags.id, key: lower })
      .from(tags)
      .where(and(eq(tags.type, type), inArray(lower, keys))),
  );

  const [first] = missing;

  if (first !== undefined && !ctx.imp.options.createMissing)
    throw new CellError(`Tags: no tag named “${first}”`);

  const rows = missing.length
    ? await addTags(
        tx,
        type,
        missing.map((name) => ({ name })),
      )
    : [];

  for (const row of rows) {
    created.set(`tag:${row.name.toLowerCase()}`, row.id);
    byKey.set(row.name.toLowerCase(), row.id);
  }

  return names.flatMap((name) => byKey.get(name.toLowerCase()) ?? []);
};

/** Company ids by name; missing companies are created (the full create, one after another) when the import allows it. */
export const companyIds = async (tx: Db, ctx: Context, names: string[], created: Created) => {
  const lower = sql<string>`lower(${companies.primaryName})`;

  const { byKey, missing } = await lookUpNames(ctx.companies, created, 'company', names, (keys) =>
    tx.select({ id: companies.id, key: lower }).from(companies).where(inArray(lower, keys)),
  );

  const [first] = missing;

  if (first !== undefined && !ctx.imp.options.createMissing)
    throw new CellError(`Companies: no company named “${first}”`);

  await inOrder(missing, async (name) => {
    const { id } = await createCompany(tx, { primaryName: name });

    created.set(`company:${name.toLowerCase()}`, id);
    byKey.set(name.toLowerCase(), id);
  });

  return names.flatMap((name) => byKey.get(name.toLowerCase()) ?? []);
};

export const existingTags = async (tx: Db, ctx: Context, id: string) => {
  const links = ctx.isCompany ? companyTags : customerTags;

  return (await tx.select({ tagId: links.tagId }).from(links).where(eq(links.recordId, id))).map(
    (row) => row.tagId,
  );
};
