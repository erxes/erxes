import type { IModels } from '~/connectionResolvers';
import type { IAdjustClosing } from '../../@types/adjustClosingEntry';
import type { ITransaction } from '../../@types/transaction';
import { runAdjustClosingTransactions } from '../adjustClosings';

const closing: IAdjustClosing = {
  _id: 'closing',
  date: new Date('2026-01-31T00:00:00'),
  integrateAccountId: 'integrate',
  periodGLAccountId: 'period',
  earningAccountId: 'earning',
  taxPayableAccountId: 'tax',
  createdBy: 'user',
  details: [
    {
      _id: 'branch-a',
      branchId: 'a',
      entries: [
        { _id: 'revenue', accountId: 'revenue', balance: -1000, percent: 10 },
        { _id: 'expense', accountId: 'expense', balance: 400, percent: 10 },
      ],
    },
    {
      _id: 'branch-b',
      branchId: 'b',
      entries: [
        { _id: 'expense', accountId: 'expense', balance: 300, percent: 10 },
      ],
    },
  ],
};

const setup = (taxPayableJournal = 'main') => {
  const createPTransaction = jest.fn(async (docs: ITransaction[]) =>
    docs.map((doc) => ({ ...doc, parentId: 'parent' })),
  );
  const models = {
    AdjustClosings: {
      checkAdjustClosingEditable: jest.fn(),
      updateAdjustClosing: jest.fn(async (_id: string, doc: object) => doc),
    },
    Accounts: {
      findOne: () => ({ lean: async () => ({ journal: taxPayableJournal }) }),
    },
    Transactions: {
      findOne: () => ({ lean: async () => null }),
      createPTransaction,
    },
  } as unknown as IModels;

  return { models, createPTransaction };
};

const signedTotal = (docs: ITransaction[]) =>
  docs.reduce(
    (total, doc) =>
      total +
      doc.details.reduce(
        (sum, detail) =>
          sum + (doc.side === 'dt' ? 1 : -1) * (detail.amount || 0),
        0,
      ),
    0,
  );

describe('closing transaction pointers', () => {
  it('splits closing postings into balanced pointer groups', async () => {
    const { models, createPTransaction } = setup();

    await runAdjustClosingTransactions(models, 'user', closing);

    const [docs, , options] = createPTransaction.mock.calls[0] as unknown as [
      ITransaction[],
      string,
      { preservePtrIds?: boolean },
    ];
    expect(options).toEqual({ preservePtrIds: true });

    const groups = new Map<string, ITransaction[]>();
    for (const doc of docs) {
      expect(doc.ptrId).toBeTruthy();
      groups.set(doc.ptrId || '', [
        ...(groups.get(doc.ptrId || '') || []),
        doc,
      ]);
    }

    // per branch: temp↔integrate and integrate↔period; then tax; then earning
    expect(groups.size).toBe(6);
    for (const group of groups.values()) {
      expect(signedTotal(group)).toBeCloseTo(0);
    }

    const accountsByGroup = [...groups.values()].map((group) =>
      [...new Set(group.flatMap((doc) => doc.details.map((d) => d.accountId)))]
        .sort()
        .join(','),
    );
    expect(accountsByGroup).toEqual([
      'expense,integrate,revenue',
      'integrate,period',
      'expense,integrate',
      'integrate,period',
      'period,tax',
      'earning,period',
    ]);
  });

  const postedJournals = async (taxPayableJournal: string) => {
    const { models, createPTransaction } = setup(taxPayableJournal);

    await runAdjustClosingTransactions(models, 'user', closing);

    const [docs] = createPTransaction.mock.calls[0] as unknown as [
      ITransaction[],
    ];
    return docs.map((doc) => ({
      journal: doc.journal,
      accountId: doc.details[0].accountId,
    }));
  };

  it('posts every closing transaction to the closing journal', async () => {
    const rows = await postedJournals('main');

    expect(new Set(rows.map((row) => row.journal))).toEqual(
      new Set(['closing']),
    );
  });

  it('posts the tax payable side as payable when its account is a debt account', async () => {
    const rows = await postedJournals('debt');

    expect(rows.filter((row) => row.journal === 'payable')).toEqual([
      { journal: 'payable', accountId: 'tax' },
    ]);
    expect(
      rows.filter((row) => row.accountId !== 'tax').map((row) => row.journal),
    ).toEqual(
      rows.filter((row) => row.accountId !== 'tax').map(() => 'closing'),
    );
  });

  it('splits temporary closings by branch and posts tax and earnings once', async () => {
    const { models, createPTransaction } = setup();

    await runAdjustClosingTransactions(models, 'user', closing);

    const [docs] = createPTransaction.mock.calls[0] as unknown as [
      ITransaction[],
    ];
    const accountsOf = (doc: ITransaction) =>
      doc.details.map((detail) => detail.accountId);

    for (const doc of docs) {
      for (const detail of doc.details) {
        expect(detail.branchId).toBe(doc.branchId);
      }
    }

    const branchesUsing = (accountId: string) =>
      docs
        .filter((doc) => accountsOf(doc).includes(accountId))
        .map((doc) => doc.branchId);

    expect(new Set(branchesUsing('integrate'))).toEqual(new Set(['a', 'b']));
    expect(branchesUsing('tax')).toEqual([undefined]);
    expect(branchesUsing('earning')).toEqual([undefined]);
    expect(
      docs.filter((doc) => accountsOf(doc).includes('period') && !doc.branchId),
    ).toHaveLength(2);
  });
});
