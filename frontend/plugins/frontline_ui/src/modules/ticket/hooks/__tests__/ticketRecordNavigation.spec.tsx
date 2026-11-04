import { renderHook, act } from '@testing-library/react';
import { useTicketDetailSheet } from '../useTicketDetailSheet';
import { useCreateTicketRecord } from '../useCreateTicketRecord';

const mockOpenRecord = jest.fn();
const mockOpenNewRecord = jest.fn();
const mockBack = jest.fn();
const mockClose = jest.fn();
let mockCanGoBack = true;
let mockPathname = '/frontline/tickets';

jest.mock('ui-modules', () => ({
  useSidePanel: () => ({
    record: { contentType: 'frontline:ticket', contentId: 'ticket-1' },
    openRecord: mockOpenRecord,
    openNewRecord: mockOpenNewRecord,
    canGoBack: mockCanGoBack,
    back: mockBack,
    close: mockClose,
  }),
}));
jest.mock('erxes-ui', () => ({
  useQueryState: (key: string) => [`query-${key}`, jest.fn()],
}));
jest.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: mockPathname }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockCanGoBack = true;
  mockPathname = '/frontline/tickets';
});

it('returns to the parent record when the active stacked ticket is removed', () => {
  const { result } = renderHook(useTicketDetailSheet);
  act(() => result.current[1](null));
  expect(mockBack).toHaveBeenCalledTimes(1);
  expect(mockClose).not.toHaveBeenCalled();
});

it('closes an unstacked ticket after removal', () => {
  mockCanGoBack = false;
  const { result } = renderHook(useTicketDetailSheet);
  act(() => result.current[1](null));
  expect(mockClose).toHaveBeenCalledTimes(1);
  expect(mockBack).not.toHaveBeenCalled();
});

it.each(['/sales/deals', '/contacts/customers', '/frontline-other'])(
  'ignores foreign query defaults on %s',
  (pathname) => {
    mockPathname = pathname;
    const { result } = renderHook(useCreateTicketRecord);
    act(() => result.current.openTicketDraft());
    expect(mockOpenNewRecord).toHaveBeenCalledWith(
      'frontline:ticket',
      { channelId: undefined, pipelineId: undefined },
      { stack: false },
    );
  },
);

it('keeps explicit defaults and contact association outside Frontline', () => {
  mockPathname = '/contacts/customers';
  const { result } = renderHook(useCreateTicketRecord);
  act(() =>
    result.current.openTicketDraft(
      {
        channelId: 'ticket-channel',
        pipelineId: 'ticket-pipeline',
        customerId: 'customer-1',
      },
      true,
    ),
  );
  expect(mockOpenNewRecord).toHaveBeenCalledWith(
    'frontline:ticket',
    {
      channelId: 'ticket-channel',
      pipelineId: 'ticket-pipeline',
      customerId: 'customer-1',
    },
    { stack: true },
  );
});

it.each(['/frontline', '/frontline/tickets'])(
  'uses ticket query defaults on %s',
  (pathname) => {
    mockPathname = pathname;
    const { result } = renderHook(useCreateTicketRecord);
    act(() => result.current.openTicketDraft());
    expect(mockOpenNewRecord).toHaveBeenCalledWith(
      'frontline:ticket',
      { channelId: 'query-channelId', pipelineId: 'query-pipelineId' },
      { stack: false },
    );
  },
);
