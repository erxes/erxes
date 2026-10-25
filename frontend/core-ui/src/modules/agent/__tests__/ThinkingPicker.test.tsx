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

describe('per-model levels', () => {
  const openMenu = (label: string) =>
    fireEvent.click(
      screen.getByRole('combobox', { name: `Thinking level: ${label}` }),
    );
  const levelLabels = () =>
    screen
      .getAllByRole('option')
      .map((option) => option.querySelector('.font-medium')?.textContent);
  const filledBars = (option: HTMLElement) =>
    option.querySelectorAll('.bg-foreground').length;

  it('offers exactly an effort model’s levels, deepest with full bars', () => {
    setup({
      value: 'high',
      thinking: {
        kind: 'effort',
        levels: ['off', 'low', 'medium', 'high', 'xhigh', 'max'],
      },
    });
    openMenu('High');
    expect(levelLabels()).toEqual([
      'Off',
      'Low',
      'Medium',
      'High',
      'Extra high',
      'Max',
    ]);
    expect(screen.getByText('Deep reasoning, slower')).toBeTruthy();
    expect(filledBars(screen.getByRole('option', { name: /^Max/ }))).toBe(4);
    expect(filledBars(screen.getByRole('option', { name: /^Off/ }))).toBe(0);
  });

  it('never offers Off for k3.1-pro and shows the clamped level', async () => {
    const { onChange } = setup({
      value: 'off',
      thinking: { kind: 'effort', levels: ['low', 'high', 'max'] },
    });
    openMenu('Low');
    expect(levelLabels()).toEqual(['Low', 'High', 'Max']);
    fireEvent.click(screen.getByRole('option', { name: /^Max/ }));
    expect(onChange).toHaveBeenCalledWith('max');
  });

  it('labels a toggle model On/Off', () => {
    setup({
      value: 'high',
      thinking: { kind: 'toggle', levels: ['off', 'high'] },
    });
    openMenu('On');
    expect(levelLabels()).toEqual(['Off', 'On']);
  });

  it.each([
    ['none', 'Off', "This model doesn't reason"],
    ['fixed', 'Auto', 'This model sets its own reasoning depth'],
  ] as const)('locks the control for a %s model', (kind, label, title) => {
    const { onChange } = setup({ thinking: { kind, levels: [] } });
    const trigger = screen.getByRole('combobox', {
      name: `Thinking level: ${label}`,
    });

    expect(trigger.hasAttribute('disabled')).toBe(true);
    expect(trigger.getAttribute('title')).toBe(title);
    fireEvent.click(trigger);
    expect(screen.queryByRole('option')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps the original five levels when the model is unknown', () => {
    setup({ thinking: null });
    openMenu('High');
    expect(levelLabels()).toEqual(['Off', 'Minimal', 'Low', 'Medium', 'High']);
  });
});
