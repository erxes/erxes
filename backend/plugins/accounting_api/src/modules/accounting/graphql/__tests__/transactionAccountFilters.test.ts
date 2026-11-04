import sift from 'sift';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { generateFilter } from '../resolvers/queries/transactionsCommon';

jest.mock('erxes-api-shared/utils', () => ({
  escapeRegExp: (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'),
  sendTRPCMessage: jest.fn().mockResolvedValue({}),
}));

const accounts = [
  {
    _id: 'cash',
    kind: 'active',
    status: 'active',
    categoryId: 'current-assets',
    isOutBalance: false,
  },
  {
    _id: 'bank',
    kind: 'active',
    status: 'active',
    categoryId: 'bank-accounts',
    isOutBalance: false,
  },
  {
    _id: 'payable',
    kind: 'passive',
    status: 'active',
    categoryId: 'liabilities',
    isOutBalance: false,
  },
  {
    _id: 'guarantee',
    kind: 'passive',
    status: 'active',
    categoryId: 'liabilities',
    isOutBalance: true,
  },
  {
    _id: 'closed',
    kind: 'active',
    status: 'deleted',
    categoryId: 'current-assets',
    isOutBalance: false,
  },
  {
    _id: 'old-bank',
    kind: 'active',
    status: 'active',
    categoryId: 'archived-banks',
    isOutBalance: false,
  },
];

const categories = [
  { _id: 'current-assets', order: 'assets/current/', status: 'active' },
  { _id: 'bank-accounts', order: 'assets/current/bank/', status: 'active' },
  { _id: 'archived-banks', order: 'assets/current/old/', status: 'archived' },
  { _id: 'liabilities', order: 'liabilities/', status: 'active' },
];

const buildModels = ({
  dominantUserIds = [],
  permittedAccountIds = [],
}: {
  dominantUserIds?: string[];
  permittedAccountIds?: string[];
} = {}) =>
  ({
    Configs: {
      getConfigValue: jest.fn().mockResolvedValue(dominantUserIds),
      find: () => ({
        lean: () =>
          Promise.resolve([
            { code: 'dominantReadAccountUsers', value: dominantUserIds },
          ]),
      }),
    },
    Accounts: {
      find: (query: object) => ({
        lean: () => Promise.resolve(accounts.filter(sift(query))),
      }),
    },
    AccountCategories: {
      getAccountCategory: jest.fn(({ _id }: { _id: string }) => {
        const category = categories.find((item) => item._id === _id);
        return category
          ? Promise.resolve(category)
          : Promise.reject(new Error('AccountCategory not found'));
      }),
      find: jest.fn((query: object) =>
        Promise.resolve(categories.filter(sift(query))),
      ),
    },
    Permissions: {
      find: () => ({
        select: () => ({
          lean: () =>
            Promise.resolve(
              permittedAccountIds.map((accountId) => ({ accountId })),
            ),
        }),
      }),
    },
  }) as unknown as IModels;

const owner = { _id: 'owner', isOwner: true } as IUserDocument;
const accountant = { _id: 'accountant' } as IUserDocument;

const filterByAccounts = async (
  models: IModels,
  params: object,
  user: IUserDocument,
) => {
  const filter = await generateFilter(
    'tenant',
    models,
    params as Parameters<typeof generateFilter>[2],
    user,
  );
  return filter['details.accountId']?.$in;
};

test('an owner choosing the off-balance account filter sees only those accounts', async () => {
  await expect(
    filterByAccounts(buildModels(), { accountIsOutBalance: true }, owner),
  ).resolves.toEqual(['guarantee']);
});

test('choosing "no" on the off-balance filter keeps balance sheet accounts instead of being ignored', async () => {
  await expect(
    filterByAccounts(buildModels(), { accountIsOutBalance: false }, owner),
  ).resolves.toEqual(['cash', 'bank', 'payable']);
});

test('a cleared yes/no account filter sent as null is treated as not chosen', async () => {
  await expect(
    filterByAccounts(
      buildModels(),
      { accountKind: 'active', accountIsOutBalance: null, accountIsTemp: null },
      owner,
    ),
  ).resolves.toEqual(['cash', 'bank']);
});

test('account type and status combine, so a deleted account is found only when asked for', async () => {
  const models = buildModels();
  await expect(
    filterByAccounts(models, { accountKind: 'active' }, owner),
  ).resolves.toEqual(['cash', 'bank']);
  await expect(
    filterByAccounts(
      models,
      { accountKind: 'active', accountStatus: 'deleted' },
      owner,
    ),
  ).resolves.toEqual(['closed']);
});

test('a parent account category includes accounts of its child categories', async () => {
  await expect(
    filterByAccounts(
      buildModels(),
      { accountCategoryId: 'current-assets' },
      owner,
    ),
  ).resolves.toEqual(['cash', 'bank']);
});

test('a parent account category leaves out accounts of its archived child categories', async () => {
  await expect(
    filterByAccounts(
      buildModels(),
      { accountCategoryId: 'current-assets' },
      owner,
    ),
  ).resolves.not.toContain('old-bank');
});

test('a removed category in a stale URL fails with a clear error instead of showing everything', async () => {
  await expect(
    filterByAccounts(buildModels(), { accountCategoryId: 'removed' }, owner),
  ).rejects.toThrow('AccountCategory not found');
});

test('filters with no matching account return no transactions', async () => {
  await expect(
    filterByAccounts(
      buildModels(),
      { accountKind: 'passive', accountCategoryId: 'bank-accounts' },
      owner,
    ),
  ).resolves.toEqual([]);
});

test('a dominant reader is not narrowed by default but their chosen account filters still apply', async () => {
  const models = buildModels({ dominantUserIds: ['accountant'] });
  await expect(
    filterByAccounts(models, {}, accountant),
  ).resolves.toBeUndefined();
  await expect(
    filterByAccounts(models, { accountIds: [] }, accountant),
  ).resolves.toBeUndefined();
  await expect(
    filterByAccounts(models, { accountExcludeIds: false }, accountant),
  ).resolves.toBeUndefined();
  await expect(
    filterByAccounts(models, { accountKind: 'passive' }, accountant),
  ).resolves.toEqual(['payable', 'guarantee']);
  await expect(
    filterByAccounts(models, { accountIds: ['bank'] }, accountant),
  ).resolves.toEqual(['bank']);
});

test('a dominant reader can exclude chosen accounts from the list', async () => {
  await expect(
    filterByAccounts(
      buildModels({ dominantUserIds: ['accountant'] }),
      { accountIds: ['bank', 'payable'], accountExcludeIds: true },
      accountant,
    ),
  ).resolves.toEqual(['cash', 'guarantee']);
});

test('a filter never reveals accounts outside a regular user permissions', async () => {
  await expect(
    filterByAccounts(
      buildModels({ permittedAccountIds: ['cash'] }),
      { accountKind: 'active' },
      accountant,
    ),
  ).resolves.toEqual(['cash']);
});
