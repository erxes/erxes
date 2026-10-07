/** @jest-environment jsdom */
import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ToolbarToggle } from '../ToolbarToggle';

jest.mock('erxes-ui/components', () =>
  jest.requireActual('erxes-ui/components/toggle'),
);
jest.mock('erxes-ui/lib', () => jest.requireActual('erxes-ui/lib/utils'));

it('reports selected state immediately and keeps the forwarded ref and disabled behavior', () => {
  const onPressedChange = jest.fn();
  const ref = createRef<HTMLButtonElement>();
  const { rerender } = render(
    <ToolbarToggle
      ref={ref}
      aria-label="Bold"
      onPressedChange={onPressedChange}
    />,
  );
  const bold = screen.getByRole('button', { name: 'Bold' });
  expect(ref.current).toBe(bold);
  expect(bold.getAttribute('aria-pressed')).toBe('false');

  fireEvent.click(bold);
  expect(bold.getAttribute('aria-pressed')).toBe('true');
  expect(bold.getAttribute('data-state')).toBe('on');
  expect(onPressedChange).toHaveBeenLastCalledWith(true);

  fireEvent.click(bold);
  expect(bold.getAttribute('aria-pressed')).toBe('false');
  expect(bold.getAttribute('data-state')).toBe('off');

  rerender(
    <ToolbarToggle
      ref={ref}
      aria-label="Bold"
      disabled
      onPressedChange={onPressedChange}
    />,
  );
  onPressedChange.mockClear();
  fireEvent.click(bold);
  expect(onPressedChange).not.toHaveBeenCalled();
});
