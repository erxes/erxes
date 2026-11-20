import { checkPermissionGroup } from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  generateFilter,
  queryTransactionsMain,
  queryTrRecordsMain,
  TTrRecordListParams,
} from '@/accounting/graphql/resolvers/queries/transactionsCommon';
import {
  getListChangeRows,
  getListFilterMatches,
  resolveTransactionListRows,
} from '@/accounting/utils/transactionListRows';

jest.mock('erxes-api-shared/utils', () => ({
  fixNum: (value: number) => value,
  sendTRPCMessage: jest.fn(),
}));
jest.mock('erxes-api-shared/core-modules', () => ({
  checkPermissionGroup: jest.fn(() => jest.fn()),
}));
jest.mock('@/accounting/graphql/resolvers/queries/transactionsCommon', () => ({
  ...jest.requireActual(
    '@/accounting/graphql/resolvers/queries/transactionsCommon',
  ),
  generateFilter: jest.fn(),
  queryTransactionsMain: jest.fn(),
  queryTrRecordsMain: jest.fn(),
}));

type TDoc = Record<string, unknown>;

const rentDebit = {
  _id: 'tr-rent-dt',
  ptrId: 'ptr-rent',
  parentId: 'voucher-rent',
  number: '2026111816_001',
  journal: 'main',
  description: 'Түрээс 12-р сар',
  branchId: 'branch-ub',
  departmentId: 'dep-finance',
  vatRowId: 'vat-10',
  sumDt: 2_500_000,
  sumCt: 0,
  ptrStatus: 'balanced',
  details: [
    {
      _id: 'detail-rent-dt',
      accountId: 'acc-140104',
      branchId: 'branch-ub',
      amount: 2_500_000,
    },
  ],
};

const rentCredit = {
  _id: 'tr-rent-ct',
  ptrId: 'ptr-rent',
  parentId: 'voucher-rent',
  number: '2026111816_001',
  journal: 'main',
  branchId: 'branch-closed',
  sumDt: 0,
  sumCt: 2_500_000,
  ptrStatus: 'balanced',
  details: [
    { _id: 'detail-rent-ct', accountId: 'acc-210901', amount: 2_500_000 },
  ],
};

const rentVat = {
  _id: 'tr-rent-vat',
  ptrId: 'ptr-rent',
  originId: 'tr-rent-dt',
  journal: 'tax',
  departmentId: 'dep-finance',
  details: [{ _id: 'detail-rent-vat', accountId: 'acc-vat', amount: 250_000 }],
};

const ACCOUNTS = [
  { _id: 'acc-140104', code: '140104', name: 'ДҮ-ийн нэгтгэл зардал' },
  { _id: 'acc-210901', code: '210901', name: 'Зохион байгуулалтын зардал' },
];

const matchesIn = (docs: TDoc[], query: TDoc) =>
  docs.filter((doc) =>
    Object.entries(query).every(([field, condition]) => {
      const values = (condition as { $in: unknown[] }).$in;
      return values.includes(doc[field]);
    }),
  );

const leanFind = (docs: TDoc[]) =>
  jest.fn((query: TDoc) => ({
    lean: () => Promise.resolve(matchesIn(docs, query)),
  }));

const buildModels = () =>
  ({
    Transactions: { find: leanFind([rentDebit, rentCredit, rentVat]) },
    Accounts: { find: leanFind(ACCOUNTS) },
    VatRows: {
      find: leanFind([{ _id: 'vat-10', name: 'НӨАТ 10%', percent: 10 }]),
    },
    CtaxRows: { find: leanFind([]) },
  } as unknown as IModels);

const CORE = {
  branches: [{ _id: 'branch-ub', code: '0010', title: 'Төв оффис' }],
  departments: [{ _id: 'dep-finance', code: '03', title: 'Санхүү' }],
};

const dulmaa = { _id: 'prdemo-acc-dulmaa', isOwner: false };

const mockCore = (user: TDoc | null = dulmaa) =>
  jest.mocked(sendTRPCMessage).mockImplementation(async ({ module }) => {
    if (module === 'users') return user;
    return CORE[module as keyof typeof CORE] ?? [];
  });

describe('rows pushed to teammates look exactly like the list rows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCore();
  });

  it('fills accounts, branches, departments, VAT and the voucher balance', async () => {
    const [debit, credit] = await resolveTransactionListRows(
      buildModels(),
      'erxes',
      [rentDebit, rentCredit],
    );

    expect(debit).toMatchObject({
      description: 'Түрээс 12-р сар',
      branch: { code: '0010', title: 'Төв оффис' },
      department: { code: '03', title: 'Санхүү' },
      details: [
        {
          account: { code: '140104', name: 'ДҮ-ийн нэгтгэл зардал' },
          branch: { title: 'Төв оффис' },
          department: null,
        },
      ],
      vatRow: { name: 'НӨАТ 10%', percent: 10 },
      ctaxRow: null,
      followTrs: [{ _id: 'tr-rent-vat', department: { title: 'Санхүү' } }],
      ptrInfo: { len: 3, activeLen: 2, diff: 0, value: 2_500_000 },
    });
    expect(credit.details).toEqual([
      expect.objectContaining({
        account: expect.objectContaining({ code: '210901' }),
      }),
    ]);
    expect(credit.followTrs).toEqual([]);
  });

  it('shows no branch for a branch deleted in core instead of failing the row', async () => {
    const [credit] = await resolveTransactionListRows(buildModels(), 'erxes', [
      rentCredit,
    ]);

    expect(credit.branch).toBeNull();
    expect(credit.details).toEqual([
      expect.objectContaining({ branch: null, department: null }),
    ]);
  });

  it('fails the push when core cannot answer the branch lookup so the list reloads', async () => {
    jest
      .mocked(sendTRPCMessage)
      .mockImplementation(async ({ throwOnError, defaultValue }) => {
        if (throwOnError) {
          throw new Error('core-api is not available');
        }
        return defaultValue;
      });

    await expect(
      resolveTransactionListRows(buildModels(), 'erxes', [rentDebit]),
    ).rejects.toThrow('core-api is not available');
  });

  it('keeps the single detail of a journal entry row', async () => {
    const [record] = await resolveTransactionListRows(buildModels(), 'erxes', [
      {
        ...rentDebit,
        _id: 'tr-rent-dt-detail-rent-dt',
        details: rentDebit.details[0],
      },
    ]);

    expect(record.details).toMatchObject({
      account: { code: '140104' },
      branch: { title: 'Төв оффис' },
    });
    expect(record.followTrs).toEqual([]);
  });

  it('answers an empty change without touching the database', async () => {
    const models = buildModels();

    await expect(
      resolveTransactionListRows(models, 'erxes', []),
    ).resolves.toEqual([]);
    expect(models.Transactions.find).not.toHaveBeenCalled();
    expect(sendTRPCMessage).not.toHaveBeenCalled();
  });
});

describe('each teammate gets rows through their own permissions', () => {
  const page = <T>(list: TDoc[], totalCount: number, hasNextPage = false) =>
    ({
      list,
      totalCount,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    } as unknown as T);

  type TReceiptsPage = Awaited<ReturnType<typeof queryTransactionsMain>>;
  type TEntriesPage = Awaited<ReturnType<typeof queryTrRecordsMain>>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCore();
  });

  it('runs the receipts list query as the teammate and sends their new total', async () => {
    jest
      .mocked(queryTransactionsMain)
      .mockImplementation(async (_context, params) =>
        params.ids
          ? page<TReceiptsPage>([rentDebit], 1)
          : page<TReceiptsPage>([rentCredit], 34, true),
      );

    const change = await getListChangeRows({
      models: buildModels(),
      subdomain: 'erxes',
      userId: 'prdemo-acc-dulmaa',
      list: 'transactions',
      trIds: ['tr-rent-dt', 'tr-rent-ct'],
      trJournals: { 'tr-rent-dt': ['main'], 'tr-rent-ct': ['main'] },
      filter: {
        journal: 'main',
        startDate: '2026-11-01T00:00:00.000Z',
        cursor: 'page-3',
        limit: 20,
        orderBy: { date: 1 },
        ids: ['someone-else'],
        excludeIds: true,
      },
    });

    expect(change).toEqual({
      trIds: ['tr-rent-dt', 'tr-rent-ct'],
      list: [
        expect.objectContaining({
          _id: 'tr-rent-dt',
          branch: expect.objectContaining({ title: 'Төв оффис' }),
        }),
      ],
      hasMore: false,
      totalCount: 34,
    });

    const calls = jest.mocked(queryTransactionsMain).mock.calls;
    expect(calls.map(([, params]) => params)).toEqual([
      {
        journal: 'main',
        startDate: '2026-11-01T00:00:00.000Z',
        ids: ['tr-rent-dt', 'tr-rent-ct'],
        limit: 100,
      },
      { journal: 'main', startDate: '2026-11-01T00:00:00.000Z', limit: 1 },
    ]);
    expect(calls[0][0].user).toBe(dulmaa);
    expect(checkPermissionGroup).toHaveBeenCalledWith('erxes', dulmaa);
    expect(queryTrRecordsMain).not.toHaveBeenCalled();
  });

  it('asks the journal entries list to reload when the voucher has more rows than one push', async () => {
    jest
      .mocked(queryTrRecordsMain)
      .mockResolvedValue(page<TEntriesPage>([], 250, true));

    const change = await getListChangeRows({
      models: buildModels(),
      subdomain: 'erxes',
      userId: 'prdemo-acc-sarnai',
      list: 'trRecords',
      trIds: ['tr-rent-dt'],
      trJournals: { 'tr-rent-dt': ['main'] },
    });

    expect(change).toEqual({
      trIds: ['tr-rent-dt'],
      list: [],
      hasMore: true,
      totalCount: 250,
    });
    expect(queryTransactionsMain).not.toHaveBeenCalled();
  });

  it('sends nothing to a deactivated or unknown user and lets their list reload', async () => {
    mockCore(null);

    const change = await getListChangeRows({
      models: buildModels(),
      subdomain: 'erxes',
      userId: 'fired-accountant',
      list: 'transactions',
      trIds: ['tr-rent-dt'],
      trJournals: { 'tr-rent-dt': ['main'] },
    });

    expect(change).toEqual({
      trIds: [],
      list: [],
      hasMore: true,
      totalCount: null,
    });
    expect(queryTransactionsMain).not.toHaveBeenCalled();
    expect(jest.mocked(sendTRPCMessage).mock.calls[0][0].input).toEqual({
      query: { _id: 'fired-accountant', isActive: { $ne: false } },
    });
  });
});

describe('a teammate never learns about vouchers in journals they cannot read', () => {
  const mainOnly = () => async (action: string) => {
    if (action !== 'readMainTransactions') {
      throw new Error('Permission required');
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCore({ _id: 'prdemo-acc-tuya', isOwner: false });
    jest.mocked(checkPermissionGroup).mockImplementation(mainOnly);
    jest
      .mocked(queryTransactionsMain)
      .mockResolvedValue({
        list: [rentDebit],
        totalCount: 5,
        pageInfo: { hasNextPage: false },
      } as unknown as Awaited<ReturnType<typeof queryTransactionsMain>>);
  });

  it('sends no ids and runs no query when only a petty cash voucher changed', async () => {
    const change = await getListChangeRows({
      models: buildModels(),
      subdomain: 'erxes',
      userId: 'prdemo-acc-tuya',
      list: 'transactions',
      trIds: ['tr-petty-cash'],
      trJournals: { 'tr-petty-cash': ['cash'] },
    });

    expect(change).toEqual({
      trIds: [],
      list: [],
      hasMore: false,
      totalCount: null,
    });
    expect(queryTransactionsMain).not.toHaveBeenCalled();
  });

  it('keeps the readable main voucher and drops the cash one from a mixed change', async () => {
    const change = await getListChangeRows({
      models: buildModels(),
      subdomain: 'erxes',
      userId: 'prdemo-acc-tuya',
      list: 'transactions',
      trIds: ['tr-rent-dt', 'tr-petty-cash'],
      trJournals: { 'tr-rent-dt': ['main'], 'tr-petty-cash': ['cash'] },
    });

    expect(change.trIds).toEqual(['tr-rent-dt']);
    expect(jest.mocked(queryTransactionsMain).mock.calls[0][1].ids).toEqual([
      'tr-rent-dt',
    ]);
  });

  it('shows a voucher moved from petty cash into the main journal', async () => {
    const change = await getListChangeRows({
      models: buildModels(),
      subdomain: 'erxes',
      userId: 'prdemo-acc-tuya',
      list: 'transactions',
      trIds: ['tr-rent-dt'],
      trJournals: { 'tr-rent-dt': ['main', 'cash'] },
    });

    expect(change.trIds).toEqual(['tr-rent-dt']);
    expect(change.list).toEqual([
      expect.objectContaining({ _id: 'tr-rent-dt' }),
    ]);
  });

  it('removes a main voucher moved out to petty cash from the main reader list', async () => {
    jest.mocked(queryTransactionsMain).mockImplementation(
      async (_context, params) =>
        ({
          list: [],
          totalCount: params.ids ? 0 : 4,
          pageInfo: { hasNextPage: false },
        } as unknown as Awaited<ReturnType<typeof queryTransactionsMain>>),
    );

    const change = await getListChangeRows({
      models: buildModels(),
      subdomain: 'erxes',
      userId: 'prdemo-acc-tuya',
      list: 'transactions',
      trIds: ['tr-rent-dt'],
      trJournals: { 'tr-rent-dt': ['cash', 'main'] },
    });

    expect(change).toEqual({
      trIds: ['tr-rent-dt'],
      list: [],
      hasMore: false,
      totalCount: 4,
    });
  });

  it('treats a change without a known journal as unreadable', async () => {
    const change = await getListChangeRows({
      models: buildModels(),
      subdomain: 'erxes',
      userId: 'prdemo-acc-tuya',
      list: 'transactions',
      trIds: ['tr-rent-dt'],
    });

    expect(change.trIds).toEqual([]);
    expect(queryTransactionsMain).not.toHaveBeenCalled();
  });
});

describe('only teammates who may read the journal hear about a change', () => {
  const mainOnlyReader = { _id: 'prdemo-acc-sarnai', isOwner: false };
  const owner = { _id: 'prdemo-acc-bat', isOwner: true };
  const cashVoucher = { _id: 'tr-petty-cash', journal: 'cash', sumDt: 80_000 };
  const rentFilter = {} as TTrRecordListParams;

  const grantOnly = (actions: string[]) => () => async (action: string) => {
    if (!actions.includes(action)) {
      throw new Error('Permission required');
    }
  };

  const matchesFor = (user: TDoc | null, oldDocs: TDoc[], newDocs: TDoc[]) => {
    mockCore(user);

    return getListFilterMatches({
      models: buildModels(),
      subdomain: 'erxes',
      userId: String(user?._id ?? 'fired-accountant'),
      filter: rentFilter,
      oldDocs,
      newDocs,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(generateFilter).mockResolvedValue({});
    jest
      .mocked(checkPermissionGroup)
      .mockImplementation(grantOnly(['readMainTransactions']));
  });

  it('tells a main-journal reader about a main voucher', async () => {
    await expect(matchesFor(mainOnlyReader, [], [rentDebit])).resolves.toEqual({
      matchesOld: false,
      matchesNew: true,
    });
  });

  it('keeps a petty cash voucher away from a reader without cash permission', async () => {
    await expect(
      matchesFor(mainOnlyReader, [cashVoucher], [cashVoucher]),
    ).resolves.toEqual({ matchesOld: false, matchesNew: false });
  });

  it('still tells the reader when their visible voucher moves to a journal they cannot read', async () => {
    await expect(
      matchesFor(
        mainOnlyReader,
        [rentDebit],
        [{ ...rentDebit, journal: 'cash' }],
      ),
    ).resolves.toEqual({ matchesOld: true, matchesNew: false });
  });

  it('lets the owner hear about every journal', async () => {
    await expect(matchesFor(owner, [], [cashVoucher])).resolves.toEqual({
      matchesOld: false,
      matchesNew: true,
    });
  });

  it('fails the check instead of hiding the change when core cannot be reached', async () => {
    jest
      .mocked(sendTRPCMessage)
      .mockImplementation(async ({ throwOnError, defaultValue }) => {
        if (throwOnError) {
          throw new Error('core-api is not available');
        }
        return defaultValue;
      });

    await expect(
      getListFilterMatches({
        models: buildModels(),
        subdomain: 'erxes',
        userId: 'prdemo-acc-sarnai',
        filter: rentFilter,
        oldDocs: [],
        newDocs: [rentDebit],
      }),
    ).rejects.toThrow('core-api is not available');
    expect(generateFilter).not.toHaveBeenCalled();
  });

  it('tells a deactivated user nothing without building their filter', async () => {
    await expect(matchesFor(null, [rentDebit], [rentDebit])).resolves.toEqual({
      matchesOld: false,
      matchesNew: false,
    });
    expect(generateFilter).not.toHaveBeenCalled();
  });
});
