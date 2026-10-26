/** @jest-environment jsdom */
import { uploadAgentsFile } from '../uploadAgentsFile';

jest.mock(
  'erxes-ui',
  () => ({ REACT_APP_API_URL: 'http://api.test' }),
  { virtual: true },
);

const file = new File(['hello'], 'note.txt', { type: 'text/plain' });

afterEach(() => jest.restoreAllMocks());

it('posts the file to the platform upload endpoint', async () => {
  const fetchMock = jest.fn(async () => ({
    ok: true,
    status: 200,
    text: async () => 'note-key.txt',
  }));
  global.fetch = fetchMock as unknown as typeof fetch;

  await expect(uploadAgentsFile(file)).resolves.toEqual({
    name: 'note.txt',
    url: 'note-key.txt',
    type: 'text/plain',
    size: 5,
  });
  expect(fetchMock).toHaveBeenCalledWith(
    'http://api.test/upload-file?kind=main',
    expect.objectContaining({ method: 'POST', credentials: 'include' }),
  );
});

it('surfaces the platform error body', async () => {
  global.fetch = jest.fn(async () => ({
    ok: false,
    status: 400,
    text: async () => 'One or more files have unrecognized MIME type',
  })) as unknown as typeof fetch;

  await expect(uploadAgentsFile(file)).rejects.toThrow(
    'One or more files have unrecognized MIME type',
  );
});
