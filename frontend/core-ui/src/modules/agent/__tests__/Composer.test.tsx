/** @jest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { randomUUID } from 'crypto';
import { Composer } from '../components/Composer';
import { uploadAgentsFile } from '../uploadAgentsFile';
import type { IAgentsFileMeta } from '../agentsFiles';

jest.mock(
  'erxes-ui',
  () => {
    const Wrapper = ({ children }: { children: ReactNode }): ReactNode =>
      children;

    return {
      toast: jest.fn(),
      Button: ({
        variant: _variant,
        size: _size,
        ...props
      }: ButtonHTMLAttributes<HTMLButtonElement> & {
        variant?: string;
        size?: string;
      }) => <button {...props} />,
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
beforeEach(() => upload.mockReset());

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
