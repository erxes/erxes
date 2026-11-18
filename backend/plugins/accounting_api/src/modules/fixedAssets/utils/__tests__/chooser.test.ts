import fixedAssetQueries from '@/fixedAssets/graphql/resolvers/queries/fixedAssets';
import { buildChooserOwnerBalances, TChooserTransaction } from '../chooser';
import { IContext } from '~/connectionResolvers';
import { JOURNALS, TR_SIDES, TR_STATUSES } from '@/accounting/@types/constants';
import { checkPermissionTrs } from '@/accounting/utils/trPermissions';

jest.mock('@/accounting/utils/transactionPermissions', () => ({
  assertTransactionJournalPermission: jest.fn(),
}));
jest.mock('@/accounting/utils/trPermissions', () => ({
  checkPermissionTrs: jest.fn(async (_models, rows) => rows),
}));

const { accountingFixedAssetChooser } = fixedAssetQueries;

const row = (
  id: string,
  branchId: string,
  count: number,
): TChooserTransaction => ({
  _id: id,
  journal: JOURNALS.FXA_INCOME,
  date: new Date('2026-01-01'),
  branchId,
  departmentId: 'department',
  followInfos: {},
  details: [
    {
      _id: `${id}-detail`,
      fixedAssetId: 'asset',
      accountId: 'account',
      amount: count * 100,
      count,
    },
  ],
});
const owner = (
  transactionId?: string,
  transactionDetailId?: string,
  action = 'received',
  count = 1,
) => ({
  fixedAssetId: 'asset',
  ownerId: 'member',
  code: 'serial',
  count,
  action,
  transactionId,
  transactionDetailId,
});

test('custodian balances stay within the linked transaction detail location', () => {
  expect(
    buildChooserOwnerBalances(
      [row('income', 'branch-a', 2)],
      [owner('income', 'income-detail')],
    ),
  ).toEqual([
    expect.objectContaining({
      ownerId: 'member',
      branchId: 'branch-a',
      departmentId: 'department',
      count: 1,
    }),
  ]);
});

test('a direct unlocated handover never leaves a stale selectable location balance', () => {
  expect(
    buildChooserOwnerBalances(
      [row('income', 'branch-a', 2)],
      [
        owner('income', 'income-detail', 'received', 2),
        owner(undefined, undefined, 'handedOver'),
      ],
    ),
  ).toEqual([
    expect.objectContaining({
      branchId: undefined,
      departmentId: undefined,
      count: 1,
    }),
  ]);
});

test('movement receipt uses the generated destination detail', () => {
  const move = { ...row('move', 'source', 1), journal: JOURNALS.FXA_MOVE };
  const destination = {
    ...row('destination', 'destination', 1),
    journal: JOURNALS.FXA_MOVE_IN,
    details: [
      {
        ...row('destination', 'destination', 1).details[0],
        originId: 'move-detail',
      },
    ],
  };
  const balances = buildChooserOwnerBalances(
    [move, destination],
    [owner('move', 'move-detail')],
  );
  expect(balances[0]).toMatchObject({ branchId: 'destination', count: 1 });
});

const fixture = () => {
  const transactions = [
    row('income-a', 'branch-a', 2),
    row('income-b', 'branch-b', 1),
  ].map((transaction) => ({
    ...transaction,
    status: TR_STATUSES.COMPLETE,
    side: TR_SIDES.DEBIT,
  }));
  const query = <T>(value: T) => ({
    sort() {
      return this;
    },
    lean: async () => value,
  });
  const context = {
    user: { _id: 'member' },
    models: {
      FixedAssets: {
        find: () =>
          query([
            {
              _id: 'asset',
              code: 'PC',
              name: 'Computer',
              categoryId: 'computers',
              status: 'active',
            },
          ]),
      },
      Transactions: {
        findOne: () => query(null),
        find: (selector: {
          journal?: { $in: string[] };
          date?: { $lt?: Date; $lte?: Date };
        }) =>
          query(
            transactions.filter(
              (transaction) =>
                (!selector.journal ||
                  selector.journal.$in.includes(transaction.journal)) &&
                (!selector.date?.$lt || transaction.date < selector.date.$lt) &&
                (!selector.date?.$lte ||
                  transaction.date <= selector.date.$lte),
            ),
          ),
      },
      Configs: { getConfigs: async () => [] },
      FxaOwnerRecords: { find: () => query([]) },
    },
  };
  return context as unknown as IContext;
};

beforeEach(() =>
  jest
    .mocked(checkPermissionTrs)
    .mockImplementation(async (_models, rows) => rows),
);

test('disposal lists the chosen branch while capitalization returns every active location', async () => {
  const params = {
    journal: JOURNALS.FXA_OUT,
    date: new Date('2026-02-01'),
    branchId: 'branch-a',
  };
  const disposal = await accountingFixedAssetChooser(
    undefined,
    params,
    fixture(),
  );
  expect(
    disposal.items[0].locations.map((location) => location.branchId),
  ).toEqual(['branch-a']);
  const capital = await accountingFixedAssetChooser(
    undefined,
    { ...params, journal: JOURNALS.FXA_CAPITAL },
    fixture(),
  );
  expect(
    capital.items[0].locations.map((location) => location.branchId),
  ).toEqual(['branch-a', 'branch-b']);
});

test('future acquisitions and assets with a hidden posting are not selectable', async () => {
  const params = { journal: JOURNALS.FXA_OUT, date: new Date('2025-12-31') };
  expect(
    (await accountingFixedAssetChooser(undefined, params, fixture())).items,
  ).toEqual([]);
  jest
    .mocked(checkPermissionTrs)
    .mockImplementation(async (_models, rows) =>
      rows.map((transaction) => ({ ...transaction, permission: 'hidden' })),
    );
  expect(
    (
      await accountingFixedAssetChooser(
        undefined,
        { ...params, date: new Date('2026-02-01') },
        fixture(),
      )
    ).items,
  ).toEqual([]);
});
