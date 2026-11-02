import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { parse } from 'graphql';
import { refetchReportQueries } from '../reportQueries';

it('refreshes active reports while preserving their filters and excluding exports and other screens', async () => {
  const requests: string[] = [];
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          requests.push(
            `${operation.operationName}:${operation.variables.channelId}`,
          );
          observer.next({ data: { count: requests.length } });
          observer.complete();
        }),
    ),
  });
  const watches = [
    'ReportConversationOpen',
    'ReportTicketList',
    'ReportFacebookSummary',
    'CallSlaReport',
    'ReportCharts',
    'Conversations',
    'ReportConversationExport',
  ].map((name) =>
    client.watchQuery({
      query: parse(
        `query ${name}($channelId: String) { count(channelId: $channelId) }`,
      ),
      variables: { channelId: 'selected' },
      fetchPolicy: 'network-only',
    }),
  );
  const subscriptions = watches.map((query) => query.subscribe({}));
  await Promise.all(watches.map((query) => query.result()));
  const inactive = client.watchQuery({
    query: parse('query ReportTicketOpen { openCount }'),
  });
  client.cache.writeQuery({
    query: inactive.options.query,
    data: { openCount: 1 },
  });
  inactive.subscribe({}).unsubscribe();
  requests.length = 0;

  try {
    await refetchReportQueries(client);
    expect(requests.sort()).toEqual([
      'CallSlaReport:selected',
      'ReportCharts:selected',
      'ReportConversationOpen:selected',
      'ReportFacebookSummary:selected',
      'ReportTicketList:selected',
    ]);
  } finally {
    subscriptions.forEach((subscription) => subscription.unsubscribe());
    client.stop();
  }
});
