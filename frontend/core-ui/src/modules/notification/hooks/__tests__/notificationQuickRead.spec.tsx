import { act, renderHook } from '@testing-library/react';
import { useNotificationQuickRead } from '../useNotificationQuickRead';
import { useMarkAsReadNotification } from '../useMarkAsReadNotification';

const mockToast = jest.fn();

jest.mock('erxes-ui', () => ({
  useToast: () => ({ toast: mockToast }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('../useMarkAsReadNotification');

describe('notification quick read', () => {
  beforeEach(() => jest.clearAllMocks());

  it('ignores repeated clicks while the mutation is pending', async () => {
    let finish: (success: boolean) => void = () => {
      throw new Error('Mutation has not started');
    };
    const pending = new Promise<boolean>((resolve) => {
      finish = resolve;
    });
    const markAsRead = jest.fn(() => pending);
    jest.mocked(useMarkAsReadNotification).mockReturnValue(markAsRead);
    const { result } = renderHook(() => useNotificationQuickRead('first'));
    let completion: Promise<void>;
    act(() => {
      completion = result.current.markRead();
      void result.current.markRead();
    });
    expect(markAsRead).toHaveBeenCalledTimes(1);
    expect(markAsRead).toHaveBeenCalledWith('first');
    expect(result.current.pending).toBe(true);
    await act(async () => {
      finish(true);
      await completion;
    });
    expect(result.current.pending).toBe(false);
    expect(mockToast).toHaveBeenCalledTimes(1);
  });

  it('allows retry after a failure and only confirms a successful read', async () => {
    const markAsRead = jest
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    jest.mocked(useMarkAsReadNotification).mockReturnValue(markAsRead);
    const { result } = renderHook(() => useNotificationQuickRead('first'));
    await act(async () => {
      await result.current.markRead();
    });
    expect(mockToast).not.toHaveBeenCalled();
    expect(result.current.pending).toBe(false);
    await act(async () => {
      await result.current.markRead();
    });
    expect(markAsRead).toHaveBeenCalledTimes(2);
    expect(mockToast).toHaveBeenCalledTimes(1);
  });
});
