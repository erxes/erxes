import type { PropsWithChildren } from 'react';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useConversationOpen } from '../useConversationOpen';
import { useConversationClosed } from '../useConversationClose';
import { useConversationResolved } from '../useConversationResolved';
import { useConversationTags } from '../useConversationTags';
import { useConversationSources } from '../useConversationSource';
import { useConversationResponses } from '../useConversationResponses';
import { useConversationList } from '../useConversationList';
import { useConversationReportsByStatus } from '../useConversationReportsByStatus';
import { useConversationResolvedByDate } from '../useConversationResolvedByDate';
import {
  REMOVE_INTEGRATION,
  shouldRefetchIntegrationRemovalQuery,
} from '@/integrations/graphql/mutations/RemoveIntegration';
import {
  GET_CONVERSATION_OPEN,
  GET_CONVERSATION_EXPORT,
} from '../../graphql/queries/getChart';

jest.mock('erxes-ui', () => ({
  isDefined: (value: unknown) => value !== null && value !== undefined,
}));

const results: Record<string, Record<string, unknown>> = {
  IntegrationsRemove: {
    integrationsRemove: { acknowledged: true, deletedCount: 1 },
  },
  ReportConversationOpen: {
    reportConversationOpen: { count: 2, percentage: 50 },
  },
  ReportConversationClosed: {
    reportConversationClosed: { count: 2, percentage: 50 },
  },
  ReportConversationResolved: {
    reportConversationResolved: { count: 2, percentage: 50 },
  },
  ReportConversationTags: { reportConversationTags: [] },
  ReportConversationSources: { reportConversationSources: [] },
  ReportConversationResponses: { reportConversationResponses: [] },
  ReportConversationList: {
    reportConversationList: { list: [], totalCount: 0, page: 1, totalPages: 0 },
  },
  ReportConversationOpenDate: { reportConversationOpenDate: [] },
  ReportConversationResolvedDate: { reportConversationResolvedDate: [] },
  ReportConversationExport: { reportConversationExport: [] },
};

describe('conversation report gateway requests', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('does not send idle requests, deduplicates matching cards, and refreshes active queries after a mutation', async () => {
    const request = jest.fn();
    const client = new ApolloClient({
      cache: new InMemoryCache({ addTypename: false }),
      link: new ApolloLink(
        (operation) =>
          new Observable((observer) => {
            request(operation.operationName);
            observer.next({ data: results[operation.operationName] });
            observer.complete();
          }),
      ),
    });
    const Wrapper = ({ children }: PropsWithChildren) => (
      <ApolloProvider client={client}>{children}</ApolloProvider>
    );
    const { result, unmount } = renderHook(
      () => {
        const open = useConversationOpen();
        useConversationOpen();
        useConversationClosed();
        useConversationResolved();
        useConversationTags();
        useConversationSources();
        useConversationResponses();
        useConversationList();
        useConversationReportsByStatus();
        useConversationResolvedByDate();
        return open;
      },
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(request).toHaveBeenCalledTimes(9);
    for (let elapsed = 0; elapsed < 3; elapsed++) {
      await act(async () => {
        jest.advanceTimersByTime(30_000);
      });
    }
    expect(request).toHaveBeenCalledTimes(9);

    await act(async () => {
      await client.mutate({
        mutation: REMOVE_INTEGRATION,
        variables: { id: 'removed' },
        refetchQueries: 'active',
        onQueryUpdated: shouldRefetchIntegrationRemovalQuery,
        awaitRefetchQueries: true,
      });
    });
    expect(request).toHaveBeenCalledTimes(19);

    unmount();
    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });
    expect(request).toHaveBeenCalledTimes(19);
    client.stop();
  });

  it('does not target inactive report queries during integration removal', async () => {
    const warning = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const request = jest.fn();
    const client = new ApolloClient({
      cache: new InMemoryCache({ addTypename: false }),
      link: new ApolloLink(
        (operation) =>
          new Observable((observer) => {
            request(operation.operationName);
            observer.next({ data: results[operation.operationName] });
            observer.complete();
          }),
      ),
    });
    const Wrapper = ({ children }: PropsWithChildren) => (
      <ApolloProvider client={client}>{children}</ApolloProvider>
    );
    const { result, unmount } = renderHook(() => useConversationOpen(), {
      wrapper: Wrapper,
    });
    // Apollo may retain an observable for the same operation with other filters.
    client.watchQuery({
      query: GET_CONVERSATION_OPEN,
      variables: { filters: { source: 'messenger' } },
    });
    const unrelated = client
      .watchQuery({ query: GET_CONVERSATION_EXPORT })
      .subscribe({ next: () => undefined });
    try {
      await waitFor(() => expect(result.current.loading).toBe(false));
      await act(async () => {
        await client.mutate({
          mutation: REMOVE_INTEGRATION,
          variables: { id: 'removed' },
          refetchQueries: 'active',
          onQueryUpdated: shouldRefetchIntegrationRemovalQuery,
          awaitRefetchQueries: true,
        });
      });
      expect(request).toHaveBeenCalledTimes(4);
      expect(
        request.mock.calls.filter(
          ([name]) => name === 'ReportConversationExport',
        ),
      ).toHaveLength(1);
      expect(
        request.mock.calls.filter(
          ([name]) => name === 'ReportConversationOpen',
        ),
      ).toHaveLength(2);
      expect(warning).not.toHaveBeenCalled();
    } finally {
      unrelated.unsubscribe();
      unmount();
      client.stop();
      warning.mockRestore();
    }
  });
});
