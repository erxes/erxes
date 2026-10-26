/** @jest-environment jsdom */
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { randomUUID } from 'crypto';
import { Composer } from '../components/Composer';
import { uploadAgentsFile } from '../uploadAgentsFile';
import type { IAgentsFileMeta } from '../agentsFiles';
import type { IPageElementPickerProps } from '../components/PageElementPicker';
jest.mock('../components/PageElementPicker', () => ({
  PageElementPicker: ({ onSelect, onCancel }: IPageElementPickerProps) => (
    <div>
      <button
        onClick={() =>
          onSelect({
            title: 'Revenue chart',
            path: '/sales',
            text: 'Revenue 42',
            width: 200,
            height: 100,
            image: new Blob(['png'], { type: 'image/png' }),
          })
        }
      >
        Capture sample
      </button>
      <button onClick={onCancel}>Cancel sample</button>
    </div>
  ),
}));

jest.mock(
  'erxes-ui',
  () => {
    const Wrapper = ({ children }: { children: ReactNode }): ReactNode =>
      children;

    return {
      toast: jest.fn(),
      Spinner: () => <span />,
      Button: ({
        variant: _variant,
        size: _size,
        ...props
      }: ButtonHTMLAttributes<HTMLButtonElement> & {
        variant?: string;
        size?: string;
      }) => {
        void _variant;
        void _size;
        return <button data-variant={_variant} {...props} />;
      },
      Tooltip: Object.assign(Wrapper, {
        Provider: Wrapper,
        Trigger: Wrapper,
        Content: ({ children }: { children: ReactNode }) => (
          <div role="tooltip">{children}</div>
        ),
      }),
    };
  },
  { virtual: true },
);
jest.mock('../uploadAgentsFile', () => ({
  uploadAgentsFile: jest.fn(),
}));

const upload = jest.mocked(uploadAgentsFile);
const meta = (name: string): IAgentsFileMeta => ({
  name,
  url: `${name}-key`,
  type: 'text/plain',
  size: 4,
});
const pick = (...names: string[]) =>
  fireEvent.change(screen.getByLabelText('Choose attachments'), {
    target: {
      files: names.map(
        (name) => new File(['test'], name, { type: 'text/plain' }),
      ),
    },
  });
const sendButton = () =>
  screen.getByRole('button', { name: 'Send message' }) as HTMLButtonElement;

beforeAll(() =>
  Object.defineProperty(crypto, 'randomUUID', {
    value: randomUUID,
    configurable: true,
  }),
);
beforeEach(() => {
  upload.mockReset();
  URL.createObjectURL = jest.fn(() => 'blob:selection');
  URL.revokeObjectURL = jest.fn();
});

it('uses matching neutral, background-free send and stop controls', () => {
  const onStop = jest.fn();
  const props = { disabled: false, onSend: jest.fn(), onStop };
  const { rerender } = render(<Composer {...props} status="ready" />);
  const send = sendButton();
  expect(send.getAttribute('data-variant')).toBe('ghost');
  expect(send.className).toContain('rounded-full');
  expect(send.className).toContain('bg-transparent');
  expect(send.className).toContain('hover:bg-transparent');
  expect(send.className).toContain('border-0');
  expect(send.className).toContain('text-foreground');
  rerender(<Composer {...props} status="streaming" />);
  const stop = screen.getByRole('button', { name: 'Stop generating' });
  expect(stop.getAttribute('data-variant')).toBe('ghost');
  expect(stop.className).toBe(send.className);
  fireEvent.click(stop);
  expect(onStop).toHaveBeenCalledTimes(1);
});

it('keeps attachment guidance in the tooltip and still opens the file picker', () => {
  render(
    <Composer
      status="ready"
      disabled={false}
      onSend={jest.fn()}
      onStop={jest.fn()}
    />,
  );

  const guidance = screen.getByText(/Up to 5 files, 10 MiB each/);
  expect(guidance.closest('[role="tooltip"]')).not.toBeNull();
  const inputClick = jest.spyOn(
    screen.getByLabelText('Choose attachments'),
    'click',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Attach files' }));
  expect(inputClick).toHaveBeenCalledTimes(1);
  inputClick.mockRestore();
});

it('lets successive batches finish without aborting earlier uploads', async () => {
  const complete: ((file: IAgentsFileMeta) => void)[] = [];
  upload.mockImplementation(
    () => new Promise((resolve) => complete.push(resolve)),
  );
  const onSend = jest.fn();
  render(
    <Composer
      status="ready"
      disabled={false}
      onSend={onSend}
      onStop={jest.fn()}
    />,
  );
  pick('first.txt');
  pick('second.txt');
  expect(upload.mock.calls[0][1]?.signal?.aborted).toBe(false);
  expect(sendButton().disabled).toBe(true);
  await act(async () => {
    complete[0](meta('first.txt'));
    complete[1](meta('second.txt'));
  });
  fireEvent.click(sendButton());
  expect(onSend).toHaveBeenCalledWith('Uploaded files', [
    meta('first.txt'),
    meta('second.txt'),
  ]);
});

it('rejects oversized readable text before uploading', () => {
  render(
    <Composer
      status="ready"
      disabled={false}
      onSend={jest.fn()}
      onStop={jest.fn()}
    />,
  );
  fireEvent.change(screen.getByLabelText('Choose attachments'), {
    target: {
      files: [
        new File(['x'.repeat(64 * 1024 + 1)], 'rows.csv', { type: 'text/csv' }),
      ],
    },
  });
  expect(upload).not.toHaveBeenCalled();
  expect(sendButton().disabled).toBe(true);
});

it('cancels just the removed file and ignores its late result', async () => {
  let complete: (file: IAgentsFileMeta) => void = () => undefined;
  upload.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  );
  upload.mockImplementationOnce(() => new Promise(() => undefined));
  render(
    <Composer
      status="ready"
      disabled={false}
      onSend={jest.fn()}
      onStop={jest.fn()}
    />,
  );
  pick('first.txt', 'second.txt');
  fireEvent.click(screen.getByRole('button', { name: 'Remove first.txt' }));
  expect(upload.mock.calls[0][1]?.signal?.aborted).toBe(true);
  await act(async () => complete(meta('first.txt')));
  expect(screen.queryByText('first.txt')).toBeNull();
});

it('aborts uploads on thread switch without restoring stale chips', async () => {
  let complete: (file: IAgentsFileMeta) => void = () => undefined;
  upload.mockImplementation(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  );
  const props = {
    status: 'ready',
    disabled: false,
    onSend: jest.fn(),
    onStop: jest.fn(),
  };
  const { rerender } = render(<Composer {...props} draftScope="first" />);
  pick('first.txt');
  rerender(<Composer {...props} draftScope="second" />);
  expect(upload.mock.calls[0][1]?.signal?.aborted).toBe(true);
  await act(async () => complete(meta('first.txt')));
  expect(screen.queryByText('first.txt')).toBeNull();
});

it('attaches a selection preview and sends its screenshot and visible context with the question', async () => {
  upload.mockImplementation(async (file) => ({
    name: file.name,
    url: file.name,
    type: file.type,
    size: file.size,
  }));
  const onSend = jest.fn();
  render(
    <Composer
      status="ready"
      disabled={false}
      onSend={onSend}
      onStop={jest.fn()}
    />,
  );
  fireEvent.change(screen.getByRole('textbox', { name: 'Message' }), {
    target: { value: 'Explain this chart' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Select on page' }));
  fireEvent.click(screen.getByRole('button', { name: 'Capture sample' }));
  await waitFor(() => expect(sendButton().disabled).toBe(false));
  expect(
    screen.getByRole('img', { name: 'Selected Revenue chart' }),
  ).toBeTruthy();
  expect(
    screen.getByRole('textbox', { name: 'Message' }).getAttribute('disabled'),
  ).toBeNull();
  fireEvent.click(sendButton());
  expect(upload).toHaveBeenCalledTimes(1);
  expect(upload.mock.calls[0][0].type).toBe('image/png');
  expect(onSend).toHaveBeenCalledWith(
    'Explain this chart',
    [],
    [
      expect.objectContaining({
        title: 'Revenue chart',
        path: '/sales',
        text: 'Revenue 42',
        snapshot: expect.objectContaining({ type: 'image/png' }),
      }),
    ],
  );
  expect(screen.queryByRole('img')).toBeNull();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:selection');
});

it('keeps failed selections in the draft with retry and aborts them when removed', async () => {
  upload.mockRejectedValueOnce(new Error('Offline'));
  render(
    <Composer
      status="ready"
      disabled={false}
      onSend={jest.fn()}
      onStop={jest.fn()}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Select on page' }));
  fireEvent.click(screen.getByRole('button', { name: 'Capture sample' }));
  await waitFor(() =>
    expect(screen.getByRole('alert').textContent).toContain('Offline'),
  );
  expect(sendButton().disabled).toBe(true);
  upload.mockImplementation(() => new Promise(() => undefined));
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  const signal = upload.mock.calls[1][1]?.signal;
  fireEvent.click(screen.getByRole('button', { name: 'Remove Revenue chart' }));
  expect(signal?.aborted).toBe(true);
  expect(screen.queryByRole('img')).toBeNull();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:selection');
});

it('keeps selection context separate from file slots and clears it on thread changes', async () => {
  upload.mockResolvedValue(meta('file.txt'));
  const props = {
    status: 'ready',
    disabled: false,
    onSend: jest.fn(),
    onStop: jest.fn(),
  };
  const { rerender } = render(<Composer {...props} draftScope="a" />);
  fireEvent.click(screen.getByRole('button', { name: 'Select on page' }));
  fireEvent.click(screen.getByRole('button', { name: 'Capture sample' }));
  await waitFor(() => expect(screen.getByText('Page selection')).toBeTruthy());
  pick('one.txt', 'two.txt', 'three.txt', 'four.txt', 'five.txt');
  await act(async () => {
    await Promise.resolve();
  });
  expect(
    (
      screen.getByRole('button', {
        name: 'Select on page',
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(false);
  rerender(<Composer {...props} draftScope="b" />);
  expect(screen.queryByRole('img')).toBeNull();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:selection');
  fireEvent.click(screen.getByRole('button', { name: 'Select on page' }));
  rerender(<Composer {...props} draftScope="c" />);
  expect(screen.queryByRole('button', { name: 'Capture sample' })).toBeNull();
});
