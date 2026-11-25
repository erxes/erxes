import { TR_SIDES } from '../../types/constants';
import type { ITransaction } from '../../types/Transaction';
import type { TAddTransactionGroup, TTrDoc } from '../types/JournalForms';

export type TRelatedAccountReplacement = NonNullable<
  TAddTransactionGroup['relatedAccountReplacements']
>[number];

export const RELATED_ACCOUNT_SIDES = ['dt', 'ct'] as const;
type TRelatedAccountSide = (typeof RELATED_ACCOUNT_SIDES)[number];

export interface IRelatedAccountRow {
  transactionId?: string;
  isMain: boolean;
  side?: string;
  accounts: string[];
  dt: IRelatedAccountCodes;
  ct: IRelatedAccountCodes;
}

interface IRelatedAccountCodes {
  defaults: string[];
  base: string[];
  codes: string[];
  differs: boolean;
  custom?: string[];
}

const getAccountCodes = (
  tr: Pick<ITransaction, 'details'> | Pick<TTrDoc, 'details'>,
): string[] => [
  ...new Set(
    tr.details.flatMap(({ account, accountId }) =>
      accountId && account?.code ? [account.code] : [],
    ),
  ),
];

const normalizeCodes = (codes: string[] = []): string[] => [
  ...new Set(codes.map((code) => code.trim()).filter(Boolean)),
];

const sameCodes = (first: string[], second: string[]): boolean =>
  first.length === second.length &&
  first.every((code) => second.includes(code));

export const getRelatedAccountGroups = (
  trDocs: TTrDoc[],
  followTrDocs: ITransaction[],
  replacements: TRelatedAccountReplacement[] = [],
) => {
  const groups = new Map<string, (TTrDoc | ITransaction)[]>(
    trDocs.map((tr) => [tr.ptrId || '', []]),
  );
  const mainTransactions = new Set<TTrDoc | ITransaction>(trDocs);

  for (const tr of [...trDocs, ...followTrDocs]) {
    groups.get(tr.ptrId || '')?.push(tr);
  }

  const getRow = (
    tr: TTrDoc | ITransaction,
    ptrId: string,
    transactions: (TTrDoc | ITransaction)[],
  ): IRelatedAccountRow => {
    const isMain = mainTransactions.has(tr);
    const rowReplacements = isMain ? replacements : [];
    const accounts = getAccountCodes(tr);
    const peers = transactions.filter((peer) => peer !== tr);
    const getSide = (side: TRelatedAccountSide): IRelatedAccountCodes => {
      const customKey = side === 'dt' ? 'customDt' : 'customCt';
      const transactionSide = side === 'dt' ? TR_SIDES.DEBIT : TR_SIDES.CREDIT;
      const defaults = normalizeCodes(
        peers
          .filter((peer) => peer.side === transactionSide)
          .flatMap(getAccountCodes),
      );
      const saved = normalizeCodes(tr.relAccounts?.[customKey]);
      // The API also stores inherited codes in the custom fields.
      const inherited = sameCodes(
        saved,
        normalizeCodes(tr.relAccounts?.[side]),
      );
      const base = saved.length && !inherited ? saved : defaults;
      const sideReplacements = rowReplacements.filter(
        (entry) => entry.ptrId === ptrId && entry.side === side,
      );
      const additions = sideReplacements
        .filter(
          ({ code, replacement }) =>
            !code &&
            (tr.side !== transactionSide || !accounts.includes(replacement)),
        )
        .map(({ replacement }) => replacement);
      const editedCodes = normalizeCodes([
        ...base.map(
          (code) =>
            sideReplacements.find((entry) => entry.code === code)
              ?.replacement ?? code,
        ),
        ...additions,
      ]);
      // The API treats an empty override as an instruction to inherit defaults.
      const codes = editedCodes.length ? editedCodes : defaults;

      let custom = tr.relAccounts?.[customKey];
      if (!sameCodes(editedCodes, base)) {
        custom = sameCodes(codes, defaults) ? undefined : codes;
      }

      return {
        defaults,
        base,
        codes,
        differs: !sameCodes(codes, defaults),
        custom,
      };
    };

    return {
      transactionId: tr._id,
      isMain,
      side: tr.side,
      accounts,
      dt: getSide('dt'),
      ct: getSide('ct'),
    };
  };

  return new Map(
    [...groups].map(([ptrId, transactions]) => [
      ptrId,
      transactions.map((tr) => getRow(tr, ptrId, transactions)),
    ]),
  );
};
