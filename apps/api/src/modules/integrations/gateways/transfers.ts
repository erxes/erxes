import { z } from 'zod';
import { golomtClient } from '../banks/golomt';
import { khanbankClient } from '../banks/khanbank';
import { tdbClient } from '../banks/tdb';
import type { BankClient, StatementLine } from '../banks/types';
import { defineIntegration, digits, field } from '../define';
import { NO_INSTRUCTIONS } from './http';
import { matchingTransfers, referenceWords } from './transferMatch';
import {
  type ClientOptions,
  type CreateInvoiceInput,
  GatewayError,
  type GatewayInvoice,
} from './types';

/**
 * Paid by transfer, as in 3.x: a corporate gateway connection of the bank
 * (picked from the bank's integration) and its account payers transfer to.
 * The account's IBAN and name are kept to show the payer.
 */
const keys = z.object({
  connectionId: field('Config'),
  accountNumber: field('Account', digits().max(40)),
  iban: field('IBAN').optional(),
  accountName: field('Account name').optional(),
});

type TransferAccount = z.output<typeof keys>;

const MAX_PAGES = 50;
const CLOCK_SLACK_MS = 5 * 60_000;

/** When the invoice was made (less a few minutes for the bank's clock) and its reference. */
const State = z.object({ transferSince: z.iso.datetime(), transferReference: z.string() });

/** YYYY-MM-DD in Ulaanbaatar time, the bank's statement day. */
const statementDay = (date: Date) =>
  date.toLocaleDateString('en-CA', { timeZone: 'Asia/Ulaanbaatar' });

/** The account payers transfer to, and the statement of it read through the bank connection. */
const transferClient = (bankName: string, account: TransferAccount, bank: BankClient | null) => {
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

  return { bankName, account, connected, since };
};

type TransferClient = ReturnType<typeof transferClient>;

const createInvoice = ({ bankName, account }: TransferClient, input: CreateInvoiceInput) => {
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
};

/** The statement's transfers that match: several can, and core settles with the first free one. */
const check = async ({ account, since }: TransferClient, { amount, state }: GatewayInvoice) => {
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
};

/**
 * Paid by transfer: the payer sends the money to the merchant's account with
 * the invoice's reference (its description) in the transfer's description,
 * and `check` finds it on the account's statement, read through the bank
 * connection's corporate gateway. Several transfers can match; core settles
 * the invoice with the first no other invoice was settled with.
 */
const transferIntegration = ({
  key,
  name,
  bankName,
  readsThrough,
  bankClient,
}: {
  key: 'khanbank' | 'tdbcgw' | 'golomtcgw';
  name: string;
  bankName: string;
  readsThrough: string;
  bankClient: (options: ClientOptions) => BankClient | null;
}) =>
  defineIntegration({
    key,
    name,
    summary: `Payers transfer to your ${bankName} account; erxes finds the transfer on its statement.`,
    category: 'payments',
    countries: ['MN'],
    permission: 'payments.manage',
    keys,
    readsThrough,
    client: (account, options) => transferClient(bankName, account, bankClient(options)),
    async verify({ account, connected }) {
      await connected().account(account.accountNumber);
    },
    payments: {
      currencies: ['MNT'],
      refunds: 'none',
      pays: 'bank-transfer',
      createInvoice,
      check,
      async cancel() {
        // Nothing is opened at the bank: the transfer just never comes.
      },
      refund() {
        return Promise.reject(
          new GatewayError(`${bankName} refunds are made by transfer from the bank`),
        );
      },
    },
  });

export const khanbankTransfer = transferIntegration({
  key: 'khanbank',
  name: 'Khanbank transfer',
  bankName: 'Khan Bank',
  readsThrough: 'khanbank-cgw',
  bankClient: (options) =>
    options.bank?.kind === 'khanbank' ? khanbankClient(options.bank, options) : null,
});

export const tdbTransfer = transferIntegration({
  key: 'tdbcgw',
  name: 'TDB transfer',
  bankName: 'TDB',
  readsThrough: 'tdb-cgw',
  bankClient: (options) => (options.bank?.kind === 'tdb' ? tdbClient(options.bank, options) : null),
});

export const golomtTransfer = transferIntegration({
  key: 'golomtcgw',
  name: 'Golomt transfer',
  bankName: 'Golomt Bank',
  readsThrough: 'golomt-cgw',
  bankClient: (options) =>
    options.bank?.kind === 'golomt' ? golomtClient(options.bank, options) : null,
});
