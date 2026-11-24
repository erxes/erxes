import { InMemoryCache } from '@apollo/client';
import {
  applyListChange,
  removeTransactionParentFromCache,
  toListSubscriptionFilter,
} from '@/transactions/utils/transactionListChange';

type TRow = {
  _id: string;
  trId?: string;
  parentId?: string;
  ptrId: string;
  ptrNumber: string | null;
  detailInd?: number;
  amount?: number;
};

const voucher = (
  _id: string,
  ptrNumber: string | null,
  amount = 100000,
): TRow => ({ _id, ptrId: `ptr-${_id}`, ptrNumber, amount });

const record = (
  trId: string,
  ptrNumber: string,
  detailInd: number,
  amount = 100000,
): TRow => ({
  _id: `${trId}-${detailInd}`,
  trId,
  ptrId: `ptr-${trId}`,
  ptrNumber,
  detailInd,
  amount,
});

const page = (
  list: TRow[],
  totalCount: number,
  pageInfo = { hasNextPage: false, hasPreviousPage: false },
) => ({ list, totalCount, pageInfo });

const ids = (result: { list?: (TRow | null)[] | null }) =>
  result.list?.map((row) => row?._id);

describe('a teammate changes vouchers while my receipts list is open', () => {
  const openList = page(
    [
      voucher('tr-0007', '20261113/0007'),
      voucher('tr-0005', '20261113/0005'),
      voucher('tr-0004', '20261113/0004'),
    ],
    3,
  );

  it('shows the corrected amount in place without touching the count', () => {
    const next = applyListChange(openList, {
      trIds: ['tr-0005'],
      list: [voucher('tr-0005', '20261113/0005', 202664)],
    });

    expect(ids(next)).toEqual(['tr-0007', 'tr-0005', 'tr-0004']);
    expect(next.list?.[1]?.amount).toBe(202664);
    expect(next.totalCount).toBe(3);
  });

  it('puts a newly created voucher at the top and counts it', () => {
    const next = applyListChange(openList, {
      trIds: ['tr-0008'],
      list: [voucher('tr-0008', '20261113/0008')],
    });

    expect(ids(next)).toEqual(['tr-0008', 'tr-0007', 'tr-0005', 'tr-0004']);
    expect(next.totalCount).toBe(4);
  });

  it('moves a voucher whose number was changed to its new place', () => {
    const next = applyListChange(openList, {
      trIds: ['tr-0004'],
      list: [voucher('tr-0004', '20261113/0006')],
    });

    expect(ids(next)).toEqual(['tr-0007', 'tr-0004', 'tr-0005']);
    expect(next.totalCount).toBe(3);
  });

  it('drops a voucher that no longer matches my filter', () => {
    const next = applyListChange(openList, { trIds: ['tr-0007'], list: [] });

    expect(ids(next)).toEqual(['tr-0005', 'tr-0004']);
    expect(next.totalCount).toBe(2);
  });

  it('keeps vouchers without a number below numbered ones', () => {
    const next = applyListChange(openList, {
      trIds: ['tr-draft'],
      list: [voucher('tr-draft', null)],
    });

    expect(ids(next)).toEqual(['tr-0007', 'tr-0005', 'tr-0004', 'tr-draft']);
  });

  it('leaves the list untouched when the push carries no voucher ids', () => {
    expect(applyListChange(openList, { trIds: [], list: [] })).toBe(openList);
    expect(applyListChange(openList, { trIds: null, list: null })).toBe(
      openList,
    );
  });

  it('ignores rows the push did not announce as changed', () => {
    const next = applyListChange(openList, {
      trIds: ['tr-0005'],
      list: [
        voucher('tr-0005', '20261113/0005'),
        voucher('tr-intruder', '20261113/0009'),
      ],
    });

    expect(ids(next)).toEqual(['tr-0007', 'tr-0005', 'tr-0004']);
  });
});

describe('a teammate saves a voucher that belongs to another page', () => {
  const middlePage = page(
    [voucher('tr-0050', '20261113/0050'), voucher('tr-0049', '20261113/0049')],
    120,
    { hasNextPage: true, hasPreviousPage: true },
  );

  it('does not pull an older voucher into the page I am reading', () => {
    const next = applyListChange(middlePage, {
      trIds: ['tr-0002'],
      list: [voucher('tr-0002', '20261113/0002')],
    });

    expect(ids(next)).toEqual(['tr-0050', 'tr-0049']);
    expect(next.totalCount).toBe(120);
  });

  it('does not pull a newer voucher above the page I am reading', () => {
    const next = applyListChange(middlePage, {
      trIds: ['tr-0099'],
      list: [voucher('tr-0099', '20261113/0099')],
    });

    expect(ids(next)).toEqual(['tr-0050', 'tr-0049']);
  });

  it('still counts a voucher created on another page when the server sends the new total', () => {
    const next = applyListChange(middlePage, {
      trIds: ['tr-0121'],
      list: [voucher('tr-0121', '20261113/0121')],
      totalCount: 121,
    });

    expect(ids(next)).toEqual(['tr-0050', 'tr-0049']);
    expect(next.totalCount).toBe(121);
  });

  it('lowers the count when a voucher on another page is deleted', () => {
    const next = applyListChange(middlePage, {
      trIds: ['tr-0002'],
      list: [],
      totalCount: 119,
    });

    expect(next.totalCount).toBe(119);
  });
});

describe('a teammate edits a voucher on the edge of my first page', () => {
  const firstPage = page(
    [voucher('tr-0099', '20261113/0099'), voucher('tr-0098', '20261113/0098')],
    40,
    { hasNextPage: true, hasPreviousPage: false },
  );

  it('keeps the last voucher of the page in place after its amount changes', () => {
    const next = applyListChange(firstPage, {
      trIds: ['tr-0098'],
      list: [voucher('tr-0098', '20261113/0098', 350000)],
      totalCount: 40,
    });

    expect(next.list).toEqual([
      voucher('tr-0099', '20261113/0099'),
      voucher('tr-0098', '20261113/0098', 350000),
    ]);
  });

  it('keeps every journal entry line when the whole page belongs to the edited voucher', () => {
    const linesPage = page(
      [
        record('tr-big', '20261113/0120', 0),
        record('tr-big', '20261113/0120', 1),
      ],
      30,
      { hasNextPage: true, hasPreviousPage: false },
    );

    const next = applyListChange(linesPage, {
      trIds: ['tr-big'],
      list: [
        record('tr-big', '20261113/0120', 0, 5000),
        record('tr-big', '20261113/0120', 1, 5000),
      ],
      totalCount: 30,
    });

    expect(ids(next)).toEqual(['tr-big-0', 'tr-big-1']);
    expect(next.totalCount).toBe(30);
  });
});

describe('journal entry lines follow the voucher change', () => {
  const journal = page(
    [
      record('tr-0007', '20261113/0007', 0),
      record('tr-0007', '20261113/0007', 1),
      record('tr-0004', '20261113/0004', 0),
      record('tr-0004', '20261113/0004', 1),
    ],
    4,
  );

  it('replaces every line of the voucher when a line is added', () => {
    const next = applyListChange(journal, {
      trIds: ['tr-0004'],
      list: [
        record('tr-0004', '20261113/0004', 2, 18424),
        record('tr-0004', '20261113/0004', 0, 184240),
        record('tr-0004', '20261113/0004', 1, 202664),
      ],
    });

    expect(ids(next)).toEqual([
      'tr-0007-0',
      'tr-0007-1',
      'tr-0004-0',
      'tr-0004-1',
      'tr-0004-2',
    ]);
    expect(next.totalCount).toBe(5);
  });

  it('removes every line of a deleted voucher', () => {
    const next = applyListChange(journal, { trIds: ['tr-0007'], list: [] });

    expect(ids(next)).toEqual(['tr-0004-0', 'tr-0004-1']);
    expect(next.totalCount).toBe(2);
  });
});

describe('subscription filter', () => {
  it('sends only what filters the list, never the page position', () => {
    expect(
      toListSubscriptionFilter({
        journal: 'bank',
        branchId: 'branch-ub',
        statuses: ['active'],
        cursor: 'page-3',
        limit: 20,
        orderBy: { date: 1 },
        searchValue: '',
        customerId: undefined,
        departmentId: null,
      }),
    ).toEqual({
      journal: 'bank',
      branchId: 'branch-ub',
      statuses: ['active'],
    });
  });
});

describe('removing a voucher from the cache', () => {
  const cachedLists = () => {
    const cache = new InMemoryCache();
    cache.restore({
      'AccCommonTransaction:tr-dt': {
        __typename: 'AccCommonTransaction',
        _id: 'tr-dt',
        parentId: 'voucher-1107',
      },
      'AccCommonTransaction:tr-ct': {
        __typename: 'AccCommonTransaction',
        _id: 'tr-ct',
        parentId: 'voucher-1107',
      },
      'AccCommonTransaction:tr-other': {
        __typename: 'AccCommonTransaction',
        _id: 'tr-other',
        parentId: 'voucher-2001',
      },
      'AccCommonTrRecord:tr-dt-0': {
        __typename: 'AccCommonTrRecord',
        _id: 'tr-dt-0',
        parentId: 'voucher-1107',
      },
      'AccCommonTrRecord:tr-other-0': {
        __typename: 'AccCommonTrRecord',
        _id: 'tr-other-0',
        parentId: 'voucher-2001',
      },
      ROOT_QUERY: {
        __typename: 'Query',
        'accTransactionsMain({"limit":20})': {
          totalCount: 3,
          list: [
            { __ref: 'AccCommonTransaction:tr-dt' },
            { __ref: 'AccCommonTransaction:tr-ct' },
            { __ref: 'AccCommonTransaction:tr-other' },
          ],
        },
        'accTrRecordsMain({"journal":"main","limit":20})': {
          totalCount: 2,
          list: [
            { __ref: 'AccCommonTrRecord:tr-dt-0' },
            { __ref: 'AccCommonTrRecord:tr-other-0' },
          ],
        },
      },
    });
    return cache;
  };

  const rootList = (cache: InMemoryCache, prefix: string) => {
    const root = cache.extract().ROOT_QUERY ?? {};
    const key = Object.keys(root).find((item) => item.startsWith(prefix));
    return key ? root[key] : undefined;
  };

  it('drops the voucher rows from every cached list and recounts', () => {
    const cache = cachedLists();

    removeTransactionParentFromCache(cache, 'voucher-1107');

    expect(rootList(cache, 'accTransactionsMain')).toEqual({
      totalCount: 1,
      list: [{ __ref: 'AccCommonTransaction:tr-other' }],
    });
    expect(rootList(cache, 'accTrRecordsMain')).toEqual({
      totalCount: 1,
      list: [{ __ref: 'AccCommonTrRecord:tr-other-0' }],
    });
  });

  it('keeps the lists when no voucher id is given', () => {
    const cache = cachedLists();
    const before = cache.extract();

    removeTransactionParentFromCache(cache, undefined);

    expect(cache.extract()).toEqual(before);
  });
});
