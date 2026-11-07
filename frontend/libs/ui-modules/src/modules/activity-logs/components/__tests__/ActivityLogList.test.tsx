/** @jest-environment jsdom */
import { act, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import {
  mockAllIsIntersecting,
  resetIntersectionMocking,
  setupIntersectionMocking,
} from 'react-intersection-observer/test-utils';
import { ActivityLogProvider } from '../../context/ActivityLogProvider';
import { ACTIVITY_LOGS } from '../../graphql/queries';
import { ACTIVITY_LOG_INSERTED } from '../../graphql/subscriptions';
import { useActivityLogs } from '../../hooks/useActivityLogs';
import { TActivityLog } from '../../types';
import { ActivityLogList } from '../ActivityLogList';

jest.mock('erxes-ui', () => ({
  ...jest.requireActual('erxes-ui/constants/GraphqlConstants'),
  ...jest.requireActual('erxes-ui/modules/record-table/utils/cursorUtils'),
  ...jest.requireActual(
    'erxes-ui/modules/record-table/types/RecordTableCursorTypes',
  ),
  Skeleton: () => <span aria-label="Loading placeholder" />,
  Spinner: () => <span />,
}));
jest.mock('../ActivityLogRow', () => ({
  ActivityLogRow: ({ activity }: { activity: TActivityLog }) => (
    <div>{activity.action.description}</div>
  ),
}));

const activity = (id: string): TActivityLog => ({
  _id: id,
  createdAt: '2026-01-01T00:00:00.000Z',
  actorType: 'user',
  actor: { username: 'Member' },
  targetType: 'core:user',
  target: { moduleName: 'core', collectionName: 'users' },
  contextType: 'core:user',
  context: { moduleName: 'core', collectionName: 'users' },
  action: { description: id },
  activityType: 'field_changed',
  sourcePlugin: 'core',
  changes: null,
  metadata: null,
});

const Feed = ({ variant }: { variant: 'forward' | 'backward' }) => {
  const logs = useActivityLogs({ targetId: 'member', variant });
  return (
    <ActivityLogProvider targetId="member" {...logs}>
      <ActivityLogList />
    </ActivityLogProvider>
  );
};

const pageMock = (
  variant: 'forward' | 'backward',
  id: string,
  hasMore: boolean,
  cursor?: string,
): MockedResponse => ({
  request: {
    query: ACTIVITY_LOGS,
    variables: {
      targetId: 'member',
      variant,
      ...(cursor ? { cursor, limit: 10, direction: variant } : {}),
    },
  },
  delay: 20,
  result: {
    data: {
      activityLogs: {
        list: [activity(id)],
        totalCount: 3,
        pageInfo: {
          startCursor: id,
          endCursor: id,
          hasNextPage: variant === 'forward' && hasMore,
          hasPreviousPage: variant === 'backward' && hasMore,
        },
      },
    },
  },
});

beforeEach(() => setupIntersectionMocking(jest.fn));
afterEach(() => resetIntersectionMocking());

it.each(['forward', 'backward'] as const)(
  'continues %s pagination while the sentinel stays visible and stops at the last page',
  async (variant) => {
    render(
      <MockedProvider
        addTypename={false}
        mocks={[
          pageMock(variant, 'first', true),
          pageMock(variant, 'second', true, 'first'),
          pageMock(variant, 'third', false, 'second'),
          {
            request: {
              query: ACTIVITY_LOG_INSERTED,
              variables: { targetId: 'member' },
            },
            delay: Infinity,
            result: { data: {} },
          },
        ]}
      >
        <Feed variant={variant} />
      </MockedProvider>,
    );

    await screen.findByText('first');
    expect(screen.queryAllByLabelText('Loading placeholder')).toHaveLength(0);
    act(() => mockAllIsIntersecting(true));
    await screen.findByRole('status', { name: 'Loading more activity logs' });
    await screen.findByText('second');
    await screen.findByText('third');
    await waitFor(() => {
      expect(screen.queryAllByLabelText('Loading placeholder')).toHaveLength(0);
      expect(screen.queryByRole('status')).toBeNull();
    });
    expect(screen.getByText('first')).toBeTruthy();
  },
);

it('keeps loaded rows and stops loading when a page request fails', async () => {
  const matchPageRequest = jest.fn(() => true);
  render(
    <MockedProvider
      addTypename={false}
      mocks={[
        pageMock('backward', 'first', true),
        {
          request: { query: ACTIVITY_LOGS },
          variableMatcher: matchPageRequest,
          error: new Error('Page unavailable'),
          delay: 20,
          maxUsageCount: Infinity,
        },
        {
          request: {
            query: ACTIVITY_LOG_INSERTED,
            variables: { targetId: 'member' },
          },
          delay: Infinity,
          result: { data: {} },
        },
      ]}
    >
      <Feed variant="backward" />
    </MockedProvider>,
  );

  await screen.findByText('first');
  act(() => mockAllIsIntersecting(true));
  await screen.findByRole('status', { name: 'Loading more activity logs' });
  await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
  expect(screen.getByText('first')).toBeTruthy();
  expect(matchPageRequest).toHaveBeenCalledTimes(1);
});
