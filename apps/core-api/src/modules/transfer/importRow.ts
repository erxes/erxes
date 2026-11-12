import { CompanyFields, CustomerFields } from '@erxes/core-contract';
import type { Db } from '@erxes/core-db';
import { ZodError } from 'zod';
import { HttpError } from '~/http/errors';
import { normalizeEmail } from '~/lib/contacts';
import { createCompany, updateCompany } from '~/modules/companies/companies.service';
import {
  createCustomer,
  linkCustomerCompany,
  updateCustomer,
} from '~/modules/customers/customers.service';
import { CellError, customValue, parseDate, parseNumber, splitList } from './columns';
import {
  companyIds,
  type Context,
  type Created,
  existingTags,
  findExisting,
  ownerId,
  tagIds,
} from './importLookups';
import type { Action, Row } from './importState';

interface Refs {
  owner?: string;
  tags?: string[];
  companies?: string[];
  id?: string;
}

/** Sets what one mapped cell says on the record's input or its references. */
const readCell = (input: Record<string, unknown>, refs: Refs, key: string, raw: string) => {
  if (key === 'id') refs.id = raw;
  else if (key === 'owner') refs.owner = normalizeEmail(raw);
  else if (key === 'tags') refs.tags = splitList(raw);
  else if (key === 'companies') refs.companies = splitList(raw);
  else if (key === 'name') {
    const [first = '', ...rest] = raw.split(/\s+/);

    input.firstName ??= first;

    if (rest.length) input.lastName ??= rest.join(' ');
  } else if (key === 'emails' || key === 'phones' || key === 'names') input[key] = splitList(raw);
  else if (key === 'birthDate') input.birthDate = parseDate(raw);
  else if (key === 'size') input.size = Math.round(parseNumber(raw));
  else if (key === 'state') {
    const state = raw.toLowerCase();

    if (state !== 'lead' && state !== 'customer')
      throw new CellError(`State is lead or customer, not “${raw}”`);
    input.state = state;
  } else input[key] = raw;
};

/** One row's cells → the record's input (checked by the contract's schema later) and the things it names. */
const readRow = (ctx: Context, cells: string[]) => {
  const input: Record<string, unknown> = {};
  const customFields: Record<string, unknown> = {};
  const refs: Refs = {};

  for (const [index, key] of Object.entries(ctx.imp.mapping)) {
    const raw = (cells[Number(index)] ?? '').trim();

    if (!raw) continue;

    const column = ctx.columns.get(key);

    try {
      if (key.startsWith('customFields.'))
        customFields[key.slice('customFields.'.length)] = customValue(column?.fieldType, raw);
      else readCell(input, refs, key, raw);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new CellError(`${column?.label ?? key}: ${message}`, { cause: error });
    }
  }

  if (Object.keys(customFields).length) input.customFields = customFields;

  return { input, refs };
};

const messageOf = (error: unknown) => {
  if (error instanceof HttpError || error instanceof CellError) return error.message;

  if (error instanceof ZodError && error.issues.length)
    return error.issues
      .map((issue) => `${issue.path.join('.') || 'row'}: ${issue.message}`)
      .join('; ');

  return error instanceof Error ? error.message : String(error);
};

/** Owner, tags (added, never taken away) and state: what the row's references and the options add. */
const completeInput = async (
  sp: Db,
  ctx: Context,
  read: ReturnType<typeof readRow>,
  existing: string | null,
  created: Created,
) => {
  const { input, refs } = read;
  const { options } = ctx.imp;

  if (refs.owner) input.ownerId = await ownerId(sp, ctx, refs.owner);
  else if (!existing && options.ownerId) input.ownerId = options.ownerId;

  const rowTags = refs.tags ? await tagIds(sp, ctx, refs.tags, created) : [];
  const optionTags = options.tagIds ?? [];

  if (rowTags.length || optionTags.length) {
    const kept = existing ? await existingTags(sp, ctx, existing) : [];

    input.tagIds = [...new Set([...kept, ...rowTags, ...optionTags])];
  }

  if (!ctx.isCompany) {
    if (ctx.imp.recordType === 'lead') input.state = 'lead';
    else if (!existing) input.state ??= 'customer';
  }
};

/** Creates the record, or updates the existing one; its id. */
const saveRecord = async (
  sp: Db,
  ctx: Context,
  input: Record<string, unknown>,
  existing: string | null,
) => {
  if (ctx.isCompany) {
    const company = CompanyFields.parse(input);

    if (existing) {
      if (Object.keys(company).length) await updateCompany(sp, ctx.actor, existing, company);

      return existing;
    }

    if (!company.primaryName) throw new CellError('Name: a company needs a name');

    return (await createCompany(sp, ctx.actor, { ...company, primaryName: company.primaryName }))
      .id;
  }

  const customer = CustomerFields.parse(input);

  if (existing) {
    if (Object.keys(customer).length) await updateCustomer(sp, ctx.actor, existing, customer);

    return existing;
  }

  if (!customer.firstName && !customer.lastName && !customer.primaryEmail && !customer.primaryPhone)
    throw new CellError('A customer needs a name, an email or a phone');

  return (await createCustomer(sp, ctx.actor, customer)).id;
};

class DryRun extends Error {}

/**
 * One row: read it, find its record, decide (create, update, skip), and do it
 * in a savepoint — a dry run (the check) rolls the savepoint back, so it sees
 * exactly what running would (uniqueness, property rules), changing nothing.
 */
export const processRow = async (
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

  const existing = await findExisting(tx, ctx, read.input, read.refs);
  const { mode } = ctx.imp.options;

  if (mode === 'create' && existing)
    return { action: 'skip', error: 'Already exists', recordId: existing };

  if (mode === 'update' && !existing)
    return { action: 'skip', error: 'No existing record matches' };

  const created: Created = new Map();
  let recordId = existing ?? undefined;

  try {
    await tx.transaction(async (sp) => {
      await completeInput(sp, ctx, read, existing, created);
      recordId = await saveRecord(sp, ctx, read.input, existing);

      if (read.refs.companies?.length && !ctx.isCompany) {
        for (const companyId of await companyIds(sp, ctx, read.refs.companies, created))
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

  return {
    action: existing ? 'update' : 'create',
    recordId: dry ? (existing ?? undefined) : recordId,
  };
};
