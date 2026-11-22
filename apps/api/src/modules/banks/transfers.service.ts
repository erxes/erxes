import { type CursorQuery, type TransferInput } from '@erxes/core-contract';
import { bankTransfers, caller, type Db, newId, requestOrgId, withOrg } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import type { z } from 'zod';
import { fail } from '~/http/errors';
import { keysetPage } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import type { BankClient } from '~/modules/integrations/banks/types';
import { bankOf, canTransfer } from './banks.service';

/** Money sent from the organisation's bank accounts: claimed once, sent once, always kept. */

const transferRow = (row: typeof bankTransfers.$inferSelect) => ({
  id: row.id,
  connectionId: row.connectionId,
  bank: row.bank,
  reference: row.reference,
  type: row.type,
  fromAccount: row.fromAccount,
  toAccount: row.toAccount,
  toAccountName: row.toAccountName,
  toBank: row.toBank,
  amount: row.amount,
  currency: row.currency,
  description: row.description,
  status: row.status,
  bankReference: row.bankReference,
  error: row.error,
  createdBy: row.createdBy,
  createdAt: row.createdAt,
  sentAt: row.sentAt,
});

/**
 * Claims the reference before the bank is asked, in its own committed scope:
 * a reference already used (by this request run twice, or two at once) is
 * refused, so the same transfer is never sent twice.
 */
const claim = async (
  orgId: string,
  bank: BankClient['kind'],
  input: z.infer<typeof TransferInput>,
) =>
  withOrg(orgId, async (tx) => {
    const [row] = await tx
      .insert(bankTransfers)
      .values({
        id: newId(),
        connectionId: input.id,
        bank,
        reference: input.reference,
        type: input.type,
        fromAccount: input.fromAccount,
        toAccount: input.toAccount,
        toAccountName: input.toAccountName ?? null,
        toBank: input.toBank ?? null,
        amount: input.amount,
        currency: input.currency,
        description: input.description,
        status: 'sending',
        createdBy: caller('user').userId,
      })
      .onConflictDoNothing()
      .returning();

    if (!row)
      throw fail(
        'TRANSFER_REPEATED',
        'A transfer with this reference was already made: check the transfers before sending again',
      );

    return row;
  });

/**
 * Sends money: claims the reference, asks the bank once, and records what it
 * answered. A transfer the bank refused is kept as `failed` and answered; one
 * the bank never answered stays `sending` and is never sent again by core.
 */
export const sendTransfer = async (input: z.infer<typeof TransferInput>) => {
  const orgId = requestOrgId();
  const { row: connection, settings, bank } = await bankOf(input.id);

  if (!canTransfer(settings))
    throw fail(
      'NOT_SUPPORTED',
      'This connection has no transfer credentials: add them to its settings first',
    );

  const claimed = await claim(orgId, settings.kind, input);

  const answer = await bank.transfer({ ...input, reference: claimed.reference }).then(
    (result) => ({ ok: true as const, bankReference: result.bankReference }),
    (error: unknown) => ({
      ok: false as const,
      error: error instanceof Error ? error.message : String(error),
    }),
  );

  return withOrg(orgId, async (tx) => {
    const row = oneRow(
      await tx
        .update(bankTransfers)
        .set(
          answer.ok
            ? { status: 'sent', bankReference: answer.bankReference, sentAt: sql`now()` }
            : { status: 'failed', error: answer.error.slice(0, 1000) },
        )
        .where(and(eq(bankTransfers.id, claimed.id), eq(bankTransfers.status, 'sending')))
        .returning(),
    );

    await recordAudit(tx, {
      action: answer.ok ? 'bank.transfer_sent' : 'bank.transfer_failed',
      targetType: 'bank_transfer',
      targetId: row.id,
      targetLabel: `${row.amount} ${row.currency} → ${row.toAccount}`,
      metadata: {
        connection: connection.name,
        from: row.fromAccount,
        to: row.toAccount,
        amount: row.amount,
        currency: row.currency,
      },
    });

    return transferRow(row);
  });
};

export const listTransfers = (client: Db, query: CursorQuery) =>
  keysetPage(
    client,
    {
      table: bankTransfers,
      id: bankTransfers.id,
      createdAt: bankTransfers.createdAt,
      countCap: 10_000,
    },
    undefined,
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(bankTransfers)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  ).then((page) => ({ ...page, data: page.data.map(transferRow) }));
