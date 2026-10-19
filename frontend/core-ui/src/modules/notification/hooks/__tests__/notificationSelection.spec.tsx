import { act, renderHook } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import type { ReactNode } from 'react';
import { useNotificationSelection } from '../useNotificationSelection';
import { useNotificationListActions } from '../useNotificationListActions';
import {
  hiddenNotificationIdsState,
  selectedNotificationIdsState,
} from '@/notification/states/notificationState';
import { useMarkAsReadNotification } from '../useMarkAsReadNotification';
import { TNotificationKind, type TNotification } from 'ui-modules';

const mockNavigate = jest.fn();
let mockLocation = { search: '?status=unread', key: 'initial' };
let mockId = 'first';

jest.mock('react-router-dom', () => ({
  useLocation: () => mockLocation,
  useParams: () => ({ id: mockId }),
  useNavigate: () => mockNavigate,
}));
jest.mock('erxes-ui', () => ({
  useScopedHotkeys: jest.fn(),
  useToast: () => ({ toast: jest.fn() }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('ui-modules', () => ({ TNotificationKind: { USER: 'user' } }));
jest.mock('../useMarkAsReadNotification');

const setupStore = () => {
  const store = createStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { store, wrapper };
};

describe('notification selection across page refetches', () => {
  it('restores a selected item when its page is loaded again', () => {
    const { wrapper } = setupStore();
    const { result, rerender } = renderHook(
      ({ ids, filter }) => useNotificationSelection(ids, filter),
      { initialProps: { ids: ['first', 'later'], filter: '' }, wrapper },
    );
    act(() => result.current.select('later', false));
    rerender({ ids: ['first'], filter: '' });
    expect(result.current.selectedIds).toEqual([]);
    rerender({ ids: ['first', 'later'], filter: '' });
    expect(result.current.selectedIds).toEqual(['later']);
    rerender({ ids: ['first', 'later'], filter: '?type=warning' });
    expect(result.current.selectedIds).toEqual([]);
  });

  it('clears shared selection when the list unmounts', () => {
    const { store, wrapper } = setupStore();
    const { result, unmount } = renderHook(
      () => useNotificationSelection(['first'], ''),
      { wrapper },
    );
    act(() => result.current.select('first', false));
    unmount();
    expect(store.get(selectedNotificationIdsState)).toEqual([]);
  });
});

describe('pending bulk read completion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation = { search: '?status=unread', key: 'initial' };
    mockId = 'first';
  });

  const setupBatch = (ids = ['first'], failedId?: string) => {
    const { store, wrapper } = setupStore();
    let finish: (success: boolean) => void = () => {
      throw new Error('Read mutation has not started');
    };
    const pendingRead = new Promise<boolean>((resolve) => {
      finish = resolve;
    });
    const markAsRead = jest.fn((id: string) =>
      id === failedId ? Promise.resolve(false) : pendingRead,
    );
    jest.mocked(useMarkAsReadNotification).mockReturnValue(markAsRead);
    const notification: TNotification = {
      _id: 'first',
      title: 'First',
      message: 'First notification',
      type: 'info',
      priority: 'low',
      kind: TNotificationKind.USER,
      isRead: false,
      createdAt: '2026-10-16T00:00:00Z',
    };
    const hook = renderHook(
      () =>
        useNotificationListActions({
          notifications: ids.map((_id) => ({ ...notification, _id })),
          loading: false,
        }),
      { wrapper },
    );
    act(() => store.set(selectedNotificationIdsState, ids));
    let batch: Promise<void>;
    act(() => {
      batch = hook.result.current.markSelectedAsRead();
    });
    const complete = async (success = true) => {
      await act(async () => {
        finish(success);
        await batch;
      });
    };
    return { ...hook, store, complete, markAsRead };
  };

  it('navigates away from the completed item only on the unchanged route', async () => {
    const { store, complete } = setupBatch();
    await complete();
    expect(mockNavigate).toHaveBeenCalledWith('/my-inbox?status=unread');
    expect(store.get(hiddenNotificationIdsState)).toEqual(['first']);
    expect(store.get(selectedNotificationIdsState)).toEqual([]);
  });

  it.each(['notification', 'filter', 'return'])(
    'does not override a %s navigation',
    async (change) => {
      const { rerender, complete } = setupBatch();
      mockLocation = {
        search: change === 'filter' ? '?type=warning' : '?status=unread',
        key: 'changed',
      };
      mockId = change === 'filter' ? 'first' : 'second';
      rerender();
      if (change === 'return') {
        mockId = 'first';
        mockLocation = { search: '?status=unread', key: 'returned' };
        rerender();
      }
      await complete();
      expect(mockNavigate).not.toHaveBeenCalled();
    },
  );

  it('does not navigate after unmount', async () => {
    const { unmount, complete } = setupBatch();
    unmount();
    await complete();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('keeps failed items visible and selected for retry', async () => {
    const { store, complete } = setupBatch();
    await complete(false);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(store.get(hiddenNotificationIdsState)).toEqual([]);
    expect(store.get(selectedNotificationIdsState)).toEqual(['first']);
  });

  it('starts selected reads together and retains only failed items for retry', async () => {
    const { store, complete, markAsRead } = setupBatch(
      ['first', 'failed', 'third'],
      'failed',
    );
    expect(markAsRead.mock.calls).toEqual([['first'], ['failed'], ['third']]);
    await complete();
    expect(store.get(hiddenNotificationIdsState)).toEqual(['first', 'third']);
    expect(store.get(selectedNotificationIdsState)).toEqual(['failed']);
  });
});
