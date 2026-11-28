// @vitest-environment happy-dom
import { computeAccessibleName } from 'dom-accessibility-api';
import { createInstance } from 'i18next';
import { act, type ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { describe, expect, it, vi } from 'vite-plus/test';
import { actUntil, setupDomRender } from '../../../lib/render-in-dom';
import { PopoverScoped } from '../../hotkey/components/PopoverScoped';
import { RecordTableInlineCell } from '../../record-table/components/RecordTableCellInline';
import { DateField } from './DateField';

const renderInDom = setupDomRender();

const i18n = createInstance();

void i18n.use(initReactI18next).init({ lng: 'en', resources: {}, initAsync: false });

const render = (node: ReactNode) =>
  renderInDom(<I18nextProvider i18n={i18n}>{node}</I18nextProvider>);

/** The field's own button, which opens it. */
const triggerOf = (container: HTMLElement) => container.querySelector('button');

/** Opens the field and waits for the calendar's days: its code loads on its first render. */
const open = async (container: HTMLElement) => {
  act(() => triggerOf(container)?.click());
  await actUntil(() => document.querySelector('[data-day]') !== null);
};

/** A day of the shown month in the open calendar, by its date. */
const dayButton = (isoDay: string) =>
  document.querySelector<HTMLButtonElement>(`[data-day="${isoDay}"] button`);

/** The field's name as a screen reader reads it. */
const nameOf = (container: HTMLElement) => {
  const trigger = triggerOf(container);

  return trigger ? computeAccessibleName(trigger) : null;
};

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

  it('opens straight to the calendar and a typed date, with no second picker to open', async () => {
    const container = render(<DateField value="2026-11-03" onSave={saves()} />);

    await open(container);

    expect(dayButton('2026-11-19')).not.toBeNull();
    // One typed date beside the calendar, not a second field that opens another popover.
    expect(document.querySelectorAll('input[placeholder="Pick a date"]')).toHaveLength(1);
  });

  it('saves a picked day as YYYY-MM-DD and closes', async () => {
    const onSave = saves();
    const container = render(<DateField value="2026-11-03" onSave={onSave} />);

    await open(container);
    act(() => dayButton('2026-11-19')?.click());

    expect(onSave).toHaveBeenCalledWith('2026-11-19');
    expect(triggerOf(container)?.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes without saving when the saved day is picked again', async () => {
    const onSave = saves();
    const container = render(<DateField value="2026-11-03" onSave={onSave} />);

    await open(container);
    act(() => dayButton('2026-11-03')?.click());

    expect(onSave).not.toHaveBeenCalled();
  });

  it('keeps what it shows in its name, with or without a label around it', () => {
    const inRow = render(
      <>
        <span id="row-label">Close date</span>
        <RecordTableInlineCell.LabelledBy value="row-label">
          <DateField value={null} placeholder="Not set" aria-label="Deal close" onSave={saves()} />
        </RecordTableInlineCell.LabelledBy>
      </>,
    );

    const alone = render(
      <DateField value={null} placeholder="Not set" aria-label="Close date" onSave={saves()} />,
    );

    const unnamed = render(<DateField value={null} placeholder="Not set" onSave={saves()} />);

    expect(nameOf(inRow)).toBe('Close date Not set');
    expect(nameOf(alone)).toBe('Close date Not set');
    expect(nameOf(unnamed)).toBe('Not set');
  });

  it('leaves other cells in a row named by their own aria-label', () => {
    // A cell that says its value in its aria-label (sales' "3, quantity of Chair") keeps it.
    const container = render(
      <>
        <span id="lines-label">Products</span>
        <RecordTableInlineCell.LabelledBy value="lines-label">
          <PopoverScoped>
            <RecordTableInlineCell.Trigger aria-label="3, quantity of Chair">
              3
            </RecordTableInlineCell.Trigger>
          </PopoverScoped>
        </RecordTableInlineCell.LabelledBy>
      </>,
    );

    expect(nameOf(container)).toBe('Products 3, quantity of Chair');
  });

  it('offers only the days between min and max', async () => {
    const onSave = saves();

    const container = render(
      <DateField value="2026-11-10" min="2026-11-05" max="2026-11-20" onSave={onSave} />,
    );

    await open(container);

    expect(dayButton('2026-11-04')?.disabled).toBe(true);
    expect(dayButton('2026-11-21')?.disabled).toBe(true);
    expect(dayButton('2026-11-05')?.disabled).toBe(false);

    act(() => dayButton('2026-11-04')?.click());
    act(() => dayButton('2026-11-20')?.click());

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('2026-11-20');
  });
});
