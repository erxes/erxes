import { renderHook } from '@testing-library/react';
import { useQuery } from '@apollo/client';
import { useNotification } from '../useNotification';

const mockMarkAsRead = jest.fn().mockResolvedValue(true);
let mockId = 'first';
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useQuery: jest.fn(),
}));
jest.mock('react-router-dom', () => ({ useParams: () => ({ id: mockId }) }));
jest.mock('../useMarkAsReadNotification', () => ({
  useMarkAsReadNotification: () => mockMarkAsRead,
}));
jest.mock('../useNotificationNavigation', () => ({
  useNotificationNavigation: () => ({}),
}));

describe('automatically marking an opened notification seen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockId = 'first';
  });

  const setNotification = (_id: string, isRead = false) => {
    jest.mocked(useQuery).mockReturnValue({
      data: { notificationDetail: { _id, isRead } },
      loading: false,
    } as ReturnType<typeof useQuery>);
  };

  it('marks an unread detail once, not on every query render', () => {
    setNotification('first');
    const { rerender } = renderHook(() => useNotification());
    setNotification('first');
    rerender();
    expect(mockMarkAsRead.mock.calls).toEqual([['first']]);
    mockId = 'second';
    setNotification('second');
    rerender();
    expect(mockMarkAsRead.mock.calls).toEqual([['first'], ['second']]);
  });

  it('does not mark already seen or stale details', () => {
    setNotification('first', true);
    const { rerender } = renderHook(() => useNotification());
    mockId = 'second';
    setNotification('first');
    rerender();
    expect(mockMarkAsRead).not.toHaveBeenCalled();
  });

  it('does not repeatedly retry a failed automatic read', () => {
    mockMarkAsRead.mockResolvedValueOnce(false);
    setNotification('first');
    const { rerender } = renderHook(() => useNotification());
    setNotification('first');
    rerender();
    expect(mockMarkAsRead).toHaveBeenCalledTimes(1);
  });
});
