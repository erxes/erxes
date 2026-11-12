import {
  CompanyFields,
  CustomerFields,
  type Import,
  type TransferRecordType,
} from '@erxes/core-contract';
import {
  companies,
  companyTags,
  customers,
  customerTags,
  type Db,
  type ImportCounts,
  type ImportOptions,
  importRows,
  imports,
  newId,
  roles,
  tags,
  type Transaction,
  users,
} from '@erxes/core-db';
import { and, asc, eq, gt, inArray, isNotNull, or, sql } from 'drizzle-orm';
import { type Actor, type Caller, userCaller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { withImportCause } from '~/lib/causation';
import { normalizeEmail, normalizePhone } from '~/lib/contacts';
import { log } from '~/lib/log';
import { recordAudit } from '~/modules/audit/audit.service';
import {
  createCompany,
  removeCompanies,
  updateCompany,
} from '~/modules/companies/companies.service';
import {
  createCustomer,
  linkCustomerCompany,
  removeCustomers,
  updateCustomer,
} from '~/modules/customers/customers.service';
import { readFileBytes, readyFile } from '~/modules/files/files.service';
import { enqueueJob, type JobDefinition } from '~/modules/jobs/jobs';
import { notify } from '~/modules/notifications/notifications.service';
import {
  type Column,
  CellError,
  customValue,
  parseDate,
  parseNumber,
  splitList,
  suggestMapping,
  transferColumns,
} from './columns';
import { ParseError, parseSheet } from './parse';

type ImportRow = typeof imports.$inferSelect;

type Row = typeof importRows.$inferSelect;

type Action = 'create' | 'update' | 'skip' | 'error';

/** Rows per job (each row in its own savepoint). */
const BATCH = 200;

/** How long an import's created records can be removed again. */
const UNDO_DAYS = 30;

const EMPTY: ImportCounts = { rows: 0, create: 0, update: 0, skip: 0, error: 0 };

const defaults = (recordType: TransferRecordType): ImportOptions => ({
  mode: 'create',
  matchBy: recordType === 'company' ? 'name' : 'email',
  createMissing: true,
  runAutomations: false,
});

const undoable = (row: ImportRow) =>
  row.status === 'done' &&
  !!row.finishedAt &&
  Date.now() - row.finishedAt.getTime() < UNDO_DAYS * 86_400_000 &&
  row.counts.create > 0;

const toDto = (row: ImportRow, sample: string[][] = []): Import => ({
  id: row.id,
  recordType: row.recordType,
  fileName: row.fileName,
  status: row.status,
  headers: row.headers,
  mapping: row.mapping,
  options: row.options,
  counts: row.counts,
  processed: row.processed,
  sample,
  error: row.error,
  undoable: undoable(row),
  createdBy: row.createdBy,
  createdAt: row.createdAt.toISOString(),
  finishedAt: row.finishedAt?.toISOString() ?? null,
});

const importOrThrow = async (client: Db, orgId: string, id: string, lock = false) => {
  const query = client
    .select()
    .from(imports)
    .where(and(eq(imports.orgId, orgId), eq(imports.id, id)))
    .limit(1);

  const [row] = await (lock ? query.for('update') : query);

  if (!row) throw notFound('Import');

  return row;
};

const sampleOf = async (client: Db, id: string) =>
  (
    await client
      .select({ cells: importRows.cells })
      .from(importRows)
      .where(eq(importRows.importId, id))
      .orderBy(asc(importRows.rowNumber))
      .limit(5)
  ).map((row) => row.cells);

export const listImports = async (client: Db, actor: Actor) => ({
  data: (
    await client
      .select()
      .from(imports)
      .where(eq(imports.orgId, actor.orgId))
      .orderBy(sql`${imports.createdAt} desc`)
      .limit(50)
  ).map((row) => toDto(row)),
});

export const getImport = async (client: Db, actor: Actor, id: string) => {
  const row = await importOrThrow(client, actor.orgId, id);

  return toDto(row, await sampleOf(client, id));
};

/** Queues an import's next step; a batch's key names the rows it starts after (no double batch). */
const queueStep = (
  client: Db,
  row: Pick<ImportRow, 'orgId' | 'id'>,
  queue: string,
  payload: Record<string, unknown> = {},
) =>
  enqueueJob(client, {
    orgId: row.orgId,
    queue,
    payload: { importId: row.id, ...payload },
    maxAttempts: 3,
    dedupeKey: `${row.id}:${queue}:${'after' in payload ? String(payload.after) : newId()}`,
  });

/** Starts an import from an uploaded file: it is read in the background, then columns are suggested. */
export const createImport = async (
  client: Db,
  actor: Actor,
  input: { recordType: TransferRecordType; fileId: string },
) => {
  const file = await readyFile(client, actor.orgId, input.fileId);

  if (!/\.(csv|txt|tsv|xlsx)$/i.test(file.name))
    throw new HttpError(400, 'UNSUPPORTED_FILE', 'Import a .csv or .xlsx file');

  const [row] = await client
    .insert(imports)
    .values({
      id: newId(),
      orgId: actor.orgId,
      recordType: input.recordType,
      fileId: file.id,
      fileName: file.name,
      options: defaults(input.recordType),
      createdBy: actor.userId,
    })
    .returning();

  await queueStep(client, row!, 'import.parse');

  return toDto(row!);
};

/** Mapping and options can change until it runs; the check's results are cleared. */
export const updateImport = async (
  client: Db,
  actor: Actor,
  id: string,
  input: { mapping?: Record<string, string>; options?: Partial<ImportOptions> },
) => {
  const row = await importOrThrow(client, actor.orgId, id, true);

  if (!['mapping', 'checked'].includes(row.status))
    throw new HttpError(409, 'IMPORT_LOCKED', `The import is ${row.status}`);

  const columns = await transferColumns(client, actor.orgId, row.recordType);
  const mapping = input.mapping ?? row.mapping;
  const keys = Object.values(mapping);
  const unknown = keys.find((key) => !columns.some((item) => item.key === key && item.importable));

  if (unknown) throw new HttpError(400, 'INVALID_MAPPING', `Unknown field: ${unknown}`);

  if (new Set(keys).size !== keys.length)
    throw new HttpError(400, 'INVALID_MAPPING', 'Each field can take one column');

  const options = { ...row.options, ...input.options };

  if (row.recordType !== 'company' && options.matchBy === 'name')
    throw new HttpError(400, 'INVALID_OPTIONS', 'Customers match by email, phone, code or ID');

  const [next] = await client
    .update(imports)
    .set({
      mapping,
      options,
      status: 'mapping',
      counts: { ...EMPTY, rows: row.counts.rows },
      processed: 0,
      updatedAt: sql`now()`,
    })
    .where(eq(imports.id, id))
    .returning();

  await client
    .update(importRows)
    .set({ action: null, error: null })
    .where(eq(importRows.importId, id));

  return toDto(next!, await sampleOf(client, id));
};

const begin = async (
  client: Db,
  actor: Actor,
  id: string,
  from: ImportRow['status'][],
  status: 'checking' | 'running',
) => {
  const row = await importOrThrow(client, actor.orgId, id, true);

  if (!from.includes(row.status))
    throw new HttpError(409, 'IMPORT_LOCKED', `The import is ${row.status}`);

  if (!Object.keys(row.mapping).length)
    throw new HttpError(400, 'INVALID_MAPPING', 'Map at least one column');

  const [next] = await client
    .update(imports)
    .set({ status, processed: 0, error: null, updatedAt: sql`now()` })
    .where(eq(imports.id, id))
    .returning();

  // A fresh key each start (a check can be run again after changes).
  await queueStep(client, next!, status === 'checking' ? 'import.check' : 'import.run', {
    after: `0:${newId()}`,
  });

  return toDto(next!);
};

export const checkImport = (client: Db, actor: Actor, id: string) =>
  begin(client, actor, id, ['mapping', 'checked'], 'checking');

export const startImport = (client: Db, actor: Actor, id: string) =>
  begin(client, actor, id, ['mapping', 'checked'], 'running');

/** Removes the records it created (to the recycle bin), within 30 days; what it updated stays. */
export const undoImport = async (client: Db, actor: Actor, id: string) => {
  const row = await importOrThrow(client, actor.orgId, id, true);

  if (!undoable(row))
    throw new HttpError(
      409,
      'NOT_UNDOABLE',
      `Only imports that created records, in the last ${UNDO_DAYS} days`,
    );

  const [next] = await client
    .update(imports)
    .set({ status: 'running', updatedAt: sql`now()` })
    .where(eq(imports.id, id))
    .returning();

  await queueStep(client, next!, 'import.undo', { by: actor.userId });
  await recordAudit(client, userCaller(actor), {
    action: 'import.undone',
    targetType: 'import',
    targetId: id,
    targetLabel: row.fileName,
  });

  return toDto(next!);
};

export const listImportRows = async (
  client: Db,
  actor: Actor,
  id: string,
  input: { action?: Action; limit: number },
) => {
  await importOrThrow(client, actor.orgId, id);

  const rows = await client
    .select()
    .from(importRows)
    .where(
      and(
        eq(importRows.importId, id),
        input.action ? eq(importRows.action, input.action) : undefined,
      ),
    )
    .orderBy(asc(importRows.rowNumber))
    .limit(input.limit);

  return {
    data: rows.map((row) => ({
      rowNumber: row.rowNumber,
      cells: row.cells,
      action: row.action as Action | null,
      error: row.error,
      recordId: row.recordId,
    })),
  };
};

// ─── Jobs ───────────────────────────────────────────────────────────────────

/** The member the import acts as (its creator, with their permissions now). */
const memberActor = async (tx: Db, orgId: string, userId: string): Promise<Actor> => {
  const [row] = await tx
    .select({
      id: users.id,
      role: users.role,
      status: users.status,
      permissions: roles.permissions,
    })
    .from(users)
    .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
    .where(and(eq(users.orgId, orgId), eq(users.id, userId)))
    .limit(1);

  if (!row || row.status !== 'active')
    throw new ImportFailed('The member who started this import is no longer active');

  return { userId: row.id, orgId, role: row.role, permissions: row.permissions };
};

/** A problem with the whole import (not one row): it fails with this message, without retrying. */
class ImportFailed extends Error {}

const fail = async (tx: Db, id: string, message: string) => {
  await tx
    .update(imports)
    .set({ status: 'failed', error: message.slice(0, 500), finishedAt: sql`now()` })
    .where(eq(imports.id, id));
};

/** Reads the file into rows and suggests the mapping. */
export const importParseJob: JobDefinition = {
  queue: 'import.parse',
  atomic: true,
  leaseSeconds: 300,
  async handle(job, tx) {
    const db = tx as Transaction;
    const row = await importOrThrow(db, job.orgId, job.payload.importId as string, true);

    if (row.status !== 'parsing') return;

    try {
      const { row: file, body } = await readFileBytes(db, job.orgId, row.fileId);
      const { headers, rows } = await parseSheet(body, file.name, file.contentType);

      for (let start = 0; start < rows.length; start += 1000) {
        await db.insert(importRows).values(
          rows.slice(start, start + 1000).map((cells, index) => ({
            orgId: job.orgId,
            importId: row.id,
            rowNumber: start + index + 2,
            cells,
          })),
        );
      }

      const columns = await transferColumns(db, job.orgId, row.recordType);

      await db
        .update(imports)
        .set({
          status: 'mapping',
          headers,
          mapping: suggestMapping(headers, columns),
          counts: { ...EMPTY, rows: rows.length },
          updatedAt: sql`now()`,
        })
        .where(eq(imports.id, row.id));
    } catch (error) {
      if (!(error instanceof ParseError)) throw error;
      await fail(db, row.id, error.message);
    }
  },
  async onDead(job, error, tx) {
    await fail(tx, job.payload.importId as string, `The file could not be read: ${error}`);
  },
};

/** Lookups an import needs for every row, kept for the whole batch. */
interface Context {
  actor: Actor;
  caller: Caller;
  imp: ImportRow;
  isCompany: boolean;
  columns: Map<string, Column>;
  owners: Map<string, string | null>;
  tags: Map<string, string>;
  companies: Map<string, string>;
}

class DryRun extends Error {}

/** One row's cells → the record's input, the things it names (owner, tags, companies), and its match value. */
const readRow = (ctx: Context, cells: string[]) => {
  const input: Record<string, unknown> = {};
  const customFields: Record<string, unknown> = {};
  const refs: { owner?: string; tags?: string[]; companies?: string[]; id?: string } = {};

  for (const [index, key] of Object.entries(ctx.imp.mapping)) {
    const raw = (cells[Number(index)] ?? '').trim();

    if (!raw) continue;

    const column = ctx.columns.get(key);

    try {
      if (key.startsWith('customFields.'))
        customFields[key.slice('customFields.'.length)] = customValue(column?.fieldType, raw);
      else if (key === 'id') refs.id = raw;
      else if (key === 'owner') refs.owner = normalizeEmail(raw);
      else if (key === 'tags') refs.tags = splitList(raw);
      else if (key === 'companies') refs.companies = splitList(raw);
      else if (key === 'name') {
        const [first = '', ...rest] = raw.split(/\s+/);

        input.firstName ??= first;

        if (rest.length) input.lastName ??= rest.join(' ');
      } else if (key === 'emails' || key === 'phones' || key === 'names')
        input[key] = splitList(raw);
      else if (key === 'birthDate') input.birthDate = parseDate(raw);
      else if (key === 'size') input.size = Math.round(parseNumber(raw));
      else if (key === 'state') {
        const state = raw.toLowerCase();

        if (state !== 'lead' && state !== 'customer')
          throw new CellError(`State is lead or customer, not “${raw}”`);
        input.state = state;
      } else input[key] = raw;
    } catch (error) {
      throw new CellError(`${column?.label ?? key}: ${(error as Error).message}`);
    }
  }

  if (Object.keys(customFields).length) input.customFields = customFields;

  return { input, refs };
};

/** The record this row is about, by the import's match field. */
const findExisting = async (
  tx: Db,
  ctx: Context,
  input: Record<string, unknown>,
  refs: { id?: string },
) => {
  const table = ctx.isCompany ? companies : customers;
  const orgId = ctx.actor.orgId;
  const value = (key: string) => (typeof input[key] === 'string' ? input[key] : null);
  let where;

  switch (ctx.imp.options.matchBy) {
    case 'id':
      if (!refs.id) return null;
      where = or(eq(table.id, refs.id), sql`${refs.id} = any(${table.mergedIds})`);
      break;
    case 'email': {
      const email = value('primaryEmail');

      if (!email) return null;
      where = or(
        eq(sql`lower(${table.primaryEmail})`, normalizeEmail(email)),
        sql`${normalizeEmail(email)} = any(${table.emails})`,
      );
      break;
    }

    case 'phone': {
      const phone = value('primaryPhone');

      if (!phone) return null;
      where = or(
        eq(table.primaryPhone, normalizePhone(phone)),
        sql`${normalizePhone(phone)} = any(${table.phones})`,
      );
      break;
    }

    case 'code': {
      const code = value('code');

      if (!code) return null;
      where = eq(table.code, code);
      break;
    }

    default: {
      const name = value('primaryName');

      if (!name || !ctx.isCompany) return null;
      where = eq(sql`lower(${companies.primaryName})`, name.toLowerCase());
    }
  }

  const [row] = await tx
    .select({ id: table.id })
    .from(table)
    .where(and(eq(table.orgId, orgId), where))
    .limit(1);

  return row?.id ?? null;
};

const ownerId = async (tx: Db, ctx: Context, email: string) => {
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

/** Tag ids by name (one `created` list: cached only once the row's savepoint commits). */
const tagIds = async (tx: Db, ctx: Context, names: string[], created: Map<string, string>) => {
  const type = ctx.isCompany ? 'company' : 'customer';
  const ids: string[] = [];

  for (const name of names) {
    const key = name.toLowerCase();
    let id = ctx.tags.get(key) ?? created.get(`tag:${key}`);

    if (!id) {
      const [found] = await tx
        .select({ id: tags.id })
        .from(tags)
        .where(
          and(
            eq(tags.orgId, ctx.actor.orgId),
            eq(tags.type, type),
            eq(sql`lower(${tags.name})`, key),
          ),
        )
        .limit(1);

      if (found) {
        id = found.id;
        ctx.tags.set(key, id);
      } else if (ctx.imp.options.createMissing) {
        id = newId();
        await tx
          .insert(tags)
          .values({ id, orgId: ctx.actor.orgId, type, name, createdBy: ctx.actor.userId });
        created.set(`tag:${key}`, id);
      } else {
        throw new CellError(`Tags: no tag named “${name}”`);
      }
    }

    ids.push(id);
  }

  return ids;
};

const companyIds = async (tx: Db, ctx: Context, names: string[], created: Map<string, string>) => {
  const ids: string[] = [];

  for (const name of names) {
    const key = name.toLowerCase();
    let id = ctx.companies.get(key) ?? created.get(`company:${key}`);

    if (!id) {
      const [found] = await tx
        .select({ id: companies.id })
        .from(companies)
        .where(
          and(eq(companies.orgId, ctx.actor.orgId), eq(sql`lower(${companies.primaryName})`, key)),
        )
        .limit(1);

      if (found) {
        id = found.id;
        ctx.companies.set(key, id);
      } else if (ctx.imp.options.createMissing) {
        id = (await createCompany(tx, ctx.actor, { primaryName: name })).id;
        created.set(`company:${key}`, id);
      } else {
        throw new CellError(`Companies: no company named “${name}”`);
      }
    }

    ids.push(id);
  }

  return ids;
};

const existingTags = async (tx: Db, ctx: Context, id: string) => {
  const links = ctx.isCompany ? companyTags : customerTags;

  return (
    await tx
      .select({ tagId: links.tagId })
      .from(links)
      .where(and(eq(links.orgId, ctx.actor.orgId), eq(links.recordId, id)))
  ).map((row) => row.tagId);
};

const messageOf = (error: unknown) => {
  if (error instanceof HttpError || error instanceof CellError) return error.message;

  const issues = (error as { issues?: { path: (string | number)[]; message: string }[] }).issues;

  if (issues?.length)
    return issues.map((issue) => `${issue.path.join('.') || 'row'}: ${issue.message}`).join('; ');

  return (error as Error).message ?? String(error);
};

/**
 * One row: read it, find its record, decide (create, update, skip), and do it
 * in a savepoint — a dry run (the check) rolls the savepoint back, so it sees
 * exactly what running would (uniqueness, property rules), changing nothing.
 */
const processRow = async (
  tx: Db,
  ctx: Context,
  row: Row,
  dry: boolean,
): Promise<{ action: Action; error?: string; recordId?: string }> => {
  let read: ReturnType<typeof readRow>;

  try {
    read = readRow(ctx, row.cells);
  } catch (error) {
    return { action: 'error', error: messageOf(error) };
  }

  const { input, refs } = read;
  const existing = await findExisting(tx, ctx, input, refs);
  const { mode } = ctx.imp.options;

  if (mode === 'create' && existing)
    return { action: 'skip', error: 'Already exists', recordId: existing };

  if (mode === 'update' && !existing)
    return { action: 'skip', error: 'No existing record matches' };

  const action: Action = existing ? 'update' : 'create';
  const created = new Map<string, string>();
  let recordId = existing ?? undefined;

  try {
    await tx.transaction(async (savepoint) => {
      const sp = savepoint as Db;

      if (refs.owner) input.ownerId = await ownerId(sp, ctx, refs.owner);
      else if (action === 'create' && ctx.imp.options.ownerId)
        input.ownerId = ctx.imp.options.ownerId;

      const rowTags = refs.tags ? await tagIds(sp, ctx, refs.tags, created) : [];
      const optionTags = ctx.imp.options.tagIds ?? [];

      if (rowTags.length || optionTags.length) {
        // Tags are added, never taken away.
        input.tagIds = [
          ...new Set([
            ...(existing ? await existingTags(sp, ctx, existing) : []),
            ...rowTags,
            ...optionTags,
          ]),
        ];
      }

      if (!ctx.isCompany) {
        if (ctx.imp.recordType === 'lead') input.state = 'lead';
        else if (action === 'create') input.state ??= 'customer';
      }

      const parsed = (ctx.isCompany ? CompanyFields : CustomerFields).parse(input);

      if (action === 'create') {
        if (ctx.isCompany) {
          if (!(parsed as { primaryName?: string }).primaryName)
            throw new CellError('Name: a company needs a name');
          recordId = (
            await createCompany(sp, ctx.actor, parsed as Parameters<typeof createCompany>[2])
          ).id;
        } else {
          const customer = parsed as Parameters<typeof createCustomer>[2];

          if (
            !customer.firstName &&
            !customer.lastName &&
            !customer.primaryEmail &&
            !customer.primaryPhone
          ) {
            throw new CellError('A customer needs a name, an email or a phone');
          }

          recordId = (await createCustomer(sp, ctx.actor, customer)).id;
        }
      } else if (Object.keys(parsed).length) {
        if (ctx.isCompany) await updateCompany(sp, ctx.actor, existing!, parsed);
        else await updateCustomer(sp, ctx.actor, existing!, parsed);
      }

      if (refs.companies?.length && recordId && !ctx.isCompany) {
        for (const companyId of await companyIds(sp, ctx, refs.companies, created))
          await linkCustomerCompany(sp, ctx.actor, recordId, companyId);
      }

      if (dry) throw new DryRun();
    });
  } catch (error) {
    if (!(error instanceof DryRun)) return { action: 'error', error: messageOf(error) };
  }

  // Committed: what this row made is there for the next rows too.
  if (!dry) {
    for (const [key, id] of created) {
      const [kind, name] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)];

      (kind === 'tag' ? ctx.tags : ctx.companies).set(name, id);
    }
  }

  return { action, recordId: dry ? (existing ?? undefined) : recordId };
};

const countsOf = async (tx: Db, id: string, rows: number): Promise<ImportCounts> => {
  const grouped = await tx
    .select({ action: importRows.action, count: sql<number>`count(*)::int` })
    .from(importRows)
    .where(eq(importRows.importId, id))
    .groupBy(importRows.action);

  const count = (action: Action) => grouped.find((item) => item.action === action)?.count ?? 0;

  return {
    rows,
    create: count('create'),
    update: count('update'),
    skip: count('skip'),
    error: count('error'),
  };
};

/** The check and the run: a batch of rows per job, the next batch queued in the same transaction. */
const batchJob = (queue: 'import.check' | 'import.run', dry: boolean): JobDefinition => ({
  queue,
  atomic: true,
  leaseSeconds: 600,
  async handle(job, tx) {
    const db = tx as Transaction;
    const imp = await importOrThrow(db, job.orgId, job.payload.importId as string, true);

    if (imp.status !== (dry ? 'checking' : 'running')) return;

    let actor: Actor;

    try {
      actor = await memberActor(db, job.orgId, imp.createdBy);
    } catch (error) {
      await fail(db, imp.id, (error as Error).message);

      return;
    }

    // The first batch's key carries a nonce (`0:<id>`); later ones the last row number.
    const after = Number(String(job.payload.after ?? 0).split(':')[0]);

    const rows = await db
      .select()
      .from(importRows)
      .where(and(eq(importRows.importId, imp.id), gt(importRows.rowNumber, after)))
      .orderBy(asc(importRows.rowNumber))
      .limit(BATCH);

    const isCompany = imp.recordType === 'company';

    const ctx: Context = {
      actor,
      caller: userCaller(actor),
      imp,
      isCompany,
      columns: new Map(
        (await transferColumns(db, job.orgId, imp.recordType)).map((column) => [
          column.key,
          column,
        ]),
      ),
      owners: new Map(),
      tags: new Map(),
      companies: new Map(),
    };

    await withImportCause({ importId: imp.id, quiet: !imp.options.runAutomations }, async () => {
      for (const row of rows) {
        const result = await processRow(db, ctx, row, dry);

        await db
          .update(importRows)
          .set({
            action: result.action,
            error: result.error ?? null,
            recordId: result.recordId ?? null,
          })
          .where(and(eq(importRows.importId, imp.id), eq(importRows.rowNumber, row.rowNumber)));
      }
    });

    const processed = imp.processed + rows.length;

    if (rows.length === BATCH) {
      await db
        .update(imports)
        .set({ processed, updatedAt: sql`now()` })
        .where(eq(imports.id, imp.id));
      await queueStep(db, imp, queue, { after: rows.at(-1)!.rowNumber });

      return;
    }

    const counts = await countsOf(db, imp.id, imp.counts.rows);

    await db
      .update(imports)
      .set({
        processed,
        counts,
        status: dry ? 'checked' : 'done',
        finishedAt: dry ? null : sql`now()`,
        updatedAt: sql`now()`,
      })
      .where(eq(imports.id, imp.id));

    if (!dry) {
      await recordAudit(db, ctx.caller, {
        action: 'import.completed',
        targetType: 'import',
        targetId: imp.id,
        targetLabel: imp.fileName,
        metadata: { recordType: imp.recordType, ...counts, options: imp.options },
      });
      await notify(
        db,
        {
          orgId: job.orgId,
          actorType: 'system',
          actorId: null,
          source: 'core',
        } as unknown as Caller,
        {
          userIds: [imp.createdBy],
          kind: 'core.import.done',
          title: `Import of ${imp.fileName} finished`,
          body: `${counts.create} created, ${counts.update} updated, ${counts.skip} skipped, ${counts.error} with errors`,
          link: `/contacts/settings/import-export?import=${imp.id}`,
          entity: { type: 'import', id: imp.id },
        },
      ).catch((error: unknown) => log.warn('could not tell the importer', { error }));
    }
  },
  async onDead(job, error, tx) {
    await fail(tx, job.payload.importId as string, `Stopped: ${error}`);
  },
});

export const importCheckJob = batchJob('import.check', true);
export const importRunJob = batchJob('import.run', false);

/** Undo: the created records to the recycle bin, a batch per job. */
export const importUndoJob: JobDefinition = {
  queue: 'import.undo',
  atomic: true,
  leaseSeconds: 600,
  async handle(job, tx) {
    const db = tx as Transaction;
    const imp = await importOrThrow(db, job.orgId, job.payload.importId as string, true);

    if (imp.status !== 'running') return;

    const actor = await memberActor(db, job.orgId, String(job.payload.by ?? imp.createdBy));

    const rows = await db
      .select({ rowNumber: importRows.rowNumber, recordId: importRows.recordId })
      .from(importRows)
      .where(
        and(
          eq(importRows.importId, imp.id),
          eq(importRows.action, 'create'),
          isNotNull(importRows.recordId),
        ),
      )
      .orderBy(asc(importRows.rowNumber))
      .limit(BATCH);

    if (rows.length) {
      const ids = rows.map((row) => row.recordId!);

      if (imp.recordType === 'company')
        await removeCompanies(db, actor, ids, { undoingImport: true });
      else await removeCustomers(db, actor, ids, { undoingImport: true });

      await db
        .update(importRows)
        .set({ action: 'skip', error: 'Undone', recordId: null })
        .where(
          and(
            eq(importRows.importId, imp.id),
            inArray(
              importRows.rowNumber,
              rows.map((row) => row.rowNumber),
            ),
          ),
        );
    }

    if (rows.length === BATCH) {
      await queueStep(db, imp, 'import.undo', {
        after: rows.at(-1)!.rowNumber,
        by: job.payload.by,
      });

      return;
    }

    await db
      .update(imports)
      .set({ status: 'undone', updatedAt: sql`now()` })
      .where(eq(imports.id, imp.id));
  },
  async onDead(job, error, tx) {
    await fail(tx, job.payload.importId as string, `Undo stopped: ${error}`);
  },
};
