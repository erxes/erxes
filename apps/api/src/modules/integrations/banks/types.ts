import { currencyDigits } from '../gateways/http';
import type { ClientOptions } from '../gateways/types';

export type BankKind = 'khanbank' | 'golomt' | 'tdb';

/** Khan Bank corporate gateway (api.khanbank.com): its consumer keys. */
export interface KhanbankBankConfig {
  kind: 'khanbank';
  consumerKey: string;
  secretKey: string;
  /** The transaction password the bank gave for transfers, if transfers are made. */
  transactionPassword?: string;
}

/** Golomt Bank corporate gateway: the organisation's credentials and keys from Golomt. */
export interface GolomtBankConfig {
  kind: 'golomt';
  apiUrl: string;
  registerNumber: string;
  /** The login name Golomt gave. */
  username: string;
  password: string;
  clientId: string;
  /** AES-128 keys (16 characters each) Golomt gave, and the base-32 secret of its transfer codes. */
  sessionKey: string;
  ivKey: string;
  transferSecret?: string;
}

/** TDB (Trade and Development Bank) corporate gateway: its OAuth client. */
export interface TdbBankConfig {
  kind: 'tdb';
  apiUrl: string;
  clientId: string;
  clientSecret: string;
}

export type BankConfig = KhanbankBankConfig | GolomtBankConfig | TdbBankConfig;

/** An account at the bank. Amounts are integers in the currency's smallest unit. */
export interface BankAccount {
  number: string;
  iban: string | null;
  name: string | null;
  currency: string;
  balance: number | null;
  available: number | null;
  hold: number | null;
  status: string | null;
}

/** One line of a statement: money in is positive, out negative. */
export interface StatementLine {
  /** The bank's id of the line (Khan Bank's record, TDB's reference). */
  id: string;
  /** When it was made, as the bank tells it (ISO; Ulaanbaatar time when the bank gives no zone). */
  date: string | null;
  amount: number;
  balance: number | null;
  description: string;
  counterparty: { account: string | null; name: string | null; bank: string | null } | null;
}

interface Statement {
  lines: StatementLine[];
  openingBalance: number | null;
  closingBalance: number | null;
  /** Whether the next page holds more lines. */
  more: boolean;
}

interface StatementQuery {
  account: string;
  /** YYYY-MM-DD, both days included. */
  from: string;
  to: string;
  /** From 1. */
  page: number;
}

/**
 * Money sent from one of the organisation's accounts: to an account at the
 * same bank (`domestic`) or at another (`interbank`, with the bank's code and
 * the account's name). `reference` is ours and unique per transfer, so the
 * bank sends it once however often it is asked.
 */
export interface TransferInput {
  type: 'domestic' | 'interbank';
  reference: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: string;
  description: string;
  toAccountName?: string;
  toBank?: string;
  toCurrency?: string;
  /** Khan Bank asks the internet bank user who sends it, each time. Never kept. */
  sender?: { loginName: string; password: string };
}

interface TransferResult {
  /** The bank's id of the transfer (journal or transaction number). */
  bankReference: string | null;
}

/** What core asks of a bank. */
export interface BankClient {
  kind: BankKind;
  /** Signs in and lists the accounts: throws when the bank refuses. */
  verify(): Promise<void>;
  accounts(): Promise<BankAccount[]>;
  account(number: string): Promise<BankAccount>;
  statement(query: StatementQuery): Promise<Statement>;
  transfer(input: TransferInput): Promise<TransferResult>;
}

export type BankOptions = Pick<ClientOptions, 'fetch' | 'cacheKey'>;

/** A bank's decimal amount (12.5 USD) as core's integer (1250). */
export const toMinor = (amount: number, currency: string) =>
  Math.round(amount * 10 ** currencyDigits(currency || 'MNT'));

/** Core's integer amount (1250 USD) as the bank's decimal (12.5). */
export const fromMinor = (amount: number, currency: string) =>
  amount / 10 ** currencyDigits(currency || 'MNT');

/** A bank's number or null, for amounts it may leave out. */
export const minorOrNull = (amount: unknown, currency: string) => {
  const value = typeof amount === 'string' ? Number(amount) : amount;

  return typeof value === 'number' && Number.isFinite(value) ? toMinor(value, currency) : null;
};

/** YYYY-MM-DD → YYYYMMDD, as Khan Bank and Golomt take days. */
export const compactDay = (day: string) => day.replaceAll('-', '');
