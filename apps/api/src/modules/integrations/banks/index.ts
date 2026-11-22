import { z } from 'zod';
import {
  defineIntegration,
  digits,
  field,
  httpsUrl,
  type KeyedIntegration,
  secret,
} from '../define';
import type { DriverOptions } from '../gateways/types';
import { golomtClient } from './golomt';
import { khanbankClient } from './khanbank';
import { tdbClient } from './tdb';
import type { BankClient, BankConfig, BankKind, BankOptions } from './types';

/** Exactly 16 characters: Golomt's AES-128 keys. */
const aesKey = (label: string) => secret(label, z.string().trim().length(16, '16 characters'));

/** Khan Bank: consumer key and secret; the transaction password only if transfers are made. */
const khanbankKeys = z.object({
  description: field('Description').optional(),
  consumerKey: field('Consumer key'),
  secretKey: secret('Secret key'),
  transactionPassword: secret('Transaction password').optional(),
});

/**
 * Golomt Bank: the organisation's register number, the login Golomt gave, its
 * client id and two 16-character keys; the transfer code secret (base 32)
 * only if transfers are made.
 */
const golomtKeys = z.object({
  apiUrl: field('API address', httpsUrl()),
  registerNumber: field('Register number', digits().max(20)),
  username: field('Username'),
  password: secret('Password'),
  clientId: field('Client ID'),
  sessionKey: aesKey('Session key'),
  ivKey: aesKey('IV key'),
  transferSecret: secret(
    'Transfer code secret',
    z
      .string()
      .trim()
      .regex(/^[A-Z2-7]{16,64}=*$/iu, 'base-32'),
  ).optional(),
});

/** TDB: its corporate gateway address and OAuth client. */
const tdbKeys = z.object({
  description: field('Description').optional(),
  apiUrl: field('API address', httpsUrl()),
  clientId: field('Client ID'),
  clientSecret: secret('Client secret'),
});

/** The client for a bank connection's keys. */
export const createBankClient = (config: BankConfig, options: BankOptions = {}): BankClient => {
  switch (config.kind) {
    case 'khanbank':
      return khanbankClient(config, options);
    case 'golomt':
      return golomtClient(config, options);
    case 'tdb':
      return tdbClient(config, options);
  }
};

/** A bank connection's keys as its client's config. */
export const bankConfigOf = (key: string, keys: unknown): BankConfig => {
  switch (key) {
    case 'khanbank-cgw':
      return { kind: 'khanbank', ...khanbankKeys.parse(keys) };
    case 'golomt-cgw':
      return { kind: 'golomt', ...golomtKeys.parse(keys) };
    case 'tdb-cgw':
      return { kind: 'tdb', ...tdbKeys.parse(keys) };
    default:
      throw new Error(`${key} is not a bank`);
  }
};

const bank = <K extends z.ZodObject>(
  definition: Omit<KeyedIntegration<K>, 'verify' | 'category' | 'countries' | 'permission'>,
) =>
  defineIntegration({
    ...definition,
    category: 'banks',
    countries: ['MN'],
    permission: 'integrations.manage',
    verify: (keys: z.output<K>, options: DriverOptions) =>
      createBankClient(bankConfigOf(definition.key, keys), options).verify(),
  });

export const khanbankBank = bank({
  key: 'khanbank-cgw',
  name: 'Khan Bank corporate gateway',
  summary: 'Accounts, statements, transfers and tax lookups at Khan Bank.',
  dashboard: 'https://www.khanbank.com/business/product/detail/business-corporate-gateway/',
  keys: khanbankKeys,
});

export const golomtBank = bank({
  key: 'golomt-cgw',
  name: 'Golomt Bank corporate gateway',
  summary: 'Accounts, statements and transfers at Golomt Bank.',
  keys: golomtKeys,
});

export const tdbBank = bank({
  key: 'tdb-cgw',
  name: 'TDB corporate gateway',
  summary: 'Accounts, statements and transfers at the Trade and Development Bank.',
  keys: tdbKeys,
});

/** Each bank integration's bank. */
export const BANK_OF_INTEGRATION: Readonly<Record<string, BankKind>> = {
  [khanbankBank.key]: 'khanbank',
  [golomtBank.key]: 'golomt',
  [tdbBank.key]: 'tdb',
};

export const BANK_KEYS = Object.keys(BANK_OF_INTEGRATION);

export const isBank = (key: string) => key in BANK_OF_INTEGRATION;

export { golomtCipher, golomtTransferCode } from './golomt';

export { khanbankTaxes } from './khanbank';
