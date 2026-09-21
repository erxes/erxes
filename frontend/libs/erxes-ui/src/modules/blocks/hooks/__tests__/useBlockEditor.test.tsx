import { renderHook } from '@testing-library/react';
import { useBlockEditor } from '../useBlockEditor';

jest.mock('@blocknote/react', () => ({
  useCreateBlockNote: (options: unknown) => options,
}));

jest.mock('../../constant', () => ({
  BLOCK_SCHEMA: {},
  TABLE_SCHEMA: {},
}));

jest.mock('../../../../utils/core', () => ({
  readImage: (url: string) => url,
}));

jest.mock('erxes-ui/utils', () => ({
  REACT_APP_API_URL: 'https://api.example.test',
}));

const originalFetch = global.fetch;
const mockFetch = jest.fn();

beforeEach(() => {
  mockFetch.mockReset();
  global.fetch = mockFetch;
});

afterEach(() => {
  global.fetch = originalFetch;
});

const response = (url: string, ok = true) => ({
  ok,
  text: () => Promise.resolve(url),
});

const getEditorUpload = (args?: Parameters<typeof useBlockEditor>[0]) => {
  const { result } = renderHook(() => useBlockEditor(args));
  const uploadFile = result.current.uploadFile;
  if (!uploadFile) throw new Error('Editor upload handler is missing');
  return uploadFile;
};

describe('editor uploads', () => {
  it('keeps concurrent uploads associated with their own files', async () => {
    let resolveFirst: (value: ReturnType<typeof response>) => void = () => {
      throw new Error('The first upload has not started');
    };
    mockFetch
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockResolvedValueOnce(response('second-image.png'));
    const upload = getEditorUpload();
    const firstFile = new File(['first'], 'first.png', { type: 'image/png' });
    const secondFile = new File(['second'], 'second.png', {
      type: 'image/png',
    });

    const first = upload(firstFile);
    const second = upload(secondFile);

    await expect(second).resolves.toBe('second-image.png');
    resolveFirst(response('first-image.png'));
    await expect(first).resolves.toBe('first-image.png');
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[0][1].body.get('file')).toBe(firstFile);
    expect(mockFetch.mock.calls[1][1].body.get('file')).toBe(secondFile);
    expect(mockFetch.mock.calls[0][1].credentials).toBe('include');
  });

  it('rejects failed uploads and allows the next upload to succeed', async () => {
    mockFetch
      .mockResolvedValueOnce(response('Upload rejected', false))
      .mockRejectedValueOnce(new Error('Network unavailable'))
      .mockResolvedValueOnce(response('retry.png'));
    const upload = getEditorUpload();
    const file = new File(['image'], 'image.png', { type: 'image/png' });

    await expect(upload(file)).rejects.toThrow('Upload rejected');
    await expect(upload(file)).rejects.toThrow('Network unavailable');
    await expect(upload(file)).resolves.toBe('retry.png');
  });

  it('preserves a caller-provided upload handler', async () => {
    const uploadFile = jest.fn().mockResolvedValue('custom.png');
    const upload = getEditorUpload({ uploadFile });
    const file = new File(['image'], 'image.png', { type: 'image/png' });

    await expect(upload(file)).resolves.toBe('custom.png');
    expect(uploadFile).toHaveBeenCalledWith(file);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
