import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  split,
} from '@apollo/client';
import { MockLink, MockSubscriptionLink } from '@apollo/client/testing';
import type { MockedResponse } from '@apollo/client/testing';
import { getMainDefinition } from '@apollo/client/utilities';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { toast } from 'erxes-ui';
import { ADJUST_FXA_DETAILS_QUERY } from '@/adjustments/fxa/graphql/adjustFixedAssetQueries';
import { useAdjustFxaDetails } from '@/adjustments/fxa/hooks/useAdjustFxaDetails';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';

jest.mock('react-i18next', () => {
  const translate = (key: string) => key;
  return { useTranslation: () => ({ t: translate }) };
});
jest.mock('erxes-ui', () => ({ toast: jest.fn() }), { virtual: true });

const fxaRow = (_id: string, depreciationAmount: number) => ({
  _id,
  adjustId: 'fxa-q2',
  fixedAssetId: `asset-${_id}`,
  categoryId: 'cat-vehicles',
  accountId: 'acc-2101',
  branchId: null,
  departmentId: null,
  count: 1,
  revaluationLoss: 0,
  revaluationReserve: 0,
  originalCost: 48000000,
  salvageValue: 0,
  accumulatedDepreciation: 8000000 + depreciationAmount,
  depreciationAmount,
  previous: null,
  transactionId: null,
  transactionDetailId: null,
  error: null,
  warning: null,
  account: { _id: 'acc-2101', code: '2101', name: 'Vehicles' },
  fixedAsset: { _id: `asset-${_id}`, code: `FA-${_id}`, name: 'Delivery van' },
});

type FxaRow = ReturnType<typeof fxaRow>;

const pageMock = (
  page: number,
  rows: FxaRow[],
  totalCount = rows.length,
  delay = 0,
): MockedResponse => ({
  request: {
    query: ADJUST_FXA_DETAILS_QUERY,
    variables: { _id: 'fxa-q2', page, perPage: ACC_TRS__PER_PAGE },
  },
  delay,
  result: {
    data: { adjustFxaDetails: rows, adjustFxaDetailsCount: totalCount },
  },
});

const failedReloadMock = (message: string): MockedResponse => ({
  request: pageMock(1, []).request,
  error: new Error(message),
});

const calculated = {
  _id: 'fxa-q2',
  createdAt: '2026-06-30T09:00:00.000Z',
  createdBy: 'accountant-1',
  updatedAt: '2026-06-30T09:05:00.000Z',
  modifiedBy: 'accountant-2',
  date: '2026-06-30T00:00:00.000Z',
  description: 'Q2 depreciation',
  expenseAccountId: null,
  status: 'process',
  error: null,
  warning: null,
  beginDate: '2026-04-01T00:00:00.000Z',
  successDate: '2026-06-30T00:00:00.000Z',
  checkedAt: '2026-06-30T09:05:00.000Z',
};

const wait = (duration: number) =>
  act(() => new Promise<void>((resolve) => setTimeout(resolve, duration)));

const createClient = (mocks: MockedResponse[]) => {
  const events = new MockSubscriptionLink();
  const client = new ApolloClient({
    cache: new InMemoryCache({ addTypename: false }),
    link: split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      events,
      new MockLink(mocks, false),
    ),
  });

  return { client, events };
};

const renderDetails = (
  mocks: MockedResponse[],
  { client, events } = createClient(mocks),
) => {
  const view = renderHook(
    () =>
      useAdjustFxaDetails({
        variables: { _id: 'fxa-q2', page: 1, perPage: ACC_TRS__PER_PAGE },
      }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <ApolloProvider client={client}>{children}</ApolloProvider>
      ),
    },
  );
  const push = (payload: Record<string, unknown> | null) =>
    act(() => {
      events.simulateResult({
        result: { data: { accountingAdjustFixedAssetChanged: payload } },
      });
    });
  const rowIds = () =>
    view.result.current.adjustFxaDetails.map((row) => row._id);

  return { ...view, push, rowIds };
};

describe('fixed asset adjustment rows live updates', () => {
  beforeEach(() => jest.mocked(toast).mockClear());

  it('reloads the depreciation rows when another accountant recalculates', async () => {
    const { result, push, rowIds } = renderDetails([
      pageMock(1, []),
      pageMock(1, [fxaRow('row-1', 1200000), fxaRow('row-2', 800000)]),
    ]);

    await waitFor(() => expect(result.current.loading).toBe(false));
    push(calculated);

    await waitFor(() => expect(result.current.adjustFxaDetailsCount).toBe(2));
    expect(rowIds()).toEqual(['row-1', 'row-2']);
  });

  it('keeps the current rows when the pushed payload is empty', async () => {
    const reload = jest.fn();
    const { result, push, rowIds } = renderDetails([
      pageMock(1, [fxaRow('row-1', 1200000)]),
      { ...pageMock(1, []), newData: reload },
    ]);

    await waitFor(() => expect(result.current.adjustFxaDetailsCount).toBe(1));
    push(null);
    await wait(50);

    expect(reload).not.toHaveBeenCalled();
    expect(rowIds()).toEqual(['row-1']);
  });

  it('waits for the calculation to finish instead of reloading on the running event', async () => {
    const reload = jest.fn();
    const { result, push, rowIds } = renderDetails([
      pageMock(1, [fxaRow('row-1', 1200000)]),
      { ...pageMock(1, []), newData: reload },
    ]);

    await waitFor(() => expect(result.current.adjustFxaDetailsCount).toBe(1));
    push({ ...calculated, status: 'running', successDate: null });
    await wait(50);

    expect(reload).not.toHaveBeenCalled();
    expect(rowIds()).toEqual(['row-1']);
  });

  it('drops a page that was still loading when another accountant recalculated', async () => {
    const { result, push, rowIds } = renderDetails([
      pageMock(1, [fxaRow('old-1', 1000000)], 3),
      pageMock(2, [fxaRow('old-2', 900000), fxaRow('old-3', 700000)], 3, 200),
      pageMock(1, [fxaRow('new-1', 1200000), fxaRow('new-2', 800000)]),
    ]);

    await waitFor(() => expect(result.current.adjustFxaDetailsCount).toBe(3));
    act(() => result.current.handleFetchMore());
    push(calculated);

    await waitFor(() => expect(result.current.adjustFxaDetailsCount).toBe(2));
    await wait(300);

    expect(rowIds()).toEqual(['new-1', 'new-2']);
    expect(result.current.adjustFxaDetailsCount).toBe(2);
  });

  it('does not load another page while the rows are being reloaded', async () => {
    const reload = jest.fn(() => ({
      data: {
        adjustFxaDetails: [fxaRow('new-1', 1200000), fxaRow('new-2', 800000)],
        adjustFxaDetailsCount: 2,
      },
    }));
    const nextPage = jest.fn(() => ({
      data: {
        adjustFxaDetails: [fxaRow('old-2', 900000)],
        adjustFxaDetailsCount: 3,
      },
    }));
    const { result, push, rowIds } = renderDetails([
      pageMock(1, [fxaRow('old-1', 1000000)], 3),
      { ...pageMock(1, [], 0, 200), newData: reload },
      { ...pageMock(2, []), newData: nextPage },
    ]);

    await waitFor(() => expect(result.current.adjustFxaDetailsCount).toBe(3));
    push(calculated);
    await waitFor(() => expect(reload).toHaveBeenCalled());
    act(() => result.current.handleFetchMore());

    await waitFor(() => expect(rowIds()).toEqual(['new-1', 'new-2']));
    expect(nextPage).not.toHaveBeenCalled();
  });

  it('shows the rows of the latest recalculation when two arrive close together', async () => {
    const { result, push, rowIds } = renderDetails([
      pageMock(1, [fxaRow('old-1', 1000000)]),
      pageMock(1, [fxaRow('first-1', 1100000)], 1, 200),
      pageMock(1, [fxaRow('second-1', 1200000), fxaRow('second-2', 800000)]),
    ]);

    await waitFor(() => expect(result.current.adjustFxaDetailsCount).toBe(1));
    push(calculated);
    push({ ...calculated, checkedAt: '2026-06-30T09:06:00.000Z' });

    await waitFor(() => expect(result.current.adjustFxaDetailsCount).toBe(2));
    await wait(300);

    expect(rowIds()).toEqual(['second-1', 'second-2']);
  });

  it('shows the current rows when the page is reopened after another accountant changed them', async () => {
    const mocks = [
      pageMock(1, [fxaRow('old-1', 1000000)]),
      pageMock(1, [fxaRow('new-1', 1200000), fxaRow('new-2', 800000)]),
    ];
    const shared = createClient(mocks);
    const first = renderDetails(mocks, shared);

    await waitFor(() => expect(first.rowIds()).toEqual(['old-1']));
    first.unmount();

    const reopened = renderDetails(mocks, shared);

    await waitFor(() => expect(reopened.rowIds()).toEqual(['new-1', 'new-2']));
  });

  it('tells the user when the rows could not be reloaded and keeps listening', async () => {
    const { result, push, rowIds } = renderDetails([
      pageMock(1, [fxaRow('row-1', 1200000)]),
      failedReloadMock('Gateway timeout'),
      pageMock(1, [fxaRow('row-1', 1300000), fxaRow('row-2', 800000)]),
    ]);

    await waitFor(() => expect(result.current.adjustFxaDetailsCount).toBe(1));
    push(calculated);

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        title: 'error',
        description: 'Gateway timeout',
        variant: 'destructive',
      }),
    );
    expect(rowIds()).toEqual(['row-1']);

    push({ ...calculated, checkedAt: '2026-06-30T09:07:00.000Z' });

    await waitFor(() => expect(rowIds()).toEqual(['row-1', 'row-2']));
  });
});
