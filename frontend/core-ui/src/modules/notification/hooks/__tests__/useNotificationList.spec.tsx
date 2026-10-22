import { act, renderHook } from '@testing-library/react';
import { TNotificationKind, type TNotification } from 'ui-modules';
import { useNotificationList } from '../useNotificationList';
import { useNotifications } from '../useNotifications';

let mockStatus = 'UNREAD';
let mockInView: (inView: boolean) => void;
jest.mock('ui-modules', () => ({ TNotificationKind: { USER: 'user' } }));
jest.mock('../useNotifications', () => ({ useNotifications: jest.fn() }));
jest.mock('../useNotificationFilters', () => ({
  useNotificationFilters: () => ({ status: mockStatus }),
}));
jest.mock('react-intersection-observer', () => ({
  useInView: ({ onChange }: { onChange: typeof mockInView }) => {
    mockInView = onChange;
    return { ref: jest.fn() };
  },
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback || key,
    i18n: { language: 'en' },
  }),
}));

const first: TNotification = {
  _id: 'first',
  title: 'First',
  message: 'First notification',
  type: 'info',
  priority: 'low',
  kind: TNotificationKind.USER,
  isRead: false,
  createdAt: '2026-10-22T00:00:00Z',
};

const page = (notifications: TNotification[], totalCount: number) => ({
  notifications,
  totalCount,
  loading: false,
  error: undefined,
  pageInfo: {
    hasNextPage: totalCount > notifications.length,
    hasPreviousPage: false,
    startCursor: 'start',
    endCursor: 'end',
  },
  fetchMoreError: null,
  fetchingMore: false,
  handleFetchMore: jest.fn().mockResolvedValue(undefined),
  retry: jest.fn().mockResolvedValue(undefined),
});

describe('notification tabs and totals', () => {
  beforeEach(() => {
    mockStatus = 'UNREAD';
    jest.clearAllMocks();
  });

  it('uses server totals and paginates only the selected tab', async () => {
    const unread = page([first], 50);
    const seen = page([{ ...first, _id: 'seen', isRead: true }], 120);
    jest
      .mocked(useNotifications)
      .mockImplementation((options) =>
        options?.variables?.status === 'READ' ? seen : unread,
      );
    const { result, rerender } = renderHook(() => useNotificationList());
    expect(result.current.unreadCount).toBe(50);
    expect(result.current.seenCount).toBe(120);
    expect(result.current.notifications.map((item) => item._id)).toEqual([
      'first',
    ]);
    await act(async () => result.current.loadMore());
    expect(unread.handleFetchMore).toHaveBeenCalledWith(true);
    expect(seen.handleFetchMore).not.toHaveBeenCalled();

    mockStatus = 'READ';
    rerender();
    expect(result.current.notifications.map((item) => item._id)).toEqual([
      'seen',
    ]);
    act(() => mockInView(true));
    expect(seen.handleFetchMore).toHaveBeenCalled();
  });

  it('removes a newly read cached item from Unread and shows it in Seen', () => {
    const unread = page([first], 1);
    const seen = page([], 0);
    jest
      .mocked(useNotifications)
      .mockImplementation((options) =>
        options?.variables?.status === 'READ' ? seen : unread,
      );
    const { result, rerender } = renderHook(() => useNotificationList());
    unread.notifications = [{ ...first, isRead: true }];
    rerender();
    expect(result.current.notifications).toEqual([]);
    expect(result.current.isEmpty).toBe(true);

    unread.totalCount = 0;
    seen.notifications = unread.notifications;
    seen.totalCount = 1;
    mockStatus = 'READ';
    rerender();
    expect(result.current.notifications).toEqual([{ ...first, isRead: true }]);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.seenCount).toBe(1);
  });

  it('keeps tabs available with unknown totals while their queries load', () => {
    jest
      .mocked(useNotifications)
      .mockReturnValue({ ...page([], 0), loading: true });
    const { result } = renderHook(() => useNotificationList());
    expect(result.current.loading).toBe(true);
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.unreadCount).toBeUndefined();
    expect(result.current.seenCount).toBeUndefined();
  });
});
