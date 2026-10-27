import { act, renderHook } from '@testing-library/react';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import type { PropsWithChildren } from 'react';
import type { FrontlineReportsChangedSubscription } from '~/gql/graphql';
import { useReportsRealtime } from '@/report/hooks/useReportsRealtime';
import {
  refetchReportQueries,
  REPORT_SCOPES,
} from '@/report/utils/reportQueries';

jest.mock('@/report/utils/reportQueries', () => ({
  ...jest.requireActual<typeof import('@/report/utils/reportQueries')>(
    '@/report/utils/reportQueries',
  ),
  refetchReportQueries: jest.fn().mockResolvedValue(undefined),
}));

const refetch = jest.mocked(refetchReportQueries);

beforeEach(() => {
  jest.useFakeTimers();
  refetch.mockClear();
  jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

const setup = () => {
  let emit: (data: FrontlineReportsChangedSubscription) => void = () =>
    undefined;
  const unsubscribe = jest.fn();
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink(
      () =>
        new Observable((observer) => {
          emit = (data) => observer.next({ data });
          return unsubscribe;
        }),
    ),
  });
  const hook = renderHook(() => useReportsRealtime(), {
    wrapper: ({ children }: PropsWithChildren) => (
      <ApolloProvider client={client}>{children}</ApolloProvider>
    ),
  });
  return {
    ...hook,
    client,
    unsubscribe,
    emit: (data: FrontlineReportsChangedSubscription) => emit(data),
  };
};

it('refreshes the affected scope and reconciles missed events every minute', async () => {
  const { emit, unmount, client, unsubscribe } = setup();
  await act(() => jest.advanceTimersByTimeAsync(250));
  refetch.mockClear();

  act(() => emit({ frontlineReportsChanged: { scopes: ['inbox'] } }));
  await act(() => jest.advanceTimersByTimeAsync(250));
  expect([...refetch.mock.calls[0][1]]).toEqual(['inbox']);
  refetch.mockClear();

  // A failed publish produces no subscription event, but visible reports recover.
  await act(() => jest.advanceTimersByTimeAsync(60_000));
  expect(refetch).toHaveBeenCalledTimes(1);
  expect([...refetch.mock.calls[0][1]]).toEqual(REPORT_SCOPES);

  unmount();
  await act(() => jest.advanceTimersByTimeAsync(60_000));
  expect(refetch).toHaveBeenCalledTimes(1);
  expect(unsubscribe).toHaveBeenCalledTimes(1);
  client.stop();
});

it.each(['hidden', 'offline'])(
  'defers refreshes while %s and reconciles when visible and online again',
  async (state) => {
    const { emit, unmount, client } = setup();
    await act(() => jest.advanceTimersByTimeAsync(250));
    refetch.mockClear();
    if (state === 'hidden') {
      jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    } else {
      jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    }

    act(() => emit({ frontlineReportsChanged: { scopes: ['ticket'] } }));
    await act(() => jest.advanceTimersByTimeAsync(60_000));
    expect(refetch).not.toHaveBeenCalled();

    jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    await act(() => jest.advanceTimersByTimeAsync(250));
    expect([...refetch.mock.calls[0][1]]).toEqual(REPORT_SCOPES);
    unmount();
    client.stop();
  },
);
