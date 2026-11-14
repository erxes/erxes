import sift from 'sift';
import { IImportExportContext } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { getTransactionExportData } from '../getTransactionExportData';

jest.mock('erxes-api-shared/core-modules', () => ({
  buildExportCursorQuery: ({ baseQuery }: { baseQuery: object }) => ({
    query: baseQuery,
    isIdsMode: false,
  }),
}));

jest.mock('erxes-api-shared/utils', () => ({
  escapeRegExp: (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'),
  getPureDate: (date: Date) => date,
}));

const accounts = [
  { _id: 'cash', code: '101', name: 'Cash', categoryId: 'current-assets' },
  { _id: 'bank', code: '102', name: 'Bank', categoryId: 'bank-accounts' },
  { _id: 'payable', code: '301', name: 'Payable', categoryId: 'liabilities' },
];

const transactions = [
  {
    _id: 'tr-1',
    number: 'N1',
    details: [
      {
        _id: 'd1',
        accountId: 'cash',
        followInfos: {
          fixedAssetCategoryId: 'category',
          fixedAssetCode: 'PC-001',
          fixedAssetName: 'Computer',
        },
      },
    ],
  },
  { _id: 'tr-2', number: 'N2', details: [{ _id: 'd2', accountId: 'bank' }] },
  { _id: 'tr-3', number: 'N3', details: [{ _id: 'd3', accountId: 'payable' }] },
];

const categories = [
  { _id: 'current-assets', order: 'assets/', status: 'active' },
  { _id: 'bank-accounts', order: 'assets/bank/', status: 'active' },
  { _id: 'liabilities', order: 'liabilities/', status: 'active' },
];

const context = {
  models: {
    Accounts: {
      find: (query: object) => ({
        lean: () => Promise.resolve(accounts.filter(sift(query))),
      }),
    },
    AccountCategories: {
      getAccountCategory: ({ _id }: { _id: string }) => {
        const category = categories.find((item) => item._id === _id);
        return category
          ? Promise.resolve(category)
          : Promise.reject(new Error('AccountCategory not found'));
      },
      find: (query: object) => Promise.resolve(categories.filter(sift(query))),
    },
    Transactions: {
      find: (query: object) => ({
        sort: () => ({
          limit: () => ({
            lean: () => Promise.resolve(transactions.filter(sift(query))),
          }),
        }),
      }),
    },
  } as unknown as IModels,
} as IImportExportContext<IModels>;

const exportNumbers = async (filters: Record<string, unknown>) => {
  const rows = await getTransactionExportData(
    { filters, limit: 100 } as Parameters<typeof getTransactionExportData>[0],
    context,
  );
  return rows.map(({ accountCode }) => accountCode);
};

test('exporting a parent account category matches the list and includes its child categories', async () => {
  await expect(
    exportNumbers({ accountCategoryId: 'current-assets' }),
  ).resolves.toEqual(['101', '102']);
});

test('exporting a leaf account category leaves out unrelated accounts', async () => {
  await expect(
    exportNumbers({ accountCategoryId: 'liabilities' }),
  ).resolves.toEqual(['301']);
});

test('an export for a removed account category fails instead of exporting every transaction', async () => {
  await expect(exportNumbers({ accountCategoryId: 'removed' })).rejects.toThrow(
    'AccountCategory not found',
  );
});

test('export keeps fixed asset CSV columns flat while reading acquisition identity from followInfos', async () => {
  const rows = await getTransactionExportData(
    { filters: {}, limit: 100 } as Parameters<
      typeof getTransactionExportData
    >[0],
    context,
  );
  expect(rows.find((row) => row._id === 'tr-1')).toMatchObject({
    fixedAssetCode: 'PC-001',
    fixedAssetName: 'Computer',
  });
});
