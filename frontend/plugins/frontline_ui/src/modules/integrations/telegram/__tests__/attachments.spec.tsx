import { act, renderHook } from '@testing-library/react';
import type { ChangeEvent } from 'react';
import { toast, useUpload } from 'erxes-ui';
import { useMessageAttachments } from '@/inbox/conversations/conversation-detail/hooks/useMessageAttachments';
import { composerStorage } from '@/inbox/conversations/conversation-detail/utils/messageInput';

const mockUpload = jest.fn<
  ReturnType<ReturnType<typeof useUpload>['upload']>,
  Parameters<ReturnType<typeof useUpload>['upload']>
>();
jest.mock('erxes-ui', () => ({
  toast: jest.fn(),
  useUpload: () => ({ upload: mockUpload }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));
jest.mock(
  '@/inbox/conversations/conversation-detail/utils/messageInput',
  () => ({
    composerStorage: { getItem: jest.fn() },
  }),
);
const MB = 1024 * 1024;
/** Model file sizes without allocating large buffers in jsdom. */
const file = (name: string, mb: number): File => {
  const result = new File(['x'], name, { type: 'application/pdf' });
  Object.defineProperty(result, 'size', { value: mb * MB });
  return result;
};
const select = (
  hook: ReturnType<typeof useMessageAttachments>,
  files: File[],
): void => {
  const target = document.createElement('input');
  target.type = 'file';
  Object.defineProperty(target, 'files', { value: files });
  // Synthetic-event boundary: the handler only reads and resets the native target.
  hook.handleFileInput({ target } as ChangeEvent<HTMLInputElement>);
};
const complete = (
  batch: number,
  index: number,
  status: 'ok' | 'error' = 'ok',
): void => {
  const request = mockUpload.mock.calls[batch][0];
  const selected = request.files?.[index];
  if (!selected) throw new Error('Missing upload fixture');
  request.afterUpload({
    status,
    response: selected.name,
    fileInfo: {
      name: selected.name,
      size: selected.size,
      type: selected.type,
      duration: 0,
    },
  });
};
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(composerStorage.getItem).mockReturnValue(String(50 * MB));
  Object.defineProperty(crypto, 'randomUUID', {
    configurable: true,
    value: () => 'test-upload',
  });
});

test('rejects a Telegram selection over 50 MB before starting uploads', () => {
  const { result } = renderHook(() => useMessageAttachments(false, true));
  act(() => select(result.current, [file('a', 30), file('b', 25)]));
  expect(mockUpload).not.toHaveBeenCalled();
  expect(toast).toHaveBeenCalledWith(
    expect.objectContaining({
      title: 'Telegram attachments must total 50 MB or less per message',
    }),
  );
  expect(result.current.pendingAttachments).toHaveLength(0);
});
test('counts pending and completed uploads across selections, including before a render', () => {
  const { result } = renderHook(() => useMessageAttachments(false, true));
  act(() => {
    select(result.current, [file('a', 30)]);
    select(result.current, [file('b', 25)]);
    complete(0, 0);
    select(result.current, [file('c', 25)]);
    select(result.current, [file('d', 20)]);
  });
  expect(mockUpload).toHaveBeenCalledTimes(2);
  act(() => complete(1, 0));
  expect(
    result.current.attachments.reduce((sum, item) => sum + (item.size ?? 0), 0),
  ).toBe(50 * MB);
});
test('releases the byte budget after failures, removal, retention and reset', () => {
  const { result } = renderHook(() => useMessageAttachments(false, true));
  act(() => {
    select(result.current, [file('failed', 50)]);
    complete(0, 0, 'error');
    select(result.current, [file('a', 30), file('b', 20)]);
    complete(1, 0);
    complete(1, 1);
  });
  act(() => result.current.removeAttachment('a'));
  act(() => select(result.current, [file('c', 30)]));
  act(() => complete(2, 0));
  act(() =>
    result.current.retainAttachments(
      result.current.attachments.filter((item) => item.url === 'c'),
    ),
  );
  act(() => select(result.current, [file('d', 20)]));
  act(() => result.current.resetAttachments());
  act(() => {
    complete(3, 0); // Ignore an old upload that completes after reset.
    select(result.current, [file('new', 50)]);
  });
  expect(mockUpload).toHaveBeenCalledTimes(5);
  expect(result.current.attachments).toHaveLength(0);
});
test.each([true, false])(
  'preserves other providers limits and imposes no Telegram aggregate limit (%s)',
  (discord) => {
    const { result } = renderHook(() => useMessageAttachments(discord));
    const limit = discord ? 10 : 20;
    act(() => select(result.current, [file('large', limit + 1)]));
    expect(mockUpload).not.toHaveBeenCalled();
    act(() =>
      select(
        result.current,
        Array.from({ length: 6 }, (_, i) => file(String(i), limit)),
      ),
    );
    expect(mockUpload).toHaveBeenCalledTimes(1);
  },
);
test('honors the shared uploader default when no upload size is configured', () => {
  jest.mocked(composerStorage.getItem).mockReturnValue(null);
  const { result } = renderHook(() => useMessageAttachments(false, true));
  act(() => select(result.current, [file('large', 21)]));
  expect(mockUpload).not.toHaveBeenCalled();
});
