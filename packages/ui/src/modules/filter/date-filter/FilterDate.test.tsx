// @vitest-environment happy-dom
import type { OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import { act, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vite-plus/test';
import { loaded, settle, setupPageRender } from '../../../lib/render-page';
import { Filter } from '../components/Filter';

const page = setupPageRender();

/** The filter at an address, once its date parts (which load on first use) are in. */
const atAddress = async (
  node: ReactNode,
  searchParams: string,
  onUrlUpdate?: OnUrlUpdateFunction,
) => {
  const container = page(<Filter id="transactions">{node}</Filter>, searchParams, onUrlUpdate);

  await loaded(() => Boolean(document.body.textContent));

  return container;
};

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

    await atAddress(<Filter.DateView filterKey="createdAt" />, '', onUrlUpdate);

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
  it('names the filter’s value on its bar chip', async () => {
    const quarter = await atAddress(<Filter.Date filterKey="date" />, '?date=2026-quarter-3');

    expect(quarter.textContent).toBe('2026 Q3');

    document.body.innerHTML = '';

    const preset = await atAddress(<Filter.Date filterKey="date" />, '?date=3-days-from-now');

    expect(preset.textContent).toBe('Last 3 days');
  });
});

describe('Filter.DialogDateView', () => {
  it('applies a year picked in the dialog', async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    const year = new Date().getFullYear() - 1;

    await atAddress(
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
