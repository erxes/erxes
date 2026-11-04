import { act, render, renderHook, screen } from '@testing-library/react';
import { CONFIG } from '~/config';
import { RecordPanel } from '../RecordPanel';
import { Provider, createStore } from 'jotai';
import type { PropsWithChildren } from 'react';
import { currentUserState } from 'ui-modules';
import { useTicketRemove } from '@/ticket/hooks/useRemoveTicket';

const mockRemove = jest.fn();
const mockBack = jest.fn();
const mockClose = jest.fn();
let mockRecordId = 'record-1';

beforeEach(() => {
  jest.clearAllMocks();
  mockRecordId = 'record-1';
});

jest.mock('erxes-ui', () => ({
  Spinner: () => <span>Loading</span>,
  Skeleton: () => null,
}));
jest.mock('ui-modules', () => ({
  currentUserState: jest
    .requireActual<typeof import('jotai')>('jotai')
    .atom({ _id: 'user-1' }),
  useSidePanel: () => ({
    record: { contentType: 'frontline:ticket', contentId: mockRecordId },
    canGoBack: true,
    back: mockBack,
    close: mockClose,
    openRecord: jest.fn(),
  }),
}));
jest.mock('@apollo/client', () => ({
  useMutation: () => [mockRemove, { loading: false }],
}));
jest.mock('@/ticket/graphql/queries/getTickets', () => ({ GET_TICKETS: {} }));
jest.mock('@/ticket/graphql/mutations/removeTicket', () => ({
  REMOVE_TICKET: {},
}));
jest.mock('@/ticket/hooks/useRemoveTicketsFromView', () => ({
  useRemoveTicketsFromView: () => ({ removeTicketsFromView: jest.fn() }),
}));
jest.mock('react-router-dom', () => ({ useParams: () => ({}) }));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('~/searchProviders', () => ({ SEARCH_PROVIDERS: [] }));
jest.mock('@/ticket/hooks/useGetTicket', () => ({
  useGetTicket: () => ({
    ticket: { _id: 'record-1', name: 'Ticket' },
    loading: false,
  }),
}));
jest.mock('@/ticket/hooks/useTicketCustomFieldEdit', () => ({
  useTicketCustomFieldEdit: jest.fn(),
}));
jest.mock('@/ticket/components/add-ticket/AddTicketForm', () => ({
  AddTicketForm: () => <output>Ticket create</output>,
}));
jest.mock('@/activity/components/ActivityList', () => ({
  ActivityList: () => null,
}));
jest.mock('@/ticket/components/ticket-detail/TicketDetailActions', () => ({
  TicketDetailActions: () => null,
}));
jest.mock('@/ticket/components/ticket-detail/TicketPipelineProperties', () => ({
  TicketPipelineProperties: () => null,
}));
jest.mock('../TicketPanelDetail', () => ({
  TicketPanelDetail: () => <output>Ticket detail</output>,
}));

it('opens the Ticket create form', () => {
  render(
    <RecordPanel contentType="frontline:ticket" contentId="new" view="new" />,
  );
  expect(screen.getByText('Ticket create')).toBeTruthy();
});
it('opens the Ticket record view', () => {
  render(
    <RecordPanel
      contentType="frontline:ticket"
      contentId="record-1"
      view="detail"
    />,
  );
  expect(screen.getByText('Ticket detail')).toBeTruthy();
});

it('registers only this module record types', () => {
  expect(CONFIG.widgets?.recordPanels).toEqual(
    expect.arrayContaining([{ contentType: 'frontline:ticket' }]),
  );
});

it('ignores an unsupported content type', () => {
  const { container } = render(
    <RecordPanel
      contentType="other:record"
      contentId="record-1"
      view="detail"
    />,
  );
  expect(container.firstChild).toBeNull();
});

it('leaves B open when deletion started in an unmounted A owner completes', async () => {
  const store = createStore();
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  mockRecordId = 'ticket-A';
  const title = render(
    <RecordPanel
      contentType="frontline:ticket"
      contentId="ticket-A"
      view="title"
    />,
    { wrapper },
  );
  let finish: () => void = () => undefined;
  mockRemove.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const deletion = renderHook(useTicketRemove, { wrapper });
  let request: Promise<void>;
  act(() => {
    request = deletion.result.current.removeTicket(['ticket-A']);
  });
  deletion.unmount();
  title.unmount();
  mockRecordId = 'ticket-B';
  render(
    <RecordPanel
      contentType="frontline:ticket"
      contentId="ticket-B"
      view="title"
    />,
    { wrapper },
  );
  await act(async () => {
    finish();
    await request;
  });
  expect(mockClose).not.toHaveBeenCalled();
  expect(mockBack).not.toHaveBeenCalled();
});

it('returns to the stacked parent after deletion even if the action owner unmounts', async () => {
  const store = createStore();
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  mockRecordId = 'ticket-A';
  render(
    <RecordPanel
      contentType="frontline:ticket"
      contentId="ticket-A"
      view="title"
    />,
    { wrapper },
  );
  let finish: () => void = () => undefined;
  mockRemove.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const deletion = renderHook(useTicketRemove, { wrapper });
  let request: Promise<void>;
  act(() => {
    request = deletion.result.current.removeTicket(['ticket-A']);
  });
  deletion.unmount();
  await act(async () => {
    finish();
    await request;
  });
  expect(mockBack).toHaveBeenCalledTimes(1);
  expect(mockClose).not.toHaveBeenCalled();
});

it('ignores deletion navigation after logout and signing back in', async () => {
  const store = createStore();
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  mockRecordId = 'ticket-A';
  render(
    <RecordPanel
      contentType="frontline:ticket"
      contentId="ticket-A"
      view="title"
    />,
    { wrapper },
  );
  let finish: () => void = () => undefined;
  mockRemove.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const deletion = renderHook(useTicketRemove, { wrapper });
  let request: Promise<void>;
  act(() => {
    request = deletion.result.current.removeTicket(['ticket-A']);
  });
  const user = store.get(currentUserState);
  act(() => {
    store.set(currentUserState, null);
    store.set(currentUserState, user);
  });
  await act(async () => {
    finish();
    await request;
  });
  expect(mockBack).not.toHaveBeenCalled();
  expect(mockClose).not.toHaveBeenCalled();
});
