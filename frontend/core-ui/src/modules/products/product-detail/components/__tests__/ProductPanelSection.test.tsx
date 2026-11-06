/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { IconPaperclip } from '@tabler/icons-react';
import { ProductPanelSection } from '../ProductPanelSection';

jest.mock('erxes-ui/components', () => ({
  Button: jest.requireActual('erxes-ui/components/button').Button,
}));

jest.mock('erxes-ui', () => ({
  Button: jest.requireActual('erxes-ui/components/button').Button,
  Collapsible: jest.requireActual('erxes-ui/components/collapsible')
    .Collapsible,
}));

it('lets a read-only user expand a section while its editing controls stay disabled', () => {
  render(
    <ProductPanelSection title="Files" icon={IconPaperclip} disabled>
      <input aria-label="File name" />
      <button type="button">Upload file</button>
    </ProductPanelSection>,
  );
  const trigger = screen.getByRole('button', { name: 'Files' });
  expect(trigger.matches(':disabled')).toBe(false);
  fireEvent.click(trigger);
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(
    screen.getByRole('textbox', { name: 'File name' }).matches(':disabled'),
  ).toBe(true);
  expect(
    screen.getByRole('button', { name: 'Upload file' }).matches(':disabled'),
  ).toBe(true);
});

it('preserves an unfinished edit when its section is collapsed and reopened', () => {
  render(
    <ProductPanelSection title="Files" icon={IconPaperclip}>
      <input aria-label="File name" defaultValue="Saved" />
    </ProductPanelSection>,
  );
  const trigger = screen.getByRole('button', { name: 'Files' });
  fireEvent.click(trigger);
  fireEvent.change(screen.getByRole('textbox', { name: 'File name' }), {
    target: { value: 'Unsaved' },
  });
  fireEvent.click(trigger);
  fireEvent.click(trigger);
  expect(
    (screen.getByRole('textbox', { name: 'File name' }) as HTMLInputElement)
      .value,
  ).toBe('Unsaved');
});
