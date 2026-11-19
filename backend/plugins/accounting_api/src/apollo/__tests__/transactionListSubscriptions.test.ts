/// <reference types="jest" />

import { sendTRPCMessage } from 'erxes-api-shared/utils';
import subscription from '~/apollo/subscription';

jest.mock('erxes-api-shared/utils', () => ({
  sendTRPCMessage: jest.fn(),
}));

jest.mock('graphql-subscriptions', () => ({
  withFilter: (asyncIteratorFn, filterFn) => ({ asyncIteratorFn, filterFn }),
}));

const LIST_SUBSCRIPTIONS = [
  ['accountingTransactionsListChanged', 'transactions'],
  ['accountingTrRecordsListChanged', 'trRecords'],
] as const;

type TListSubscription = (typeof LIST_SUBSCRIPTIONS)[number][0];

type TFilteredSubscribe = {
  asyncIteratorFn: (root: unknown, args: unknown, context: unknown) => unknown;
  filterFn: (
    payload: unknown,
    args: unknown,
    context: unknown,
  ) => Promise<boolean>;
};

const asyncIterator = jest.fn((channel: string) => channel);
const resolvers = subscription.generateResolvers({ asyncIterator });

const subscribeOf = (name: TListSubscription) =>
  resolvers[name].subscribe as unknown as TFilteredSubscribe;

const bankVoucherSaved = {
  accountingTransactionChanged: {
    parentId: 'voucher-1107',
    action: 'updated',
    transaction: { _id: 'tr-bank-dt', journal: 'bank' },
    transactions: [
      { _id: 'tr-bank-dt', journal: 'bank' },
      { _id: 'tr-bank-vat', journal: 'tax', originId: 'tr-bank-dt' },
    ],
    oldTransaction: { _id: 'tr-bank-dt', journal: 'bank' },
    oldTransactions: [
      { _id: 'tr-bank-dt', journal: 'bank' },
      { _id: 'tr-bank-old-fee', journal: 'bank' },
    ],
  },
};

const voucherRemoved = {
  accountingTransactionChanged: {
    action: 'removed',
    oldTransactions: [
      { _id: 'tr-cash-dt', journal: 'cash' },
      { _id: 'tr-cash-ct', journal: 'cash' },
    ],
  },
};

const branchFilter = {
  journal: 'bank',
  branchId: 'branch-ub',
  statuses: ['active'],
  startDate: '2026-11-01T00:00:00.000Z',
  cursor: 'page-3-cursor',
  limit: 20,
  searchValue: 'ignored-by-schema',
};

const signedInContext = {
  subdomain: 'khan-bank',
  user: { _id: 'accountant-dorj' },
};

const resolve = (name: TListSubscription, payload: unknown, filter: unknown) =>
  resolvers[name].resolve(payload, { filter }, signedInContext);

describe.each(LIST_SUBSCRIPTIONS)('%s', (name, list) => {
  beforeEach(() => {
    jest.mocked(sendTRPCMessage).mockReset();
  });

  it('listens only to the signed-in tenant transaction channel', () => {
    const { asyncIteratorFn } = subscribeOf(name);

    expect(asyncIteratorFn(undefined, {}, { subdomain: 'khan-bank' })).toBe(
      'accountingTransactionChanged:khan-bank',
    );
  });

  it('pushes a teammate save to a user whose list filter matches it', async () => {
    jest
      .mocked(sendTRPCMessage)
      .mockResolvedValue({ matchesOld: true, matchesNew: true });
    const { filterFn } = subscribeOf(name);

    await expect(
      filterFn(
        bankVoucherSaved,
        { filter: branchFilter },
        { subdomain: 'khan-bank', user: { _id: 'accountant-dorj' } },
      ),
    ).resolves.toBe(true);

    expect(sendTRPCMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        subdomain: 'khan-bank',
        action: 'getFilterMatches',
        input: expect.objectContaining({
          filter: branchFilter,
          userId: 'accountant-dorj',
        }),
      }),
    );
  });

  it('stays silent when the save is outside the user list filter', async () => {
    jest
      .mocked(sendTRPCMessage)
      .mockResolvedValue({ matchesOld: false, matchesNew: false });
    const { filterFn } = subscribeOf(name);

    await expect(
      filterFn(
        bankVoucherSaved,
        { filter: { journal: 'cash' } },
        { subdomain: 'khan-bank', user: { _id: 'accountant-dorj' } },
      ),
    ).resolves.toBe(false);
  });

  it('lets the event through when the filter check fails so the list can reload itself', async () => {
    jest.mocked(sendTRPCMessage).mockResolvedValueOnce(null);
    const { filterFn } = subscribeOf(name);

    await expect(
      filterFn(
        bankVoucherSaved,
        { filter: branchFilter },
        { subdomain: 'khan-bank', user: { _id: 'accountant-dorj' } },
      ),
    ).resolves.toBe(true);

    jest.mocked(sendTRPCMessage).mockResolvedValueOnce(null);
    await expect(
      resolve(name, bankVoucherSaved, branchFilter),
    ).resolves.toEqual({
      trIds: [],
      list: [],
      hasMore: true,
      totalCount: null,
    });
  });

  it('never evaluates a socket without a signed-in user', async () => {
    const { filterFn } = subscribeOf(name);

    await expect(
      filterFn(
        bankVoucherSaved,
        { filter: branchFilter },
        { subdomain: 'khan-bank', user: undefined },
      ),
    ).resolves.toBe(false);
    expect(sendTRPCMessage).not.toHaveBeenCalled();
  });

  it('pushes the rows the accounting service built for this subscriber', async () => {
    const savedRows = [
      {
        _id: 'tr-bank-dt',
        number: '20261113/0004',
        details: [{ account: { code: '110101', name: 'Хаан банк' } }],
      },
    ];
    jest.mocked(sendTRPCMessage).mockResolvedValue({
      trIds: ['tr-bank-dt', 'tr-bank-vat', 'tr-bank-old-fee'],
      list: savedRows,
      hasMore: false,
      totalCount: 41,
    });

    const change = await resolve(name, bankVoucherSaved, branchFilter);

    expect(change).toEqual({
      trIds: ['tr-bank-dt', 'tr-bank-vat', 'tr-bank-old-fee'],
      list: savedRows,
      hasMore: false,
      totalCount: 41,
    });
    expect(sendTRPCMessage).toHaveBeenCalledTimes(1);
    expect(sendTRPCMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        subdomain: 'khan-bank',
        pluginName: 'accounting',
        action: 'getListChangeRows',
        input: {
          filter: branchFilter,
          list,
          trIds: ['tr-bank-dt', 'tr-bank-vat', 'tr-bank-old-fee'],
          trJournals: {
            'tr-bank-dt': ['bank'],
            'tr-bank-vat': ['tax'],
            'tr-bank-old-fee': ['bank'],
          },
          userId: 'accountant-dorj',
        },
      }),
    );
  });

  it('tells the client to reload when the voucher has more rows than one push carries', async () => {
    jest
      .mocked(sendTRPCMessage)
      .mockResolvedValue({ list: [{ _id: 'tr-bank-dt' }], hasMore: true });

    const change = await resolve(name, bankVoucherSaved, branchFilter);

    expect(change).toEqual({
      trIds: [],
      list: [],
      hasMore: true,
      totalCount: null,
    });
  });

  it('tells the client to reload when the accounting service could not build the rows', async () => {
    jest.mocked(sendTRPCMessage).mockResolvedValue(null);

    const change = await resolve(name, bankVoucherSaved, branchFilter);

    expect(change).toEqual({
      trIds: [],
      list: [],
      hasMore: true,
      totalCount: null,
    });
  });

  it('removes deleted vouchers and sends the new total of the list', async () => {
    jest.mocked(sendTRPCMessage).mockResolvedValue({
      trIds: ['tr-cash-dt', 'tr-cash-ct'],
      list: [],
      hasMore: false,
      totalCount: 39,
    });

    const change = await resolve(name, voucherRemoved, {});

    expect(change).toEqual({
      trIds: ['tr-cash-dt', 'tr-cash-ct'],
      list: [],
      hasMore: false,
      totalCount: 39,
    });
  });

  it('lets the accounting service see both journals of a voucher moved from cash to main', async () => {
    jest
      .mocked(sendTRPCMessage)
      .mockResolvedValue({ trIds: [], list: [], hasMore: false });

    await resolve(
      name,
      {
        accountingTransactionChanged: {
          action: 'updated',
          transaction: { _id: 'tr-moved', journal: 'main' },
          oldTransaction: { _id: 'tr-moved', journal: 'cash' },
          transactions: [{ _id: 'tr-moved', journal: 'main' }],
          oldTransactions: [{ _id: 'tr-moved', journal: 'cash' }],
        },
      },
      {},
    );

    expect(
      jest.mocked(sendTRPCMessage).mock.calls[0][0].input.trJournals,
    ).toEqual({ 'tr-moved': ['main', 'cash'] });
  });

  it('keeps an id-filtered list scoped to its own ids', async () => {
    jest
      .mocked(sendTRPCMessage)
      .mockResolvedValue({ trIds: ['tr-bank-vat'], list: [], hasMore: false });

    await resolve(name, bankVoucherSaved, {
      ids: ['tr-bank-vat', 'tr-other'],
    });

    expect(jest.mocked(sendTRPCMessage).mock.calls[0][0].input).toEqual(
      expect.objectContaining({ trIds: ['tr-bank-vat'] }),
    );
  });

  it('only announces the ids the accounting service cleared for this subscriber', async () => {
    jest.mocked(sendTRPCMessage).mockResolvedValue({
      trIds: [],
      list: [],
      hasMore: false,
      totalCount: null,
    });

    const change = await resolve(name, voucherRemoved, {});

    expect(change.trIds).toEqual([]);
  });

  it('ignores a change that only touches ids the list excludes', async () => {
    const change = await resolve(
      name,
      {
        accountingTransactionChanged: {
          action: 'updated',
          transactions: [{ _id: 'tr-hidden' }],
        },
      },
      { ids: ['tr-hidden'], excludeIds: true },
    );

    expect(change).toEqual({
      trIds: [],
      list: [],
      hasMore: false,
      totalCount: null,
    });
    expect(sendTRPCMessage).not.toHaveBeenCalled();
  });
});
