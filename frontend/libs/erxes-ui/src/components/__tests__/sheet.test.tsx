/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { createPortal } from 'react-dom';
import { useState } from 'react';
import { Sheet } from '../sheet';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

const EditorHeader = () => (
  <Sheet.Header>
    <Sheet.Title>Editor</Sheet.Title>
    <Sheet.Close />
  </Sheet.Header>
);

it('keeps header actions scoped to their sheet, including shared headers rendered through a portal', () => {
  const portalTarget = document.createElement('div');
  document.body.append(portalTarget);
  const view = render(
    <Sheet headerActions={<button>Full size</button>}>
      {createPortal(<EditorHeader />, portalTarget)}
      <Sheet>
        <Sheet.Header>
          <Sheet.Title>Other panel</Sheet.Title>
        </Sheet.Header>
      </Sheet>
    </Sheet>,
  );
  const expand = screen.getByRole('button', { name: 'Full size' });
  const close = screen.getByRole('button', { name: 'Close' });
  expect(portalTarget.contains(expand)).toBe(true);
  expect(expand.parentElement).toBe(close.parentElement);
  expect(expand.nextElementSibling).toBe(close);
  expect(screen.getByText('Other panel').parentElement?.textContent).toBe(
    'Other panel',
  );
  view.unmount();
  portalTarget.remove();
});

it('does not add controls to sheets that do not opt in', () => {
  render(
    <Sheet>
      <EditorHeader />
    </Sheet>,
  );
  expect(screen.getAllByRole('button')).toHaveLength(1);
  expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
});

it('updates the provided control without remounting the editor or replacing Close', () => {
  const Editor = () => {
    const [expanded, setExpanded] = useState(false);
    return (
      <Sheet
        headerActions={
          <button onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Collapse' : 'Full size'}
          </button>
        }
      >
        <EditorHeader />
        <input aria-label="Draft" defaultValue="Unsaved text" />
      </Sheet>
    );
  };
  render(<Editor />);
  const field = screen.getByLabelText('Draft');
  const close = screen.getByRole('button', { name: 'Close' });
  fireEvent.click(screen.getByRole('button', { name: 'Full size' }));
  expect(screen.getByRole('button', { name: 'Collapse' })).toBeTruthy();
  expect(screen.getByLabelText('Draft')).toBe(field);
  expect(screen.getByRole('button', { name: 'Close' })).toBe(close);
});
