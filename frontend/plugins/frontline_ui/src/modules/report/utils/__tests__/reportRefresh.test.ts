import type { FrontlineReportScope } from '~/gql/graphql';
import { createReportRefresh } from '@/report/utils/reportRefresh';

const createRefetch = () =>
  jest
    .fn<Promise<void>, [ReadonlySet<FrontlineReportScope>, AbortSignal]>()
    .mockResolvedValue(undefined);

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it('coalesces events and retains all affected scopes', async () => {
  const refetch = createRefetch();
  const refresh = createReportRefresh(refetch);

  refresh.schedule(['inbox']);
  refresh.schedule(['ticket', 'inbox']);
  await jest.advanceTimersByTimeAsync(250);

  expect(refetch).toHaveBeenCalledTimes(1);
  expect([...refetch.mock.calls[0][0]]).toEqual(['inbox', 'ticket']);
  refresh.dispose();
});

it('aborts a hung batch and allows a pending scope to refresh', async () => {
  const refetch = createRefetch().mockImplementationOnce(
    () => new Promise<void>(() => undefined),
  );
  const refresh = createReportRefresh(refetch);
  refresh.schedule(['inbox']);
  await jest.advanceTimersByTimeAsync(250);
  refresh.schedule(['call']);
  await jest.advanceTimersByTimeAsync(250);
  expect(refetch).toHaveBeenCalledTimes(1);

  await jest.advanceTimersByTimeAsync(15_000);

  expect(refetch.mock.calls[0][1].aborted).toBe(true);
  expect(refetch).toHaveBeenCalledTimes(2);
  expect([...refetch.mock.calls[1][0]]).toEqual(['call']);
  refresh.dispose();
});

it('aborts on disposal and drops queued work', async () => {
  const refetch = createRefetch().mockImplementationOnce(
    () => new Promise<void>(() => undefined),
  );
  const refresh = createReportRefresh(refetch);
  refresh.schedule(['inbox']);
  await jest.advanceTimersByTimeAsync(250);
  refresh.schedule(['ticket']);

  refresh.dispose();
  refresh.schedule(['call']);
  await jest.advanceTimersByTimeAsync(60_000);

  expect(refetch.mock.calls[0][1].aborted).toBe(true);
  expect(refetch).toHaveBeenCalledTimes(1);
  expect(jest.getTimerCount()).toBe(0);
});

it('can refresh again after a rejected request', async () => {
  const refetch = createRefetch().mockRejectedValueOnce(
    new Error('Network failed'),
  );
  const refresh = createReportRefresh(refetch);
  refresh.schedule(['inbox']);
  await jest.advanceTimersByTimeAsync(250);
  refresh.schedule(['inbox']);
  await jest.advanceTimersByTimeAsync(250);
  expect(refetch).toHaveBeenCalledTimes(2);
  refresh.dispose();
});
