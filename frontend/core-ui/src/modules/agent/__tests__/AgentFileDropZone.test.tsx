/** @jest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';

import { AgentFileDropZone } from '../components/AgentFileDropZone';
import type { IComposerAttachHandle } from '../components/Composer';
import type { TAgentsAttachAvailability } from '../utils/fileDrag';

jest.mock(
  'erxes-ui',
  () => ({
    cn: (...values: unknown[]) => values.filter(Boolean).join(' '),
  }),
  { virtual: true },
);

const files = [
  new File(['a'], 'a.txt', { type: 'text/plain' }),
  new File(['b'], 'b.png', { type: 'image/png' }),
];
const fileTransfer = () => ({
  types: ['Files'],
  items: files.map(() => ({ kind: 'file' })),
  files,
  dropEffect: 'none',
});

const setup = (initial: TAgentsAttachAvailability = 'ready') => {
  let availability = initial;
  const attachFiles = jest.fn();
  const attachRef = createRef<IComposerAttachHandle>();
  (attachRef as { current: IComposerAttachHandle }).current = {
    availability: () => availability,
    attachFiles,
  };
  render(
    <AgentFileDropZone attachRef={attachRef}>
      <header data-testid="header">Tabs</header>
      <main data-testid="transcript">
        <p data-testid="message">Hello</p>
      </main>
    </AgentFileDropZone>,
  );
  const overlay = () =>
    screen.getByText(/Drop files to attach$|Attachment limit reached/)
      .parentElement?.parentElement as HTMLElement;
  return {
    attachFiles,
    overlay,
    setAvailability: (next: TAgentsAttachAvailability) => {
      availability = next;
    },
  };
};

it('opens once for a file drag and stays open across nested children', () => {
  const { overlay } = setup();
  expect(overlay().getAttribute('data-state')).toBe('closed');
  fireEvent.dragEnter(screen.getByTestId('header'), {
    dataTransfer: fileTransfer(),
  });
  expect(overlay().getAttribute('data-state')).toBe('open');
  expect(screen.getByText('2 files')).toBeTruthy();
  fireEvent.dragEnter(screen.getByTestId('message'), {
    dataTransfer: fileTransfer(),
  });
  fireEvent.dragLeave(screen.getByTestId('header'), {
    dataTransfer: fileTransfer(),
  });
  expect(overlay().getAttribute('data-state')).toBe('open');
  fireEvent.dragLeave(screen.getByTestId('message'), {
    dataTransfer: fileTransfer(),
  });
  expect(overlay().getAttribute('data-state')).toBe('closed');
});

it('attaches dropped files anywhere in the panel and closes', () => {
  const { attachFiles, overlay } = setup();
  const target = screen.getByTestId('transcript');
  fireEvent.dragEnter(target, { dataTransfer: fileTransfer() });
  const over = fileTransfer();
  fireEvent.dragOver(target, { dataTransfer: over });
  expect(over.dropEffect).toBe('copy');
  fireEvent.drop(target, { dataTransfer: fileTransfer() });
  expect(attachFiles).toHaveBeenCalledWith(files);
  expect(overlay().getAttribute('data-state')).toBe('closed');
});

it('ignores text and link drags', () => {
  const { attachFiles, overlay } = setup();
  const text = { types: ['text/plain', 'text/uri-list'], files: [] };
  fireEvent.dragEnter(screen.getByTestId('message'), { dataTransfer: text });
  expect(overlay().getAttribute('data-state')).toBe('closed');
  fireEvent.drop(screen.getByTestId('message'), { dataTransfer: text });
  expect(attachFiles).not.toHaveBeenCalled();
});

it('ignores drags that started inside the page', () => {
  const { attachFiles, overlay } = setup();
  act(() => {
    window.dispatchEvent(new Event('dragstart'));
  });
  fireEvent.dragEnter(screen.getByTestId('message'), {
    dataTransfer: fileTransfer(),
  });
  expect(overlay().getAttribute('data-state')).toBe('closed');
  fireEvent.drop(screen.getByTestId('message'), {
    dataTransfer: fileTransfer(),
  });
  expect(attachFiles).not.toHaveBeenCalled();
  act(() => {
    window.dispatchEvent(new Event('dragend'));
  });
  fireEvent.dragEnter(screen.getByTestId('message'), {
    dataTransfer: fileTransfer(),
  });
  expect(overlay().getAttribute('data-state')).toBe('open');
});

it('stays hidden and refuses drops while the composer is disabled', () => {
  const { attachFiles, overlay } = setup('disabled');
  const target = screen.getByTestId('transcript');
  fireEvent.dragEnter(target, { dataTransfer: fileTransfer() });
  expect(overlay().getAttribute('data-state')).toBe('closed');
  const over = fileTransfer();
  const event = fireEvent.dragOver(target, { dataTransfer: over });
  // Cancelled so the browser never opens the file instead.
  expect(event).toBe(false);
  expect(over.dropEffect).toBe('none');
  fireEvent.drop(target, { dataTransfer: fileTransfer() });
  expect(attachFiles).not.toHaveBeenCalled();
});

it('explains the limit when every slot is used and resets on window drop', () => {
  const { overlay, setAvailability } = setup('full');
  fireEvent.dragEnter(screen.getByTestId('header'), {
    dataTransfer: fileTransfer(),
  });
  expect(screen.getByText('Attachment limit reached')).toBeTruthy();
  expect(overlay().getAttribute('data-state')).toBe('open');
  setAvailability('disabled');
  fireEvent.dragOver(screen.getByTestId('header'), {
    dataTransfer: fileTransfer(),
  });
  expect(overlay().getAttribute('data-state')).toBe('closed');
  setAvailability('ready');
  fireEvent.dragOver(screen.getByTestId('header'), {
    dataTransfer: fileTransfer(),
  });
  expect(overlay().getAttribute('data-state')).toBe('open');
  act(() => {
    window.dispatchEvent(new Event('drop'));
  });
  expect(overlay().getAttribute('data-state')).toBe('closed');
});
