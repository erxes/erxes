// @vitest-environment happy-dom
import { createInstance } from 'i18next';
import { act, type ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { describe, expect, it, vi } from 'vite-plus/test';
import { setupDomRender } from '../../../lib/render-in-dom';
import { DateField } from './DateField';

const renderInDom = setupDomRender();

const i18n = createInstance();

void i18n.use(initReactI18next).init({ lng: 'en', resources: {}, initAsync: false });

const render = (node: ReactNode) =>
  renderInDom(<I18nextProvider i18n={i18n}>{node}</I18nextProvider>);

/** The field's own button, which opens it. */
const triggerOf = (container: HTMLElement) => container.querySelector('button');

const open = (container: HTMLElement) => act(() => triggerOf(container)?.click());

/** A day of the shown month in the open calendar, by its date. */
const dayButton = (isoDay: string) =>
  document.querySelector<HTMLButtonElement>(`[data-day="${isoDay}"] button`);

/** What `onSave` was called with. */
const saves = () => vi.fn<(value: string | null) => void>();

describe('DateField', () => {
  it('shows the saved day, or its placeholder when there is none', () => {
    const saved = render(
      <DateField value="2026-11-03" placeholder="YYYY/MM/DD" onSave={saves()} />,
    );

    const empty = render(<DateField value={null} placeholder="YYYY/MM/DD" onSave={saves()} />);

    expect(triggerOf(saved)?.textContent).not.toBe('YYYY/MM/DD');
    expect(triggerOf(saved)?.textContent).toContain('2026');
    expect(triggerOf(empty)?.textContent).toBe('YYYY/MM/DD');
  });

  it('opens straight to the calendar and a typed date, with no second picker to open', () => {
    const container = render(<DateField value="2026-11-03" onSave={saves()} />);

    open(container);

    expect(dayButton('2026-11-19')).not.toBeNull();
    // One typed date beside the calendar, not a second field that opens another popover.
    expect(document.querySelectorAll('input[placeholder="Pick a date"]')).toHaveLength(1);
  });

  it('saves a picked day as YYYY-MM-DD and closes', () => {
    const onSave = saves();
    const container = render(<DateField value="2026-11-03" onSave={onSave} />);

    open(container);
    act(() => dayButton('2026-11-19')?.click());

    expect(onSave).toHaveBeenCalledWith('2026-11-19');
    expect(triggerOf(container)?.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes without saving when the saved day is picked again', () => {
    const onSave = saves();
    const container = render(<DateField value="2026-11-03" onSave={onSave} />);

    open(container);
    act(() => dayButton('2026-11-03')?.click());

    expect(onSave).not.toHaveBeenCalled();
  });
});
