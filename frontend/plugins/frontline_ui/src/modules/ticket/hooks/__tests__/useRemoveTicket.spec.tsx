import { act, renderHook } from '@testing-library/react';
import { InMemoryCache } from '@apollo/client';
import { parse } from 'graphql';
import { getDefaultStore } from 'jotai';
import { useTicketRemove } from '../useRemoveTicket';
import {
  ticketRemovedIdsState,
  unmarkTicketsRemoved,
} from '@/ticket/states/removedTicketsState';

jest.mock('ui-modules', () => ({
  currentUserState: jest
    .requireActual<typeof import('jotai')>('jotai')
    .atom({ _id: 'user-1' }),
}));

const mockCache = new InMemoryCache();
const mockRemoveTicket = jest.fn();
const mockRemoveFromView = jest.fn();
const ticketQuery = parse(
  'query TicketDeletionRead($_id: String!) { getTicket(_id: $_id) { _id name } }',
);

jest.mock('@apollo/client', () => ({
  ...jest.requireActual<typeof import('@apollo/client')>('@apollo/client'),
  useMutation: () => [mockRemoveTicket, { loading: false }],
}));
jest.mock('@/ticket/graphql/queries/getTickets', () => ({ GET_TICKETS: {} }));
jest.mock('@/ticket/graphql/mutations/removeTicket', () => ({
  REMOVE_TICKET: {},
}));
jest.mock('../useRemoveTicketsFromView', () => ({
  useRemoveTicketsFromView: () => ({
    removeTicketsFromView: mockRemoveFromView,
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockCache.restore({});
  unmarkTicketsRemoved(['ticket-1']);
  getDefaultStore().set(ticketRemovedIdsState, { ids: [] });
  mockCache.writeQuery({
    query: ticketQuery,
    variables: { _id: 'ticket-1' },
    data: { getTicket: { _id: 'ticket-1', name: 'Deleted ticket' } },
  });
  mockCache.writeQuery({
    query: ticketQuery,
    variables: { _id: 'ticket-2' },
    data: { getTicket: { _id: 'ticket-2', name: 'Other ticket' } },
  });
  mockRemoveTicket.mockImplementation(({ update }) =>
    Promise.resolve().then(() => {
      update(mockCache);
      return { data: { removeTicket: true } };
    }),
  );
});

it('evicts the deleted detail so browser Back cannot reopen cached ticket data', async () => {
  const { result } = renderHook(useTicketRemove);
  await act(() => Promise.resolve(result.current.removeTicket(['ticket-1'])));
  expect(
    mockCache.readQuery({ query: ticketQuery, variables: { _id: 'ticket-1' } }),
  ).toBeNull();
  expect(
    mockCache.readQuery({ query: ticketQuery, variables: { _id: 'ticket-2' } }),
  ).toEqual({ getTicket: { _id: 'ticket-2', name: 'Other ticket' } });
  expect(getDefaultStore().get(ticketRemovedIdsState)).toEqual({
    ids: ['ticket-1'],
    userId: 'user-1',
  });
});

it('keeps cached detail and the parent navigation unchanged when deletion fails', async () => {
  mockRemoveTicket.mockRejectedValueOnce(new Error('Delete failed'));
  const { result } = renderHook(useTicketRemove);
  await expect(result.current.removeTicket(['ticket-1'])).rejects.toThrow(
    'Delete failed',
  );
  expect(
    mockCache.readQuery({ query: ticketQuery, variables: { _id: 'ticket-1' } }),
  ).toEqual({ getTicket: { _id: 'ticket-1', name: 'Deleted ticket' } });
  expect(getDefaultStore().get(ticketRemovedIdsState).ids).toEqual([]);
});

it('retains both confirmed IDs when deletions finish in the same batch', async () => {
  const { result } = renderHook(useTicketRemove);
  await act(async () => {
    await Promise.all([
      result.current.removeTicket(['ticket-1']),
      result.current.removeTicket(['ticket-2']),
    ]);
  });
  expect([...getDefaultStore().get(ticketRemovedIdsState).ids].sort()).toEqual([
    'ticket-1',
    'ticket-2',
  ]);
});
