import type { BankKind } from '@erxes/core-contract';

/** Each bank's name, as payers and members know it. */
export const BANK_NAMES: Record<BankKind, string> = {
  khanbank: 'Khan Bank',
  golomt: 'Golomt Bank',
  tdb: 'TDB',
};
