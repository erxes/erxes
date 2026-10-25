/** @jest-environment jsdom */
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { randomUUID } from 'crypto';
import { createRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { toast } from 'erxes-ui';

import { AgentFileDropZone } from '../components/AgentFileDropZone';
import { Composer, type IComposerAttachHandle } from '../components/Composer';
import { uploadAgentsFile } from '../uploadAgentsFile';
import { initAgentI18n, readCommonLocale } from './support/agentI18n';

const i18n = initAgentI18n('en');
afterEach(async () => {
  await i18n.changeLanguage('en');
});

/**
 * Behaviour of dropping files anywhere on the Assistant panel, through the
 * real composer. Only the network upload and the toast surface are stubbed.
 */

jest.mock('../components/PageElementPicker', () => ({
  PageElementPicker: () => null,
}));
jest.mock('erxes-ui/lib', () => ({ cn: () => '' }), { virtual: true });
jest.mock('erxes-ui/hooks/use-upload-new', () => ({}), { virtual: true });
jest.mock(
  'erxes-ui',
  () => {
    const Wrapper = ({ children }: { children: ReactNode }): ReactNode =>
      children;
    return {
      // The platform's real file helpers, from erxes-ui source.
      formatBytes: jest.requireActual(
        '../../../../../libs/erxes-ui/src/components/upload-new',
      ).formatBytes,
      getFileIcon: jest.requireActual(
        '../../../../../libs/erxes-ui/src/components/upload-new',
      ).getFileIcon,
      cn: (...values: unknown[]) => values.filter(Boolean).join(' '),
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
        return <button {...props} />;
      },
      Tooltip: Object.assign(Wrapper, {
        Provider: Wrapper,
        Trigger: Wrapper,
        Content: () => null,
      }),
    };
  },
  { virtual: true },
);
jest.mock('../uploadAgentsFile', () => ({ uploadAgentsFile: jest.fn() }));

const upload = jest.mocked(uploadAgentsFile);
const notify = jest.mocked(toast);

beforeAll(() =>
  Object.defineProperty(crypto, 'randomUUID', {
    value: randomUUID,
    configurable: true,
  }),
);
beforeEach(() => {
  upload.mockReset();
  notify.mockReset();
  upload.mockImplementation(async (file) => ({
    name: file.name,
    url: `${file.name}-key`,
    type: file.type,
    size: file.size,
  }));
  URL.createObjectURL = jest.fn(() => 'blob:preview');
  URL.revokeObjectURL = jest.fn();
});

const fileDrag = (files: File[]) => ({
  types: ['Files'],
  files,
  items: files.map((file) => ({
    kind: 'file',
    type: file.type,
    getAsFile: () => file,
  })),
  dropEffect: 'none',
});
const textDrag = () => ({
  types: ['text/plain', 'text/uri-list'],
  files: [],
  items: [{ kind: 'string', type: 'text/plain' }],
  dropEffect: 'none',
});
const notes = () => new File(['notes'], 'notes.txt', { type: 'text/plain' });
const chart = () => new File(['png'], 'chart.png', { type: 'image/png' });

const setup = ({
  status = 'ready',
  disabled = false,
}: { status?: string; disabled?: boolean } = {}) => {
  const attachRef = createRef<IComposerAttachHandle>();
  const view = render(
    <AgentFileDropZone attachRef={attachRef}>
      <header data-testid="header">Tabs</header>
      <main data-testid="transcript">
        <p data-testid="message">Hello</p>
      </main>
      <Composer
        status={status}
        disabled={disabled}
        onSend={jest.fn()}
        onStop={jest.fn()}
        attachRef={attachRef}
      />
    </AgentFileDropZone>,
  );
  const overlayOpen = () =>
    screen
      .getByText(/^(Drop files to attach|Attachment limit reached)$/)
      .closest('[data-state]')
      ?.getAttribute('data-state') === 'open';
  const chips = () =>
    Array.from(
      screen
        .queryByRole('list', { name: 'Attachments' })
        ?.querySelectorAll('li') ?? [],
    ).map((item) => item.textContent ?? '');
  return { view, overlayOpen, chips };
};

it('opens a counted overlay over the whole panel and survives nested children', async () => {
  const { overlayOpen } = setup();
  const files = [notes(), chart()];
  expect(overlayOpen()).toBe(false);
  fireEvent.dragEnter(screen.getByTestId('header'), {
    dataTransfer: fileDrag(files),
  });
  await waitFor(() => expect(overlayOpen()).toBe(true));
  expect(screen.getByText('2 files')).toBeTruthy();
  expect(screen.getByRole('status').textContent).toBe(
    'Drop files to attach them to your message',
  );
  const over = fileDrag(files);
  fireEvent.dragOver(screen.getByTestId('message'), { dataTransfer: over });
  expect(over.dropEffect).toBe('copy');
  // Moving onto a child enters it before leaving the parent.
  fireEvent.dragEnter(screen.getByTestId('message'), {
    dataTransfer: fileDrag(files),
  });
  fireEvent.dragLeave(screen.getByTestId('header'), {
    dataTransfer: fileDrag(files),
  });
  await act(async () => undefined);
  expect(overlayOpen()).toBe(true);
  // Leaving the panel (or pressing Escape) ends with a final dragleave.
  fireEvent.dragLeave(screen.getByTestId('message'), {
    dataTransfer: fileDrag(files),
  });
  await waitFor(() => expect(overlayOpen()).toBe(false));
});

it('attaches files dropped anywhere on the panel to the composer', async () => {
  const { overlayOpen, chips } = setup();
  const target = screen.getByTestId('transcript');
  fireEvent.dragEnter(target, { dataTransfer: fileDrag([notes(), chart()]) });
  await waitFor(() => expect(overlayOpen()).toBe(true));
  fireEvent.drop(target, { dataTransfer: fileDrag([notes(), chart()]) });
  await waitFor(() => expect(chips()).toHaveLength(2));
  expect(chips()[0]).toContain('notes.txt');
  expect(chips()[1]).toContain('chart.png');
  expect(overlayOpen()).toBe(false);
});

it('leaves text and link drags to the browser', async () => {
  const { overlayOpen, chips } = setup();
  const message = screen.getByTestId('message');
  fireEvent.dragEnter(message, { dataTransfer: textDrag() });
  // Not cancelled, so selected text can still be dropped into the composer.
  expect(fireEvent.dragOver(message, { dataTransfer: textDrag() })).toBe(true);
  expect(fireEvent.drop(message, { dataTransfer: textDrag() })).toBe(true);
  await act(async () => undefined);
  expect(overlayOpen()).toBe(false);
  expect(chips()).toEqual([]);
});

it('ignores drags that start inside the page', async () => {
  const { overlayOpen, chips } = setup();
  const message = screen.getByTestId('message');
  act(() => {
    window.dispatchEvent(new Event('dragstart'));
  });
  fireEvent.dragEnter(message, { dataTransfer: fileDrag([chart()]) });
  fireEvent.drop(message, { dataTransfer: fileDrag([chart()]) });
  await act(async () => undefined);
  expect(overlayOpen()).toBe(false);
  expect(chips()).toEqual([]);
  act(() => {
    window.dispatchEvent(new Event('dragend'));
  });
  fireEvent.dragEnter(message, { dataTransfer: fileDrag([chart()]) });
  await waitFor(() => expect(overlayOpen()).toBe(true));
});

it.each([
  ['no connection', { disabled: true }],
  ['a streaming reply', { status: 'streaming' }],
])('stays closed and refuses drops with %s', async (_, props) => {
  const { overlayOpen, chips } = setup(props);
  const target = screen.getByTestId('transcript');
  fireEvent.dragEnter(target, { dataTransfer: fileDrag([notes()]) });
  const over = fileDrag([notes()]);
  // Still cancelled, so the browser never opens the file in the tab.
  expect(fireEvent.dragOver(target, { dataTransfer: over })).toBe(false);
  expect(over.dropEffect).toBe('none');
  fireEvent.drop(target, { dataTransfer: fileDrag([notes()]) });
  await act(async () => undefined);
  expect(overlayOpen()).toBe(false);
  expect(chips()).toEqual([]);
});

it('explains the limit when every slot is used', async () => {
  const { overlayOpen, chips } = setup();
  const target = screen.getByTestId('transcript');
  const five = ['1', '2', '3', '4', '5'].map(
    (name) => new File(['x'], `${name}.txt`, { type: 'text/plain' }),
  );
  fireEvent.drop(target, { dataTransfer: fileDrag(five) });
  await waitFor(() => expect(chips()).toHaveLength(5));
  fireEvent.dragEnter(target, { dataTransfer: fileDrag([notes()]) });
  await waitFor(() => expect(overlayOpen()).toBe(true));
  expect(screen.getByText('Attachment limit reached')).toBeTruthy();
  const over = fileDrag([notes()]);
  fireEvent.dragOver(target, { dataTransfer: over });
  expect(over.dropEffect).toBe('none');
});

it('reports unsupported and excess dropped files instead of attaching them', async () => {
  const { chips } = setup();
  const target = screen.getByTestId('transcript');
  const archive = new File(['zip'], 'archive.zip', { type: 'application/zip' });
  fireEvent.drop(target, { dataTransfer: fileDrag([archive, notes()]) });
  await waitFor(() => expect(chips()).toHaveLength(1));
  expect(chips()[0]).toContain('notes.txt');
  expect(notify).toHaveBeenCalledWith(
    expect.objectContaining({
      description: expect.stringContaining(
        "archive.zip isn't a supported type",
      ),
    }),
  );
});

it('shows the overlay and its status in Mongolian', async () => {
  const mn = readCommonLocale('mn').agent;
  await act(async () => {
    await i18n.changeLanguage('mn');
  });
  setup();
  fireEvent.dragEnter(screen.getByTestId('header'), {
    dataTransfer: fileDrag([notes(), chart()]),
  });
  await waitFor(() =>
    expect(screen.getByRole('status').textContent).toBe(mn['drop-status']),
  );
  expect(screen.getByText(String(mn['drop-title']))).toBeTruthy();
  expect(
    screen.getByText(i18n.t('agent.drop-file-count', { count: 2 })),
  ).toBeTruthy();
  expect(screen.queryByText('Drop files to attach')).toBeNull();
});
