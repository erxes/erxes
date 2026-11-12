import {
  companies,
  companyTags,
  customers,
  customerTags,
  type Db,
  newId,
  tags,
  users,
} from '@erxes/core-db';
import { and, eq, or, sql, type SQL } from 'drizzle-orm';
import type { Actor } from '~/http/auth';
import { normalizeEmail, normalizePhone } from '~/lib/contacts';
import { createCompany } from '~/modules/companies/companies.service';
import { CellError, type Column } from './columns';
import type { ImportRow } from './importState';

/** Lookups an import needs for every row, kept for the whole batch. */
export interface Context {
  actor: Actor;
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

  const [row] = await tx
    .select({ id: table.id })
    .from(table)
    .where(and(eq(table.orgId, ctx.actor.orgId), where))
    .limit(1);

  return row?.id ?? null;
};

export const ownerId = async (tx: Db, ctx: Context, email: string) => {
  if (!ctx.owners.has(email)) {
    const [row] = await tx
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.orgId, ctx.actor.orgId), eq(sql`lower(${users.email})`, email)))
      .limit(1);

    ctx.owners.set(email, row?.id ?? null);
  }

  const id = ctx.owners.get(email);

  if (!id) throw new CellError(`Owner: no team member with the email ${email}`);

  return id;
};

const findTag = async (tx: Db, ctx: Context, key: string) => {
  const [found] = await tx
    .select({ id: tags.id })
    .from(tags)
    .where(
      and(
        eq(tags.orgId, ctx.actor.orgId),
        eq(tags.type, ctx.isCompany ? 'company' : 'customer'),
        eq(sql`lower(${tags.name})`, key),
      ),
    )
    .limit(1);

  return found?.id ?? null;
};

/** Tag ids by name; missing tags are created when the import allows it. */
export const tagIds = async (tx: Db, ctx: Context, names: string[], created: Created) => {
  const ids: string[] = [];

  for (const name of names) {
    const key = name.toLowerCase();
    const known = ctx.tags.get(key) ?? created.get(`tag:${key}`);
    const found = known ?? (await findTag(tx, ctx, key));

    if (found) {
      if (!known) ctx.tags.set(key, found);
      ids.push(found);

      continue;
    }

    if (!ctx.imp.options.createMissing) throw new CellError(`Tags: no tag named “${name}”`);

    const id = newId();

    await tx.insert(tags).values({
      id,
      orgId: ctx.actor.orgId,
      type: ctx.isCompany ? 'company' : 'customer',
      name,
      createdBy: ctx.actor.userId,
    });
    created.set(`tag:${key}`, id);
    ids.push(id);
  }

  return ids;
};

const findCompany = async (tx: Db, ctx: Context, key: string) => {
  const [found] = await tx
    .select({ id: companies.id })
    .from(companies)
    .where(and(eq(companies.orgId, ctx.actor.orgId), eq(sql`lower(${companies.primaryName})`, key)))
    .limit(1);

  return found?.id ?? null;
};

/** Company ids by name; missing companies are created when the import allows it. */
export const companyIds = async (tx: Db, ctx: Context, names: string[], created: Created) => {
  const ids: string[] = [];

  for (const name of names) {
    const key = name.toLowerCase();
    const known = ctx.companies.get(key) ?? created.get(`company:${key}`);
    const found = known ?? (await findCompany(tx, ctx, key));

    if (found) {
      if (!known) ctx.companies.set(key, found);
      ids.push(found);

      continue;
    }

    if (!ctx.imp.options.createMissing)
      throw new CellError(`Companies: no company named “${name}”`);

    const id = (await createCompany(tx, ctx.actor, { primaryName: name })).id;

    created.set(`company:${key}`, id);
    ids.push(id);
  }

  return ids;
};

export const existingTags = async (tx: Db, ctx: Context, id: string) => {
  const links = ctx.isCompany ? companyTags : customerTags;

  return (
    await tx
      .select({ tagId: links.tagId })
      .from(links)
      .where(and(eq(links.orgId, ctx.actor.orgId), eq(links.recordId, id)))
  ).map((row) => row.tagId);
};
