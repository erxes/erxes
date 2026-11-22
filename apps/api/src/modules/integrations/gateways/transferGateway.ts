import { z } from 'zod';
import type { BankClient, StatementLine } from '../banks/types';
import { NO_INSTRUCTIONS } from './http';
import { matchingTransfers, referenceWords } from './transferMatch';
import { type GatewayDriver, GatewayError } from './types';

const MAX_PAGES = 50;
const CLOCK_SLACK_MS = 5 * 60_000;

/** When the invoice was made (less a few minutes for the bank's clock) and its reference. */
const State = z.object({ transferSince: z.iso.datetime(), transferReference: z.string() });

/** YYYY-MM-DD in Ulaanbaatar time, the bank's statement day. */
const statementDay = (date: Date) =>
  date.toLocaleDateString('en-CA', { timeZone: 'Asia/Ulaanbaatar' });

/** The account payers transfer to, and how it's shown to them. */
export interface TransferAccount {
  accountNumber: string;
  iban?: string;
  accountName?: string;
}

/**
 * Paid by transfer: the payer sends the money to the merchant's account with
 * the invoice's reference (its description) in the transfer's description,
 * and `check` finds it on the account's statement, read through the bank
 * connection's corporate gateway. Several transfers can match; core settles
 * the invoice with the first no other invoice was settled with.
 */
export const transferGateway = ({
  kind,
  bankName,
  bank,
  account,
}: {
  kind: 'khanbank' | 'tdbcgw' | 'golomtcgw';
  bankName: string;
  bank: BankClient | null;
  account: TransferAccount;
}): GatewayDriver => {
  const connected = () => {
    if (!bank) throw new GatewayError(`${bankName} needs its connection in Bank accounts`);

    return bank;
  };

  /** Every statement line since `from`, page after page while the bank says there's more. */
  const since = async (from: Date, page = 1): Promise<StatementLine[]> => {
    if (page > MAX_PAGES) throw new GatewayError(`${bankName} statement is too long to search`);

    const found = await connected().statement({
      account: account.accountNumber,
      from: statementDay(from),
      to: statementDay(new Date()),
      page,
    });

    return found.more ? [...found.lines, ...(await since(from, page + 1))] : found.lines;
  };

  return {
    kind,
    async verify() {
      await connected().account(account.accountNumber);
    },
    createInvoice(input) {
      if (referenceWords(input.description).length === 0)
        return Promise.reject(
          new GatewayError(
            `${bankName} needs a description with letters or numbers to match the transfer`,
          ),
        );

      return Promise.resolve({
        gatewayInvoiceId: input.invoiceId,
        payment: {
          ...NO_INSTRUCTIONS,
          bankTransfer: {
            bank: bankName,
            accountNumber: account.accountNumber,
            iban: account.iban ?? null,
            accountName: account.accountName ?? null,
            amount: input.amount,
            reference: input.description,
          },
        },
        state: {
          transferSince: new Date(Date.now() - CLOCK_SLACK_MS).toISOString(),
          transferReference: input.description,
        },
      });
    },
    async check(_gatewayInvoiceId, amount, state) {
      const stored = State.parse(state);
      const from = new Date(stored.transferSince);

      const paymentIds = matchingTransfers(await since(from), {
        amount,
        reference: stored.transferReference,
        since: from,
      }).map((line) => `${account.accountNumber}:${line.id}`);

      return {
        paid: paymentIds.length > 0,
        paidAmount: paymentIds.length > 0 ? amount : 0,
        paymentId: paymentIds[0] ?? null,
        paymentIds,
      };
    },
    async cancel() {
      // Nothing is opened at the bank: the transfer just never comes.
    },
    refund() {
      return Promise.reject(
        new GatewayError(`${bankName} refunds are made by transfer from the bank`),
      );
    },
  };
};
