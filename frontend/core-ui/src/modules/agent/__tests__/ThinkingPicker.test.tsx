/** @jest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { MutableRefObject, Ref } from 'react';

import {
  ThinkingPicker,
  type IThinkingPickerProps,
} from '../components/ThinkingPicker';

// Use the real erxes-ui/CMDK/Radix controls so keyboard selection is covered.
// The installed merge-refs package is ESM-only; Jest runs these controls in CJS.
jest.mock('react-merge-refs', () => ({
  mergeRefs:
    <T,>(refs: Ref<T>[]) =>
    (node: T | null) => {
      for (const ref of refs) {
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as MutableRefObject<T | null>).current = node;
      }
    },
}));
jest.mock('erxes-ui', () => ({
  ...jest.requireActual('../../../../../libs/erxes-ui/src/components/button'),
  ...jest.requireActual('../../../../../libs/erxes-ui/src/components/combobox'),
  ...jest.requireActual('../../../../../libs/erxes-ui/src/components/command'),
  ...jest.requireActual('../../../../../libs/erxes-ui/src/components/popover'),
}));
jest.mock('erxes-ui/lib', () =>
  jest.requireActual('../../../../../libs/erxes-ui/src/lib/utils'),
);
jest.mock('erxes-ui/lib/utils', () =>
  jest.requireActual('../../../../../libs/erxes-ui/src/lib/utils'),
);

const originalObserver = global.ResizeObserver;
const originalScroll = HTMLElement.prototype.scrollIntoView;
beforeAll(() => {
  global.ResizeObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
  HTMLElement.prototype.scrollIntoView = jest.fn();
});
afterAll(() => {
  global.ResizeObserver = originalObserver;
  HTMLElement.prototype.scrollIntoView = originalScroll;
});

const setup = (overrides: Partial<IThinkingPickerProps> = {}) => {
  const onChange = jest.fn();
  render(<ThinkingPicker value="high" onChange={onChange} {...overrides} />);
  return { onChange };
};

it('shows only the level name and an accessible thinking label', () => {
  setup();
  const trigger = screen.getByRole('combobox', {
    name: 'Thinking level: High',
  });

  expect(trigger.textContent).toContain('High');
  expect(trigger.textContent).not.toContain('Thinking:');
  expect(screen.queryByText('Thinking: high')).toBeNull();
});

it('lists every level with a description and keeps the value contract', async () => {
  const { onChange } = setup();

  fireEvent.click(
    screen.getByRole('combobox', { name: 'Thinking level: High' }),
  );
  expect(screen.getByText('Thinking')).toBeTruthy();
  expect(screen.getByText('Fastest, no reasoning')).toBeTruthy();
  expect(screen.getByText('A brief pass before answering')).toBeTruthy();
  expect(screen.getByText('Light reasoning, still quick')).toBeTruthy();
  expect(screen.getByText('Balanced depth and speed')).toBeTruthy();
  expect(screen.getByText('Deepest reasoning, slower')).toBeTruthy();
  await waitFor(() =>
    expect(
      screen
        .getByRole('option', { name: /Deepest reasoning, slower/ })
        .getAttribute('aria-selected'),
    ).toBe('true'),
  );

  fireEvent.click(
    screen.getByRole('option', { name: /Light reasoning, still quick/ }),
  );
  expect(onChange).toHaveBeenCalledWith('low');
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

it('selects a level from the keyboard', async () => {
  const { onChange } = setup();

  fireEvent.click(
    screen.getByRole('combobox', { name: 'Thinking level: High' }),
  );
  const menu = document.activeElement;
  if (!menu) throw new Error('Thinking menu was not focused');
  expect(menu.hasAttribute('cmdk-root')).toBe(true);
  fireEvent.keyDown(menu, { key: 'ArrowUp' });
  fireEvent.keyDown(menu, { key: 'Enter' });

  expect(onChange).toHaveBeenCalledWith('medium');
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

it('does not open while disabled', () => {
  const { onChange } = setup({ disabled: true });

  fireEvent.click(
    screen.getByRole('combobox', { name: 'Thinking level: High' }),
  );
  expect(screen.queryByText('Fastest, no reasoning')).toBeNull();
  expect(onChange).not.toHaveBeenCalled();
});
