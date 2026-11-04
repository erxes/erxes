import { renderHook } from '@testing-library/react';
import { useGetTicket } from '../useGetTicket';

type TSubscription = {
  updateQuery: (
    previous: { getTicket: { _id: string } },
    update: {
      subscriptionData: {
        data: { ticketChanged: { type: string; ticket: null } };
      };
    },
  ) => { getTicket: { _id: string } | null };
};
const mockSubscribe = jest.fn<() => void, [TSubscription]>(() => jest.fn());
jest.mock('@apollo/client', () => ({
  useQuery: () => ({
    data: { getTicket: { _id: 'ticket-1' } },
    loading: false,
    refetch: jest.fn(),
    subscribeToMore: mockSubscribe,
  }),
}));
jest.mock('@/ticket/graphql/queries/getTicket', () => ({ GET_TICKET: {} }));
jest.mock('@/ticket/graphql/subscriptions/ticketChanged', () => ({
  TICKET_CHANGED: {},
}));

beforeEach(() => jest.clearAllMocks());

it('does not subscribe for panel views that share the title subscription', () => {
  renderHook(() =>
    useGetTicket({ variables: { _id: 'ticket-1' }, subscribe: false }),
  );
  expect(mockSubscribe).not.toHaveBeenCalled();
});

it('keeps real-time updates enabled for ordinary ticket consumers', () => {
  const { result } = renderHook(() =>
    useGetTicket({ variables: { _id: 'ticket-1' } }),
  );
  expect(result.current.ticket?._id).toBe('ticket-1');
  expect(mockSubscribe).toHaveBeenCalledTimes(1);
});

it('clears the detail when its subscription reports deletion', () => {
  renderHook(() => useGetTicket({ variables: { _id: 'ticket-1' } }));
  const updateQuery = mockSubscribe.mock.calls[0][0].updateQuery;
  expect(
    updateQuery(
      { getTicket: { _id: 'ticket-1' } },
      {
        subscriptionData: {
          data: { ticketChanged: { type: 'delete', ticket: null } },
        },
      },
    ),
  ).toEqual({ getTicket: null });
});
