import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import {
  ReportConversationOpenDocument,
  ReportTicketTotalCountDocument,
} from '~/gql/graphql';
import {
  getReportQueryScope,
  refetchReportQueries,
} from '@/report/utils/reportQueries';

it.each([
  ['ReportConversationList', 'inbox'],
  ['ReportTicketOpen', 'ticket'],
  ['ReportFacebookSummary', 'facebook'],
  ['CallHeatmap', 'call'],
  ['GetCallbackStats', 'call'],
  ['callHistoryList', 'call'],
  ['ReportCharts', 'charts'],
  ['ReportConversationExport', undefined],
  ['ReportTicketExport', undefined],
  ['ConversationCounts', undefined],
  [undefined, undefined],
])('maps %s to the %s report scope', (queryName, scope) => {
  expect(getReportQueryScope(queryName)).toBe(scope);
});

it('sends only the affected query through HttpLink and aborts its actual fetch', async () => {
  const signals: AbortSignal[] = [];
  const fetch: typeof globalThis.fetch = jest.fn(
    (_input: RequestInfo | URL, options?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        const signal = options?.signal;
        if (!signal) throw new Error('Expected a cancellable request');
        signals.push(signal);
        signal.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        );
      }),
  );
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: createHttpLink({ uri: '/graphql', fetch }),
  });
  const inbox = client.watchQuery({
    query: ReportConversationOpenDocument,
    fetchPolicy: 'cache-only',
    context: { headers: { 'x-test': 'kept' } },
  });
  const ticket = client.watchQuery({
    query: ReportTicketTotalCountDocument,
    fetchPolicy: 'cache-only',
  });
  const observer = { next: () => undefined, error: () => undefined };
  const subscriptions = [inbox.subscribe(observer), ticket.subscribe(observer)];
  const controller = new AbortController();
  const refresh = refetchReportQueries(
    client,
    new Set(['inbox']),
    controller.signal,
  );
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(signals[0].aborted).toBe(false);

  controller.abort();
  await refresh;

  expect(signals[0].aborted).toBe(true);
  expect(inbox.options.fetchPolicy).toBe('cache-only');
  expect(inbox.options.context).toEqual({ headers: { 'x-test': 'kept' } });
  subscriptions.forEach((subscription) => subscription.unsubscribe());
  client.stop();
});
