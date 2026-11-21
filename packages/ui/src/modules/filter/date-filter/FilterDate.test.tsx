// @vitest-environment happy-dom
import { createInstance } from 'i18next';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { type OnUrlUpdateFunction, withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { act, createElement, type ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { describe, expect, it, vi } from 'vite-plus/test';
import { setupDomRender } from '../../../lib/render-in-dom';
import { Filter } from '../components/Filter';

const render = setupDomRender();

const settle = () =>
  act(
    () =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, 50);
      }),
  );

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  lng: 'en',
  resources: {},
  interpolation: { escapeValue: false },
  initAsync: false,
});

const atAddress = (node: ReactNode, searchParams: string, onUrlUpdate?: OnUrlUpdateFunction) =>
  render(
    createElement(
      withNuqsTestingAdapter({ searchParams, onUrlUpdate }),
      null,
      <I18nextProvider i18n={i18n}>
        <JotaiProvider store={createStore()}>
          <Filter id="transactions">{node}</Filter>
        </JotaiProvider>
      </I18nextProvider>,
    ),
  );

const rows = () => [...document.querySelectorAll('[cmdk-item]')].map((item) => item.textContent);

const pick = (text: string) =>
  act(() => {
    [...document.querySelectorAll<HTMLElement>('[cmdk-item]')]
      .find((item) => item.textContent === text)
      ?.click();
  });

describe('Filter.DateView', () => {
  it('offers the presets and a custom range, and writes the one picked', async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();

    atAddress(<Filter.DateView filterKey="createdAt" />, '', onUrlUpdate);

    expect(rows()).toEqual([
      'Today',
      'In the past',
      'Last 1 day',
      'Last 3 days',
      'Last 7 days',
      'Last 3 months',
      'Custom created at date or timeframe',
    ]);

    pick('Last 7 days');
    await settle();

    expect(onUrlUpdate.mock.lastCall?.[0].queryString).toBe('?createdAt=last-7-days');
  });
});

describe('Filter.Date', () => {
  it('names the filter’s value on its bar chip', () => {
    const quarter = atAddress(<Filter.Date filterKey="date" />, '?date=2026-quarter-3');

    expect(quarter.textContent).toBe('2026 Q3');

    document.body.innerHTML = '';

    const preset = atAddress(<Filter.Date filterKey="date" />, '?date=3-days-from-now');

    expect(preset.textContent).toBe('Last 3 days');
  });
});

describe('Filter.DialogDateView', () => {
  it('applies a year picked in the dialog', async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    const year = new Date().getFullYear() - 1;

    atAddress(
      <Filter.Dialog open>
        <Filter.DialogDateView filterKey="date" label="Date" />
      </Filter.Dialog>,
      '?date=2020-y',
      onUrlUpdate,
    );
    await settle();

    // It opens on the tab of the value it has.
    expect(document.querySelector('[data-pressed]')?.textContent).toBe('Year');

    act(() => document.querySelector<HTMLInputElement>(`input[value="${year}-y"]`)?.click());
    act(() => {
      [...document.querySelectorAll('button')]
        .find((button) => button.textContent === 'Apply')
        ?.click();
    });
    await settle();

    expect(onUrlUpdate.mock.lastCall?.[0].queryString).toBe(`?date=${year}-y`);
  });
});
