/** @jest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { RecordSidePanel } from '../RecordSidePanel';

jest.mock('erxes-ui', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

const Panel = ({ maxWidth }: { maxWidth?: number }) => {
  const [width, setWidth] = useState(400);
  return (
    <RecordSidePanel width={width} maxWidth={maxWidth} onWidthChange={setWidth}>
      Chat
    </RecordSidePanel>
  );
};

let frames: Map<number, FrameRequestCallback>;
let nextFrame = 0;
beforeEach(() => {
  frames = new Map();
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    const id = ++nextFrame;
    frames.set(id, callback);
    return id;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    frames.delete(id);
  });
});
afterEach(() => jest.restoreAllMocks());
const paint = () =>
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(0));
  });
const pointer = (
  target: Element | Document,
  type: string,
  clientX = 0,
  options: { pointerId?: number; buttons?: number; button?: number } = {},
) => {
  const event = new MouseEvent(type, {
    bubbles: true,
    clientX,
    button: options.button ?? 0,
    buttons: options.buttons ?? (type === 'pointerup' ? 0 : 1),
  });
  Object.defineProperty(event, 'pointerId', { value: options.pointerId ?? 1 });
  fireEvent(target, event);
};

it('drags beyond the record limit when configured and clamps both width limits', () => {
  render(<Panel maxWidth={1200} />);
  const grip = screen.getByRole('separator', { name: 'Resize side panel' });
  const panel = screen.getByText('Chat');
  pointer(grip, 'pointerdown', 1000);
  pointer(document, 'pointermove', 400);
  paint();
  expect(panel.style.width).toBe('1000px');
  pointer(document, 'pointermove', 0);
  paint();
  expect(panel.style.width).toBe('1200px');
  pointer(document, 'pointermove', 2000);
  paint();
  expect(panel.style.width).toBe('320px');
  pointer(document, 'pointerup');
  expect(document.body.style.cursor).toBe('');
  pointer(document, 'pointermove', 0);
  paint();
  expect(panel.style.width).toBe('320px');
});

it('keeps the default record limit and supports keyboard resizing', () => {
  render(<Panel />);
  const grip = screen.getByRole('separator');
  fireEvent.keyDown(grip, { key: 'ArrowLeft' });
  expect(grip.getAttribute('aria-valuenow')).toBe('416');
  fireEvent.keyDown(grip, { key: 'ArrowRight', shiftKey: true });
  expect(grip.getAttribute('aria-valuenow')).toBe('352');
  fireEvent.keyDown(grip, { key: 'End' });
  expect(grip.getAttribute('aria-valuenow')).toBe('600');
  pointer(grip, 'pointerdown', 800);
  pointer(document, 'pointermove', 0);
  paint();
  expect(screen.getByText('Chat').style.width).toBe('600px');
  pointer(document, 'pointerup');
  fireEvent.keyDown(grip, { key: 'Home' });
  expect(grip.getAttribute('aria-valuenow')).toBe('320');
});

it('restores the cursor and removes drag listeners on cancellation and unmount', () => {
  const { unmount } = render(<Panel maxWidth={1200} />);
  const grip = screen.getByRole('separator');
  pointer(grip, 'pointerdown', 800);
  expect(document.body.style.cursor).toBe('col-resize');
  pointer(document, 'pointercancel');
  expect(document.body.style.cursor).toBe('');
  pointer(document, 'pointermove', 0);
  paint();
  expect(screen.getByText('Chat').style.width).toBe('400px');
  pointer(grip, 'pointerdown', 800);
  unmount();
  expect(document.body.style.cursor).toBe('');
  expect(document.body.style.userSelect).toBe('');
});

it('captures the initiating pointer, batches paints and persists only the final width', () => {
  const onWidthChange = jest.fn();
  render(
    <RecordSidePanel width={400} maxWidth={1200} onWidthChange={onWidthChange}>
      Chat
    </RecordSidePanel>,
  );
  const grip = screen.getByRole('separator');
  const capture = jest.fn();
  const release = jest.fn();
  grip.setPointerCapture = capture;
  grip.hasPointerCapture = () => true;
  grip.releasePointerCapture = release;
  pointer(grip, 'pointerdown', 1000);
  expect(capture).toHaveBeenCalledWith(1);
  expect(
    document.querySelector('[data-side-panel-resize-shield]'),
  ).not.toBeNull();
  pointer(document, 'pointermove', 800, { pointerId: 2 });
  pointer(document, 'pointerup', 800, { pointerId: 2 });
  paint();
  expect(screen.getByText('Chat').style.width).toBe('400px');
  pointer(document, 'pointermove', 900);
  pointer(document, 'pointermove', 800);
  expect(frames.size).toBe(1);
  expect(onWidthChange).not.toHaveBeenCalled();
  paint();
  expect(screen.getByText('Chat').style.width).toBe('600px');
  pointer(document, 'pointermove', 700);
  pointer(document, 'pointerup', 700);
  expect(onWidthChange.mock.calls).toEqual([[700]]);
  expect(release).toHaveBeenCalledWith(1);
  expect(frames.size).toBe(0);
  expect(document.querySelector('[data-side-panel-resize-shield]')).toBeNull();
});

it.each([
  'missing button',
  'lost capture',
  'blur',
  'Escape',
  'hidden document',
])('ends a drag on %s and never resumes on hover', (reason) => {
  render(<Panel maxWidth={1200} />);
  const grip = screen.getByRole('separator');
  pointer(grip, 'pointerdown', 1000);
  pointer(document, 'pointermove', 800);
  // Cleanup must flush this pending final width before removing the drag.
  if (reason === 'missing button')
    pointer(document, 'pointermove', 0, { buttons: 0 });
  if (reason === 'lost capture') pointer(grip, 'lostpointercapture');
  if (reason === 'blur') fireEvent(window, new Event('blur'));
  if (reason === 'Escape') fireEvent.keyDown(document, { key: 'Escape' });
  if (reason === 'hidden document') {
    const visibility = jest
      .spyOn(document, 'visibilityState', 'get')
      .mockReturnValue('hidden');
    fireEvent(document, new Event('visibilitychange'));
    visibility.mockRestore();
  }
  expect(document.body.style.cursor).toBe('');
  expect(document.querySelector('[data-side-panel-resize-shield]')).toBeNull();
  pointer(document, 'pointermove', 0);
  paint();
  expect(screen.getByText('Chat').style.width).toBe('600px');
});

it('does not start on right click or resize just by hovering', () => {
  render(<Panel />);
  const grip = screen.getByRole('separator');
  pointer(document, 'pointermove', 100);
  pointer(grip, 'pointerdown', 800, { button: 2, buttons: 2 });
  pointer(document, 'pointermove', 100);
  paint();
  expect(screen.getByText('Chat').style.width).toBe('400px');
  expect(document.querySelector('[data-side-panel-resize-shield]')).toBeNull();
});
