import { act, renderHook } from '@testing-library/react';
import { useChannelRemove } from '@/channels/hooks/useChannelRemove';
import { useChannelsRemove } from '@/channels/hooks/useChannelsRemove';
import { useRemoveResponse } from '@/responseTemplate/hooks/useRemoveResponse';
import { useRemoveTicketConfig } from '@/pipelines/components/configs/hooks/useRemoveTicketConfig';

interface RemovedRecords {
  channelRemove?: { _id: string };
  responseTemplatesRemove?: { _id: string };
  ticketRemoveConfig?: { id: string };
}
type RecordIdentity = { contentType: string; contentId: string };
let mockRecord: RecordIdentity | null;
let mockComplete: ((data: RemovedRecords) => void) | undefined;

jest.mock('@apollo/client', () => ({
  useMutation: (
    _document: unknown,
    options: { onCompleted?: (data: RemovedRecords) => void } = {},
  ) => {
    mockComplete = options.onCompleted;
    return [jest.fn(), { loading: false, error: undefined }];
  },
  useApolloClient: () => ({ refetchQueries: jest.fn() }),
}));
jest.mock('ui-modules', () => ({
  useSidePanel: () => ({
    record: mockRecord,
    close: () => {
      mockRecord = null;
    },
  }),
}));
jest.mock('erxes-ui', () => ({ toast: jest.fn() }));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@/channels/graphql/mutations', () => ({ REMOVE_CHANNEL: {} }));
jest.mock('@/responseTemplate/graphql/mutations/deleteResponse', () => ({
  REMOVE_RESPONSE: {},
}));
jest.mock('@/responseTemplate/graphql/queries/getResponses', () => ({
  GET_RESPONSES: {},
}));
jest.mock('@/pipelines/components/configs/graphql', () => ({
  REMOVE_TICKET_CONFIG: {},
}));

const removals = [
  {
    name: 'channel',
    contentType: 'frontline:channel',
    useRemove: useChannelRemove,
    data: { channelRemove: { _id: 'removed' } },
  },
  {
    name: 'channel in bulk',
    contentType: 'frontline:channel',
    useRemove: useChannelsRemove,
    data: { channelRemove: { _id: 'removed' } },
  },
  {
    name: 'response template',
    contentType: 'frontline:response-template',
    useRemove: useRemoveResponse,
    data: { responseTemplatesRemove: { _id: 'removed' } },
  },
  {
    name: 'ticket configuration',
    contentType: 'frontline:ticket-config',
    useRemove: useRemoveTicketConfig,
    data: { ticketRemoveConfig: { id: 'removed' } },
  },
];

test.each(removals)(
  'closes the removed $name when it is still active',
  ({ useRemove, contentType, data }) => {
    mockRecord = { contentType, contentId: 'removed' };
    renderHook(() => useRemove());

    act(() => mockComplete?.(data));

    expect(mockRecord).toBeNull();
  },
);

test.each(removals)(
  'preserves a newly active record after removing a $name',
  ({ useRemove, contentType, data }) => {
    mockRecord = { contentType, contentId: 'removed' };
    const { rerender } = renderHook(() => useRemove());
    const completePendingRemoval = mockComplete;
    mockRecord = { contentType, contentId: 'newly-active' };
    rerender();

    act(() => completePendingRemoval?.(data));

    expect(mockRecord).toEqual({ contentType, contentId: 'newly-active' });
  },
);

test.each(removals)(
  'preserves another record type with the same ID after removing a $name',
  ({ useRemove, data }) => {
    mockRecord = { contentType: 'frontline:ticket', contentId: 'removed' };
    renderHook(() => useRemove());

    act(() => mockComplete?.(data));

    expect(mockRecord).toEqual({
      contentType: 'frontline:ticket',
      contentId: 'removed',
    });
  },
);

test.each(removals)(
  'does not close another panel after the $name removal owner unmounts',
  ({ useRemove, contentType, data }) => {
    mockRecord = { contentType, contentId: 'removed' };
    const { unmount } = renderHook(() => useRemove());
    const completePendingRemoval = mockComplete;
    unmount();
    mockRecord = { contentType, contentId: 'newly-active' };

    act(() => completePendingRemoval?.(data));

    expect(mockRecord).toEqual({ contentType, contentId: 'newly-active' });
  },
);
