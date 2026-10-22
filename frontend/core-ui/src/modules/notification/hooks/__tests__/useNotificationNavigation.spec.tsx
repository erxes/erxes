import { act, renderHook } from '@testing-library/react';
import { TNotificationKind, type TNotification } from 'ui-modules';
import { useNotificationNavigation } from '../useNotificationNavigation';

let mockNotifications: TNotification[] = [];
let mockSearch = '?notificationStatus=unread';
const mockNavigate = jest.fn();
jest.mock('ui-modules', () => ({ TNotificationKind: { USER: 'user' } }));
jest.mock('../useNotificationList', () => ({
  useNotificationList: () => ({ notifications: mockNotifications }),
}));
jest.mock('react-router-dom', () => ({
  useLocation: () => ({ search: mockSearch, key: mockSearch }),
  useNavigate: () => mockNavigate,
}));
jest.mock('erxes-ui', () => ({ useScopedHotkeys: jest.fn() }));

const notification = (_id: string): TNotification => ({
  _id,
  title: _id,
  message: _id,
  type: 'info',
  priority: 'low',
  kind: TNotificationKind.USER,
  isRead: false,
  createdAt: '2026-10-22T00:00:00Z',
});

describe('navigation after automatic read moves an item to Seen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearch = '?notificationStatus=unread';
    mockNotifications = ['first', 'current', 'last'].map(notification);
  });

  it('preserves previous and next targets after the current item leaves Unread', async () => {
    const { result, rerender } = renderHook(() =>
      useNotificationNavigation({
        id: 'current',
        notification: { ...notification('current'), isRead: true },
        handleMarkAsRead: jest.fn(),
      }),
    );
    mockNotifications = mockNotifications.filter(
      (item) => item._id !== 'current',
    );
    rerender();
    expect(result.current.previousNotification?._id).toBe('first');
    expect(result.current.nextNotification?._id).toBe('last');
    await act(async () => result.current.dismissNotification());
    expect(mockNavigate).toHaveBeenCalledWith(
      '/my-inbox/last?notificationStatus=unread',
    );
  });

  it('returns to the previous item when the last item moves to Seen', async () => {
    const { result, rerender } = renderHook(() =>
      useNotificationNavigation({
        id: 'last',
        notification: { ...notification('last'), isRead: true },
        handleMarkAsRead: jest.fn(),
      }),
    );
    mockNotifications = mockNotifications.filter((item) => item._id !== 'last');
    rerender();
    expect(result.current.nextNotification).toBeUndefined();
    await act(async () => result.current.dismissNotification());
    expect(mockNavigate).toHaveBeenCalledWith(
      '/my-inbox/current?notificationStatus=unread',
    );
  });

  it('does not retain navigation targets from another tab', () => {
    const { result, rerender } = renderHook(() =>
      useNotificationNavigation({
        id: 'current',
        notification: notification('current'),
        handleMarkAsRead: jest.fn(),
      }),
    );
    mockSearch = '?notificationStatus=read';
    mockNotifications = [notification('seen')];
    rerender();
    expect(result.current.previousNotification).toBeUndefined();
    expect(result.current.nextNotification?._id).toBe('seen');
  });
});
