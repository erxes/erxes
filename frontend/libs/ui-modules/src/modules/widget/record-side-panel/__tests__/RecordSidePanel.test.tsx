/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
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

const pointer = (target: Element | Document, type: string, clientX = 0) =>
  fireEvent(
    target,
    new MouseEvent(type, { bubbles: true, clientX, button: 0 }),
  );

it('drags beyond the record limit when configured and clamps both width limits', () => {
  render(<Panel maxWidth={1200} />);
  const grip = screen.getByRole('separator', { name: 'Resize side panel' });
  const panel = screen.getByText('Chat');
  pointer(grip, 'pointerdown', 1000);
  pointer(document, 'pointermove', 400);
  expect(panel.style.width).toBe('1000px');
  pointer(document, 'pointermove', 0);
  expect(panel.style.width).toBe('1200px');
  pointer(document, 'pointermove', 2000);
  expect(panel.style.width).toBe('320px');
  pointer(document, 'pointerup');
  expect(document.body.style.cursor).toBe('');
  pointer(document, 'pointermove', 0);
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
  expect(screen.getByText('Chat').style.width).toBe('400px');
  pointer(grip, 'pointerdown', 800);
  unmount();
  expect(document.body.style.cursor).toBe('');
  expect(document.body.style.userSelect).toBe('');
});
