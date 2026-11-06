/** @jest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { useProductMediaCleanup } from '../useProductMediaCleanup';

const mockRemove = jest.fn(
  async (_name: string, callback: (status: string) => void) => callback('ok'),
);
const mockToast = jest.fn();
jest.mock('erxes-ui', () => ({
  useRemoveFile: () => ({ removeFile: mockRemove }),
  toast: (...args: unknown[]) => mockToast(...args),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));
jest.mock('ui-modules', () => ({
  toProductAttachmentList: jest.requireActual(
    'ui-modules/modules/products/components/ProductImageUploads',
  ).toProductAttachmentList,
}));
const image = { url: 'image-1', name: 'image-1', type: 'image/png', size: 10 };
beforeEach(() => {
  mockRemove
    .mockReset()
    .mockImplementation(
      async (_name: string, callback: (status: string) => void) =>
        callback('ok'),
    );
  mockToast.mockClear();
});

it('keeps media that is still referenced in another saved product field', async () => {
  const { result } = renderHook(() => useProductMediaCleanup());
  await result.current({ attachment: image }, { attachmentMore: [image] });
  await result.current({ attachment: image }, { files: [image] });
  expect(mockRemove).not.toHaveBeenCalled();
});

it('deletes each unreferenced storage file once and leaves embedded links alone', async () => {
  const { result } = renderHook(() => useProductMediaCleanup());
  await result.current(
    {
      attachment: image,
      attachmentMore: [image],
      videos: [
        {
          ...image,
          url: 'https://youtube.com/watch?v=1',
          name: 'embed',
          type: 'embed',
        },
      ],
    },
    {},
  );
  expect(mockRemove).toHaveBeenCalledTimes(1);
  expect(mockRemove).toHaveBeenCalledWith(image.name, expect.any(Function));
});

it.each(['server', 'network'])(
  'reports %s cleanup failures after save without rejecting the saved product',
  async (failure) => {
    mockRemove.mockImplementationOnce(
      async (_name: string, callback: (status: string) => void) => {
        if (failure === 'network') throw new Error('Offline');
        callback('Deletion failed');
      },
    );
    const { result } = renderHook(() => useProductMediaCleanup());
    await expect(
      result.current({ attachment: image }, {}),
    ).resolves.toBeUndefined();
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'destructive',
        description: image.name,
      }),
    );
  },
);
