import type { BankAccount, StatementQuery } from '@erxes/core-contract';
import type { z } from 'zod';
import { type Db, integrationConnections, requestOrgId, withOrg } from '@erxes/core-db';
import { and, eq, inArray } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { wholeList } from '~/lib/keyset';
import {
  BANK_KEYS,
  BANK_OF_INTEGRATION,
  bankConfigOf,
  createBankClient,
  khanbankTaxes,
} from '~/modules/integrations/banks';
import type { BankConfig } from '~/modules/integrations/banks/types';
import {
  type ConnectionRow,
  connectionsWithSecret,
  keysOf,
} from '~/modules/integrations/connections';
import { INTEGRATIONS, keyedOf } from '~/modules/integrations/registry';

const configOf = (row: ConnectionRow) => bankConfigOf(row.key, keysOf(keyedOf(row.key), row));

/** Whether the keys let it send money: what each bank asks for transfers. */
export const canTransfer = (settings: BankConfig) =>
  settings.kind === 'khanbank'
    ? Boolean(settings.transactionPassword)
    : settings.kind === 'golomt'
      ? Boolean(settings.transferSecret)
      : true;

/** The bank's refusal, as the API answers it. */
const refused = (error: unknown) =>
  fail('BANK_REFUSED', error instanceof Error ? error.message : String(error));

/** Asks the bank, its refusals answered as BANK_REFUSED. */
const ask = async <T>(question: () => Promise<T>) => {
  try {
    return await question();
  } catch (error) {
    throw refused(error);
  }
};

const bankConnections = (client: Db) =>
  connectionsWithSecret(client).where(inArray(integrationConnections.key, BANK_KEYS));

const connectionOrThrow = async (client: Db, id: string) => {
  const [row] = await connectionsWithSecret(client)
    .where(and(eq(integrationConnections.id, id), inArray(integrationConnections.key, BANK_KEYS)))
    .limit(1);

  if (!row) throw notFound('Bank connection');

  return row;
};

/** The connection's client, read in a short scope: the bank is asked outside any. */
export const bankOf = async (id: string) => {
  const row = await withOrg(requestOrgId(), (tx) => connectionOrThrow(tx, id));
  const settings = configOf(row);

  return { row, settings, bank: createBankClient(settings, { cacheKey: row.id }) };
};

/**
 * The organisation's bank connections (Settings › Integrations › Banks), for
 * picking one: its bank and whether it can send money, never its keys.
 */
export const listBankConnections = async (client: Db) => {
  const rows = await wholeList((limit) =>
    bankConnections(client).orderBy(integrationConnections.createdAt).limit(limit),
  );

  return {
    data: rows.map((row) => ({
      id: row.id,
      key: row.key,
      kind: BANK_OF_INTEGRATION[row.key] ?? 'khanbank',
      name: row.name,
      status: row.status,
      transfers: canTransfer(configOf(row)),
    })),
  };
};

/** The payment connections, turned on, that read their statement through the bank connection. */
const paymentsUsing = async (client: Db, id: string) => {
  const readers = INTEGRATIONS.flatMap((integration) =>
    integration.keys && integration.readsThrough ? [integration.key] : [],
  );

  const rows = await connectionsWithSecret(client).where(
    and(inArray(integrationConnections.key, readers), eq(integrationConnections.status, 'active')),
  );

  return rows.filter((row) => keysOf(keyedOf(row.key), row).connectionId === id);
};

/**
 * A bank connection an active payment connection still reads its statement
 * through isn't removed: turn the payment off first (its invoices stay).
 * Transfers made through it stay in the record either way.
 */
export const releaseBank = async (client: Db, id: string) => {
  const users = await paymentsUsing(client, id);

  if (users.length > 0)
    throw fail(
      'BANK_IN_USE',
      `Payments use it: ${users.map((user) => user.name).join(', ')}. Turn them off first`,
    );
};

export const listAccounts = async (id: string): Promise<{ data: BankAccount[] }> => {
  const { bank } = await bankOf(id);

  return { data: await ask(() => bank.accounts()) };
};

export const getAccount = async (id: string, account: string) => {
  const { bank } = await bankOf(id);

  return ask(() => bank.account(account));
};

export const getStatement = async (query: z.infer<typeof StatementQuery>) => {
  const { bank } = await bankOf(query.id);

  return ask(() => bank.statement(query));
};

/** Khan Bank's tax lookups, through a Khan Bank connection. */
const taxesOf = async (id: string) => {
  const { settings } = await bankOf(id);

  if (settings.kind !== 'khanbank') throw fail('NOT_SUPPORTED', 'Tax lookups are Khan Bank’s');

  return khanbankTaxes(settings, { cacheKey: id });
};

export const findTaxpayer = async (id: string, registrationNumber: string) => {
  const taxes = await taxesOf(id);

  return ask(() => taxes.taxpayer(registrationNumber));
};

export const findTaxInvoices = async (id: string, by: 'invoice' | 'capital', value: string) => {
  const taxes = await taxesOf(id);

  return { data: await ask(() => taxes.invoices(by, value)) };
};
