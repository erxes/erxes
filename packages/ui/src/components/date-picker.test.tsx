// @vitest-environment happy-dom
import { createInstance } from 'i18next';
import { act, type ReactNode } from 'react';
import type { DateRange } from 'react-day-picker';
import { useForm } from 'react-hook-form';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { describe, expect, it, vi } from 'vite-plus/test';
import { setupDomRender } from '../lib/render-in-dom';
import { PanelFormRow } from '../modules/record-panel/PanelForm';
import { DatePicker } from './date-picker';
import { TimeField } from './date-time-input';
import { Form } from './form';

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

/** A date row of a form, as a settings page writes one. */
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
  it("labels the calendar's buttons and months in the UI's language", () => {
    const container = inLanguage(
      'mn',
      <DatePicker inline mode="range" defaultMonth={NOVEMBER} onChange={() => undefined} />,
    );

    const next = container.querySelector('nav button:last-child');

    expect(next?.getAttribute('aria-label')).toBe('Дараагийн сар руу очих');
    expect(container.textContent).toContain('арван нэгдүгээр сар');
  });

  it('starts a new range on a click after a whole range', () => {
    const onChange = vi.fn<(range?: unknown) => void>();
    const range: DateRange = { from: new Date(2026, 10, 3), to: new Date(2026, 10, 5) };

    const container = inLanguage(
      'en',
      <DatePicker inline mode="range" value={range} defaultMonth={NOVEMBER} onChange={onChange} />,
    );

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
