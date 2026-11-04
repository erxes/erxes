import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import type { PropsWithChildren } from 'react';
import { AttachmentUploader } from '../AttachmentUploader';
import type { IAttachment } from '@/ticket/types/attachments';

const mockUploadFile = jest.fn();
const mockUpdateTicket = jest.fn();
const mockToast = jest.fn();
const mockConfirm = jest.fn(() => Promise.resolve());

type TestFile = File & { errors: string[]; preview: string };

jest.mock('@/ticket/hooks/useUpdateTicket', () => ({
  useUpdateTicket: () => ({ updateTicket: mockUpdateTicket, loading: false }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('ui-modules', () => ({
  currentUserState: jest
    .requireActual<typeof import('jotai')>('jotai')
    .atom({ _id: 'uploader-user' }),
}));
jest.mock('erxes-ui', () => {
  const { useState } = jest.requireActual<typeof import('react')>('react');
  return {
    cn: () => '',
    isDeeplyEqual: jest.requireActual('deep-equal'),
    useConfirm: () => ({ confirm: mockConfirm }),
    useToast: () => ({ toast: mockToast }),
    useErxesUpload: () => {
      const [files, setFiles] = useState<TestFile[]>([]);
      return {
        files,
        setFiles,
        setErrors: jest.fn(),
        uploadFile: mockUploadFile,
      };
    },
    Dropzone: ({
      setFiles,
      onUpload,
      loading,
    }: {
      setFiles: (files: TestFile[]) => void;
      onUpload: () => void;
      loading: boolean;
    }) => (
      <div>
        <input
          aria-label="Select files"
          type="file"
          multiple
          disabled={loading}
          onChange={(event) => {
            setFiles(
              Array.from(event.target.files || []).map((file) =>
                Object.assign(file, { errors: [], preview: '' }),
              ),
            );
          }}
        />
        <button type="button" disabled={loading} onClick={onUpload}>
          Retry upload
        </button>
      </div>
    ),
    DropzoneContent: () => null,
    DropzoneEmptyState: () => null,
    Attachments: {
      Root: ({
        children,
        initialAttachments,
        onRemove,
        confirmRemove,
        isLoading,
      }: PropsWithChildren<{
        initialAttachments: IAttachment[];
        onRemove: (
          attachment: IAttachment,
          remaining: IAttachment[],
        ) => Promise<boolean>;
        confirmRemove: (attachment: IAttachment) => Promise<boolean>;
        isLoading: boolean;
      }>) => (
        <div>
          {children}
          {initialAttachments.map((attachment) => (
            <button
              key={attachment.url}
              disabled={isLoading}
              onClick={async () => {
                if (await confirmRemove(attachment))
                  await onRemove(
                    attachment,
                    initialAttachments.filter(
                      (item) => item.url !== attachment.url,
                    ),
                  );
              }}
            >
              Remove {attachment.name}
            </button>
          ))}
        </div>
      ),
      Files: () => null,
      Preview: () => null,
      Video: () => null,
      Audio: () => null,
    },
  };
});

const attachmentA = {
  name: 'A',
  url: 'stored-a',
  type: 'application/pdf',
  size: 1,
};
const selectFile = (name: string) =>
  fireEvent.change(screen.getByLabelText('Select files'), {
    target: { files: [new File([name], name, { type: 'application/pdf' })] },
  });

beforeEach(() => {
  jest.clearAllMocks();
  mockUpdateTicket.mockImplementation(({ variables }) =>
    Promise.resolve({
      data: {
        updateTicket: { _id: 'ticket-1', attachments: variables.attachments },
      },
    }),
  );
});

it('keeps the ticket busy across remount and removes A without losing B after its upload finishes', async () => {
  let completeUpload: (value: { url: string }) => void = () => undefined;
  mockUploadFile.mockImplementation(
    () =>
      new Promise((resolve) => {
        completeUpload = resolve;
      }),
  );
  const store = createStore();
  const view = () => (
    <Provider store={store}>
      <AttachmentUploader id="ticket-1" attachments={[attachmentA]} />
    </Provider>
  );
  const first = render(view());
  selectFile('B');
  await waitFor(() => expect(mockUploadFile).toHaveBeenCalledTimes(1));
  first.unmount();
  render(view());
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Remove A' })
      .disabled,
  ).toBe(true);
  await act(() => Promise.resolve(completeUpload({ url: 'stored-b' })));
  await waitFor(() =>
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Remove A' })
        .disabled,
    ).toBe(false),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Remove A' }));
  await waitFor(() => expect(mockUpdateTicket).toHaveBeenCalledTimes(2));
  expect(mockUpdateTicket.mock.calls[1][0].variables.attachments).toEqual([
    { name: 'B', url: 'stored-b', type: 'application/pdf', size: 1 },
  ]);
});

it('keeps a removal busy across remount and appends B without restoring removed A', async () => {
  let completeRemoval: (value: object) => void = () => undefined;
  mockUpdateTicket.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        completeRemoval = resolve;
      }),
  );
  mockUploadFile.mockResolvedValue({ url: 'stored-b' });
  const store = createStore();
  const view = () => (
    <Provider store={store}>
      <AttachmentUploader id="ticket-1" attachments={[attachmentA]} />
    </Provider>
  );
  const first = render(view());
  fireEvent.click(screen.getByRole('button', { name: 'Remove A' }));
  await waitFor(() => expect(mockUpdateTicket).toHaveBeenCalledTimes(1));
  first.unmount();
  render(view());
  expect(screen.getByLabelText<HTMLInputElement>('Select files').disabled).toBe(
    true,
  );
  await act(() =>
    Promise.resolve(
      completeRemoval({
        data: { updateTicket: { _id: 'ticket-1', attachments: [] } },
      }),
    ),
  );
  await waitFor(() =>
    expect(
      screen.getByLabelText<HTMLInputElement>('Select files').disabled,
    ).toBe(false),
  );
  selectFile('B');
  await waitFor(() => expect(mockUpdateTicket).toHaveBeenCalledTimes(2));
  expect(mockUpdateTicket.mock.calls[1][0].variables.attachments).toEqual([
    { name: 'B', url: 'stored-b', type: 'application/pdf', size: 1 },
  ]);
});

it('releases busy state after failed upload and retries the selected files explicitly', async () => {
  mockUploadFile
    .mockRejectedValueOnce(new Error('Upload unavailable'))
    .mockResolvedValueOnce({ url: 'stored-b' });
  render(
    <Provider>
      <AttachmentUploader id="ticket-retry" attachments={[]} />
    </Provider>,
  );
  selectFile('B');
  await waitFor(() =>
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' }),
    ),
  );
  expect(mockUpdateTicket).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Retry upload' }));
  await waitFor(() => expect(mockUpdateTicket).toHaveBeenCalledTimes(1));
  expect(mockUpdateTicket.mock.calls[0][0].variables.attachments).toEqual([
    { name: 'B', url: 'stored-b', type: 'application/pdf', size: 1 },
  ]);
});
