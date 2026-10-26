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
import { CONVERSATION_REPORT_QUERIES } from '../../graphql/queries/getChart';

jest.mock('erxes-ui', () => ({
  isDefined: (value: unknown) => value !== null && value !== undefined,
}));

const results: Record<string, Record<string, unknown>> = {
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
      await client.refetchQueries({ include: CONVERSATION_REPORT_QUERIES });
    });
    expect(request).toHaveBeenCalledTimes(18);

    unmount();
    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });
    expect(request).toHaveBeenCalledTimes(18);
    client.stop();
  });
});
