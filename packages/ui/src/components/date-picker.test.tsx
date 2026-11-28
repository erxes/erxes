// @vitest-environment happy-dom
import { computeAccessibleName } from 'dom-accessibility-api';
import { createInstance } from 'i18next';
import { act, type ReactNode, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useForm } from 'react-hook-form';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { describe, expect, it, vi } from 'vite-plus/test';
import { actUntil, setupDomRender } from '../lib/render-in-dom';
import { PanelFormRow } from '../modules/record-panel/PanelForm';
import { DatePicker } from './date-picker';
import { DateInput, TimeField } from './date-time-input';
import { Form } from './form';
import { Input } from './input';

const render = setupDomRender();

const i18n = (lng: string) => {
  const instance = createInstance();

  void instance.use(initReactI18next).init({
    lng,
    resources: {
      mn: { ui: { date: { placeholder: 'Огноо сонгох', days_one: '{{count}} өдөр' } } },
    },
    interpolation: { escapeValue: false },
    initAsync: false,
  });

  return instance;
};

const inLanguage = (lng: string, node: ReactNode) =>
  render(<I18nextProvider i18n={i18n(lng)}>{node}</I18nextProvider>);

const NOVEMBER = new Date(2026, 10, 1);

/** Clicks a day of the shown month, by its date. */
const clickDay = (container: HTMLElement, isoDay: string) =>
  act(() => container.querySelector<HTMLButtonElement>(`[data-day="${isoDay}"] button`)?.click());

/** The text of the elements an aria-labelledby or aria-describedby names. */
const text = (ids: string | null | undefined) =>
  ids
    ?.split(' ')
    .map((id) => document.getElementById(id)?.textContent)
    .join(' ');

/** Lets an opened popover finish moving focus, which it does a frame later. */
const settle = () =>
  act(
    () =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, 50);
      }),
  );

/** Waits for the calendar's days: its code loads on its first render. */
const calendarShown = () => actUntil(() => document.querySelector('[data-day]') !== null);

/** What a screen reader calls an element. */
const nameOf = (element: Element | null | undefined) =>
  element ? computeAccessibleName(element) : undefined;

/** A date row of a form, as a settings page writes one. */
/** A single-date picker that keeps the day it's given. */
const Birthday = () => {
  const [day, setDay] = useState<Date>();

  return (
    <DatePicker value={day} onChange={(next) => setDay(next instanceof Date ? next : undefined)} />
  );
};

const BirthdayForm = () => {
  const form = useForm({ defaultValues: { birthday: '' } });

  return (
    <Form {...form}>
      <Form.Field
        name="birthday"
        render={() => (
          <Form.Item>
            <Form.Label>Birthday</Form.Label>
            <Form.Control>
              <DatePicker onChange={() => undefined} />
            </Form.Control>
          </Form.Item>
        )}
      />
    </Form>
  );
};

describe('DatePicker', () => {
  it("labels the calendar's buttons and months in the UI's language", async () => {
    const container = inLanguage(
      'mn',
      <DatePicker inline mode="range" defaultMonth={NOVEMBER} onChange={() => undefined} />,
    );

    await calendarShown();

    const next = container.querySelector('nav button:last-child');

    expect(next?.getAttribute('aria-label')).toBe('Дараагийн сар руу очих');
    expect(container.textContent).toContain('арван нэгдүгээр сар');
  });

  it('starts a new range on a click after a whole range', async () => {
    const onChange = vi.fn<(range?: unknown) => void>();
    const range: DateRange = { from: new Date(2026, 10, 3), to: new Date(2026, 10, 5) };

    const container = inLanguage(
      'en',
      <DatePicker inline mode="range" value={range} defaultMonth={NOVEMBER} onChange={onChange} />,
    );

    await calendarShown();
    clickDay(container, '2026-11-20');

    expect(onChange).toHaveBeenLastCalledWith({ from: new Date(2026, 10, 20), to: undefined });
  });

  it('puts its aria-label on the text input and the range button, not the calendar', () => {
    const single = inLanguage(
      'en',
      <DatePicker aria-label="Due date" onChange={() => undefined} />,
    );

    expect(single.querySelector('input')?.getAttribute('aria-label')).toBe('Due date');

    const range = inLanguage(
      'en',
      <DatePicker mode="range" aria-label="Campaign dates" onChange={() => undefined} />,
    );

    expect(range.querySelector('button')?.getAttribute('aria-label')).toBe('Campaign dates');
  });

  it("is named by its form row's label", () => {
    const row = inLanguage(
      'en',
      <PanelFormRow label="Birthday">
        <DatePicker onChange={() => undefined} />
      </PanelFormRow>,
    );

    const labelledBy = row.querySelector('input')?.getAttribute('aria-labelledby');

    expect(labelledBy && document.getElementById(labelledBy)?.textContent).toBe('Birthday');

    const typed = inLanguage(
      'en',
      <PanelFormRow label="Starts at">
        <TimeField />
      </PanelFormRow>,
    );

    const timeLabel = typed.querySelector('input')?.getAttribute('aria-labelledby');

    expect(timeLabel && document.getElementById(timeLabel)?.textContent).toBe('Starts at');

    const form = inLanguage('en', <BirthdayForm />);
    const input = form.querySelector('input');

    expect(input?.id).toBeTruthy();
    expect(form.querySelector('label')?.getAttribute('for')).toBe(input?.id);
  });

  it("names an empty range button by a required row's label, then its placeholder, and says Required in its description", () => {
    const row = inLanguage(
      'en',
      <PanelFormRow label="Campaign dates" required>
        <DatePicker mode="range" onChange={() => undefined} />
      </PanelFormRow>,
    );

    const button = row.querySelector('button');
    const placeholder = button?.textContent ?? '';

    expect(placeholder).not.toBe('');
    expect(nameOf(button)).toBe(`Campaign dates ${placeholder}`);
    expect(text(button?.getAttribute('aria-describedby'))).toBe('Required');
    expect(button?.hasAttribute('aria-required')).toBe(false);
  });

  it("names a range or multiple picker in a form row by the row's label, then what it shows", () => {
    const stay: DateRange = { from: new Date(2026, 11, 3), to: new Date(2026, 11, 5) };

    const range = inLanguage(
      'en',
      <PanelFormRow label="Stay">
        <DatePicker mode="range" value={stay} onChange={() => undefined} />
      </PanelFormRow>,
    );

    const dates = range.querySelector('button')?.textContent;

    expect(dates).toMatch(/3.+5/);
    expect(nameOf(range.querySelector('button'))).toBe(`Stay ${dates}`);

    const multiple = inLanguage(
      'en',
      <PanelFormRow label="Days off">
        <DatePicker mode="multiple" value={[new Date(2026, 11, 3)]} onChange={() => undefined} />
      </PanelFormRow>,
    );

    expect(nameOf(multiple.querySelector('button'))).toBe('Days off 1 day');
  });

  it('names a range picker by its aria-label, then the dates it shows', () => {
    const stay: DateRange = { from: new Date(2026, 11, 3), to: new Date(2026, 11, 5) };

    const range = inLanguage(
      'en',
      <DatePicker mode="range" aria-label="Period" value={stay} onChange={() => undefined} />,
    );

    const button = range.querySelector('button');

    expect(nameOf(button)).toBe(`Period ${button?.textContent ?? ''}`);
  });

  it('opens the calendar on a click in the typed date, keeps the caret there, and stays open on another click', async () => {
    const container = inLanguage('en', <DatePicker onChange={() => undefined} />);
    const input = container.querySelector('input');

    act(() => {
      input?.focus();
      input?.click();
    });
    await settle();

    expect(document.querySelector('[data-day]')).not.toBeNull();
    expect(document.activeElement).toBe(input);

    act(() => {
      input?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      input?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      input?.click();
    });
    await settle();

    expect(document.querySelector('[data-day]')).not.toBeNull();
  });

  it("turns the open calendar to a typed day's month", async () => {
    const container = inLanguage('en', <Birthday />);
    const input = container.querySelector('input');

    act(() => {
      input?.focus();
      input?.click();
    });
    await settle();

    act(() => {
      if (!input) return;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
        input,
        '2024-03-01',
      );
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(document.querySelector('[data-day="2024-03-15"]')).not.toBeNull();
    expect(document.activeElement).toBe(input);
  });

  it('moves focus into the calendar when Enter opens it', async () => {
    const container = inLanguage('en', <DatePicker onChange={() => undefined} />);
    const input = container.querySelector('input');

    act(() => {
      input?.focus();
      input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    await settle();

    expect(document.querySelector('[data-day]')).not.toBeNull();
    expect(document.activeElement).not.toBe(input);
  });

  it("opens the browser's picker on a click anywhere in a date or time field, unless it is read-only", () => {
    const showPicker = vi.fn<() => void>();

    Object.defineProperty(HTMLInputElement.prototype, 'showPicker', {
      value: showPicker,
      configurable: true,
    });

    const container = inLanguage(
      'en',
      <>
        <DateInput />
        <TimeField />
        <Input type="datetime-local" />
        <Input type="date" readOnly />
        <Input />
      </>,
    );

    act(() => {
      for (const input of container.querySelectorAll('input')) input.click();
    });

    expect(showPicker).toHaveBeenCalledTimes(3);
  });

  it('shows its placeholder and a count of days in the UI language', () => {
    const empty = inLanguage('mn', <DatePicker onChange={() => undefined} />);

    expect(empty.querySelector('input')?.placeholder).toBe('Огноо сонгох');

    const multiple = inLanguage(
      'mn',
      <DatePicker mode="multiple" value={[new Date(2026, 10, 3)]} onChange={() => undefined} />,
    );

    expect(multiple.querySelector('button')?.textContent).toBe('1 өдөр');
  });
});
