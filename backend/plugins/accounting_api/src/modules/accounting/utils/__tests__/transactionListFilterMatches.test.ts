import sift from 'sift';
import { checkPermissionGroup } from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { TTrRecordListParams } from '@/accounting/graphql/resolvers/queries/transactionsCommon';
import { getListFilterMatches } from '@/accounting/utils/transactionListRows';

jest.mock('erxes-api-shared/utils', () => ({
  escapeRegExp: (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'),
  fixNum: (value: number) => value,
  getPureDate: (value: Date) => new Date(value),
  sendTRPCMessage: jest.fn(),
}));
jest.mock('erxes-api-shared/core-modules', () => ({
  checkPermissionGroup: jest.fn(),
}));

type TDoc = Record<string, unknown>;

const owner = { _id: 'prdemo-acc-bat', isOwner: true };
const mainReader = { _id: 'prdemo-acc-sarnai', isOwner: false };

const ACCOUNTS = [
  { _id: 'acc-140104', code: '140104', status: 'active' },
  { _id: 'acc-210901', code: '210901', status: 'active' },
];

const STRUCTURE_CHILDREN = {
  branches: { 'branch-ub': ['branch-ub', 'branch-ub-khanuul'] },
  departments: { 'dep-finance': ['dep-finance', 'dep-finance-tax'] },
};

const rentVoucher = {
  _id: 'tr-rent-dt',
  parentId: 'voucher-rent',
  ptrId: 'ptr-rent',
  number: '2026111816_001',
  ptrNumber: '2026111816_001',
  journal: 'main',
  status: 'complete',
  ptrStatus: 'balanced',
  description: 'Түрээс 48403-А',
  date: new Date('2026-11-19T00:00:00.000Z'),
  createdAt: new Date('2026-11-18T09:12:00.000Z'),
  updatedAt: new Date('2026-11-20T08:38:00.000Z'),
  branchId: 'branch-ub-khanuul',
  departmentId: 'dep-finance-tax',
  customerType: 'company',
  customerId: 'company-tavan-bogd',
  contentType: 'sales:deal',
  contentId: 'deal-48403',
  scopeBrandIds: ['brand-erxes'],
  createdBy: 'prdemo-acc-bat',
  modifiedBy: 'prdemo-acc-dulmaa',
  mentionOwnerId: 'prdemo-acc-bat',
  mentionUserIds: ['prdemo-acc-sarnai'],
  details: [{ accountId: 'acc-140104', currency: 'MNT', amount: 2_500_000 }],
};

const overRedis = (changes: TDoc = {}): TDoc =>
  JSON.parse(JSON.stringify({ ...rentVoucher, ...changes }));

const buildModels = () =>
  ({
    Configs: { getConfigValue: jest.fn().mockResolvedValue([mainReader._id]) },
    AccountCategories: { find: jest.fn().mockResolvedValue([]) },
    Accounts: {
      find: (query: TDoc) => ({
        lean: () => Promise.resolve(ACCOUNTS.filter(sift(query))),
      }),
    },
  } as unknown as IModels);

const mockCore = (user: TDoc) =>
  jest.mocked(sendTRPCMessage).mockImplementation(async ({ module, input }) => {
    if (module === 'users') return user;
    if (module === 'configs') return {};

    const [id] = input.query._id.$in;
    const children =
      STRUCTURE_CHILDREN[module as keyof typeof STRUCTURE_CHILDREN]?.[id] ?? [];

    return children.map((_id: string) => ({ _id }));
  });

const matchesFor = (
  filter: TDoc,
  oldDocs: TDoc[],
  newDocs: TDoc[],
  user: TDoc = owner,
) => {
  mockCore(user);

  return getListFilterMatches({
    models: buildModels(),
    subdomain: 'erxes',
    userId: String(user._id),
    filter: filter as unknown as TTrRecordListParams,
    oldDocs,
    newDocs,
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(checkPermissionGroup).mockImplementation(() => async (action) => {
    if (action !== 'readMainTransactions') {
      throw new Error('Permission required');
    }
  });
});

describe('a teammate list hears a voucher saved into its filter and lets go of one saved out of it', () => {
  it.each([
    [
      'date range Nov 18-20',
      { startDate: '2026-11-18', endDate: '2026-11-20T23:59:59.999Z' },
      { date: '2026-11-25T00:00:00.000Z' },
    ],
    [
      'created date range',
      { startCreatedDate: '2026-11-18', endCreatedDate: '2026-11-19' },
      { createdAt: '2026-11-02T10:00:00.000Z' },
    ],
    [
      'updated date range',
      { startUpdatedDate: '2026-11-20', endUpdatedDate: '2026-11-21' },
      { updatedAt: '2026-11-15T10:00:00.000Z' },
    ],
    ['single journal', { journal: 'main' }, { journal: 'bank' }],
    ['several journals', { journals: ['main', 'cash'] }, { journal: 'bank' }],
    ['default committed statuses', {}, { status: 'requested' }],
    ['statuses', { statuses: ['complete'] }, { status: 'draft' }],
    ['single status', { status: 'complete' }, { status: 'draft' }],
    ['voucher balance', { ptrStatus: 'balanced' }, { ptrStatus: 'diff' }],
    [
      'number prefix',
      { number: '2026111816' },
      { number: '2026111901_002', ptrNumber: '2026111901_002' },
    ],
    [
      'description search in Mongolian',
      { searchValue: 'түрээс' },
      { description: 'Цалингийн суутгал' },
    ],
    ['brand', { brandId: 'brand-erxes' }, { scopeBrandIds: ['brand-other'] }],
    [
      'branch with its sub-branches',
      { branchId: 'branch-ub' },
      { branchId: 'branch-darkhan' },
    ],
    [
      'department with its sub-departments',
      { departmentId: 'dep-finance' },
      { departmentId: 'dep-sales' },
    ],
    [
      'customer type',
      { customerType: 'company' },
      { customerType: 'customer' },
    ],
    [
      'customer',
      { customerId: 'company-tavan-bogd' },
      { customerId: 'company-other' },
    ],
    [
      'content type',
      { contentType: 'sales:deal' },
      { contentType: 'pos:order' },
    ],
    ['content', { contentId: 'deal-48403' }, { contentId: 'deal-1' }],
    [
      'currency',
      { currency: 'MNT' },
      { details: [{ accountId: 'acc-140104', currency: 'USD' }] },
    ],
    [
      'account',
      { accountIds: ['acc-140104'] },
      { details: [{ accountId: 'acc-210901', currency: 'MNT' }] },
    ],
    [
      'created by',
      { createdUserId: 'prdemo-acc-bat' },
      { createdBy: 'prdemo-acc-dulmaa' },
    ],
    [
      'modified by',
      { modifiedUserId: 'prdemo-acc-dulmaa' },
      { modifiedBy: 'prdemo-acc-bat' },
    ],
    [
      'mention owner',
      { mentionOwnerId: 'prdemo-acc-bat' },
      { mentionOwnerId: 'prdemo-acc-dulmaa' },
    ],
    [
      'mentioned user',
      { mentionUserId: 'prdemo-acc-sarnai' },
      { mentionUserIds: ['prdemo-acc-dulmaa'] },
    ],
    ['selected ids', { ids: ['tr-rent-dt'] }, { _id: 'tr-salary-dt' }],
    [
      'excluded ids',
      { ids: ['tr-salary-dt'], excludeIds: true },
      { _id: 'tr-salary-dt' },
    ],
  ])('%s', async (_name, filter, outside) => {
    await expect(
      matchesFor(filter, [overRedis(outside)], [overRedis()]),
    ).resolves.toEqual({ matchesOld: false, matchesNew: true });

    await expect(
      matchesFor(filter, [overRedis()], [overRedis(outside)]),
    ).resolves.toEqual({ matchesOld: true, matchesNew: false });
  });

  it('applies every filter of the toolbar together', async () => {
    const filter = {
      startDate: '2026-11-18',
      endDate: '2026-11-20T23:59:59.999Z',
      journal: 'main',
      branchId: 'branch-ub',
      number: '2026111816',
      searchValue: '48403',
    };

    await expect(
      matchesFor(filter, [overRedis()], [overRedis()]),
    ).resolves.toEqual({ matchesOld: true, matchesNew: true });

    await expect(
      matchesFor(
        filter,
        [overRedis()],
        [overRedis({ branchId: 'branch-darkhan' })],
      ),
    ).resolves.toEqual({ matchesOld: true, matchesNew: false });
  });

  it('keeps a petty cash voucher away from a main-journal reader in the same date range', async () => {
    await expect(
      matchesFor(
        { startDate: '2026-11-18', endDate: '2026-11-20T23:59:59.999Z' },
        [],
        [overRedis({ journal: 'cash' })],
        mainReader,
      ),
    ).resolves.toEqual({ matchesOld: false, matchesNew: false });
  });
});

describe('sidebar navStatus finds what concerns the signed-in user', () => {
  const matchesNew = async (filter: TDoc, changes: TDoc) =>
    (await matchesFor(filter, [], [overRedis(changes)])).matchesNew;

  it('keeps personal drafts to their performer and addressed drafts to recipients', async () => {
    const drafts = { navStatus: 'drafts' };
    expect(await matchesNew(drafts, { status: 'draft' })).toBe(true);
    expect(
      await matchesNew(drafts, {
        status: 'draft',
        mentionOwnerId: 'prdemo-acc-dulmaa',
      }),
    ).toBe(false);
    expect(await matchesNew(drafts, { status: 'mentioned' })).toBe(false);
    expect(
      await matchesNew(drafts, {
        status: 'mentioned',
        mentionUserIds: ['prdemo-acc-bat'],
      }),
    ).toBe(true);
  });

  it('shows every executing row but only requests waiting on the user', async () => {
    const pending = { navStatus: 'pending' };
    expect(
      await matchesNew(pending, {
        status: 'executing',
        mentionOwnerId: 'prdemo-acc-dulmaa',
      }),
    ).toBe(true);
    expect(await matchesNew(pending, { status: 'requested' })).toBe(false);
    expect(
      await matchesNew(pending, {
        status: 'requested',
        mentionUserIds: ['prdemo-acc-bat'],
      }),
    ).toBe(true);
    expect(await matchesNew({ navStatus: 'committed' }, {})).toBe(true);
  });

  it('gives way to an explicit status filter', async () => {
    expect(
      await matchesNew(
        { navStatus: 'committed', statuses: ['draft'] },
        { status: 'draft', mentionOwnerId: 'prdemo-acc-dulmaa' },
      ),
    ).toBe(true);
    expect(
      await matchesNew({ navStatus: 'committed', status: 'requested' }, {
        status: 'requested',
      }),
    ).toBe(true);
  });
});
