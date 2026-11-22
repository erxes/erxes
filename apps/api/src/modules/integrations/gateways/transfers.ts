import { z } from 'zod';
import { golomtClient } from '../banks/golomt';
import { khanbankClient } from '../banks/khanbank';
import { tdbClient } from '../banks/tdb';
import type { BankClient } from '../banks/types';
import { defineIntegration, digits, field } from '../define';
import { transferGateway } from './transferGateway';
import type { DriverOptions } from './types';

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

type TransferKeys = z.output<typeof keys>;

const transferIntegration = ({
  key,
  name,
  bankName,
  readsThrough,
  client,
}: {
  key: 'khanbank' | 'tdbcgw' | 'golomtcgw';
  name: string;
  bankName: string;
  readsThrough: string;
  client: (options: DriverOptions) => BankClient | null;
}) => {
  const driver = (config: TransferKeys, options: DriverOptions = {}) =>
    transferGateway({ kind: key, bankName, bank: client(options), account: config });

  return defineIntegration({
    key,
    name,
    summary: `Payers transfer to your ${bankName} account; erxes finds the transfer on its statement.`,
    category: 'payments',
    countries: ['MN'],
    permission: 'payments.manage',
    keys,
    readsThrough,
    verify: (config, options) => driver(config, options).verify(),
    payments: { currencies: ['MNT'], refunds: 'none', pays: 'bank-transfer', driver },
  });
};

export const khanbankTransfer = transferIntegration({
  key: 'khanbank',
  name: 'Khanbank transfer',
  bankName: 'Khan Bank',
  readsThrough: 'khanbank-cgw',
  client: (options) =>
    options.bank?.kind === 'khanbank' ? khanbankClient(options.bank, options) : null,
});

export const tdbTransfer = transferIntegration({
  key: 'tdbcgw',
  name: 'TDB transfer',
  bankName: 'TDB',
  readsThrough: 'tdb-cgw',
  client: (options) => (options.bank?.kind === 'tdb' ? tdbClient(options.bank, options) : null),
});

export const golomtTransfer = transferIntegration({
  key: 'golomtcgw',
  name: 'Golomt transfer',
  bankName: 'Golomt Bank',
  readsThrough: 'golomt-cgw',
  client: (options) =>
    options.bank?.kind === 'golomt' ? golomtClient(options.bank, options) : null,
});
