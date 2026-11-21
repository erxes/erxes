// @vitest-environment happy-dom
import type { OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import { act } from 'react';
import { describe, expect, it, vi } from 'vite-plus/test';
import { loaded, settle, setupPageRender } from '../../lib/render-page';
import { ReportPageContainer, ReportTable } from './Report';

const render = setupPageRender();

/** The report page at an address, once its code (which loads on first use) is in. */
const page = async (
  searchParams: string,
  onUrlUpdate?: OnUrlUpdateFunction,
  onExport?: () => void,
) => {
  render(
    <ReportPageContainer onExport={onExport}>
      <ReportTable>
        <ReportTable.Body>
          <ReportTable.Row>
            <ReportTable.Cell>Cash</ReportTable.Cell>
          </ReportTable.Row>
        </ReportTable.Body>
      </ReportTable>
    </ReportPageContainer>,
    searchParams,
    onUrlUpdate,
  );
  await loaded(() => size() !== undefined);
  await settle();
};

const button = (name: string) =>
  [...document.querySelectorAll('button')].find(
    (item) => item.getAttribute('aria-label') === name || item.textContent === name,
  );

const size = () =>
  document.querySelector<HTMLInputElement>('input[aria-label="Print size"]')?.value;

describe('ReportPageContainer', () => {
  it('zooms the sheet in steps of 10%, between 60% and 160%', async () => {
    await page('?inPreview=true');

    expect(size()).toBe('100');

    for (let step = 0; step < 8; step += 1) act(() => button('Larger')?.click());
    expect(size()).toBe('160');

    for (let step = 0; step < 12; step += 1) act(() => button('Smaller')?.click());
    expect(size()).toBe('60');
  });

  it('shows the sidebar from the start, and hides it on the toggle', async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();

    await page('', onUrlUpdate);

    expect(onUrlUpdate.mock.lastCall?.[0].queryString).toBe('?inPreview=true');

    act(() => button('hide sidebar')?.click());
    await settle();

    expect(onUrlUpdate.mock.lastCall?.[0].queryString).toBe('?inPreview=false');
  });

  it('names its table and cells by data-slot, so a report reads back its figures', async () => {
    await page('?inPreview=true');

    const table = document.querySelector('table[data-slot="table"]');

    expect(
      [...(table?.querySelectorAll('[data-slot="table-cell"]') ?? [])].map(
        (cell) => cell.textContent,
      ),
    ).toEqual(['Cash']);
    expect(
      table?.querySelector('[data-slot="table-body"] > [data-slot="table-row"]'),
    ).not.toBeNull();
  });

  it('offers Excel only with an export', async () => {
    const onExport = vi.fn<() => void>();

    await page('?inPreview=true');
    expect(button('Export to excel')).toBeUndefined();

    document.body.innerHTML = '';
    await page('?inPreview=true', undefined, onExport);
    act(() => button('Export to excel')?.click());
    expect(onExport).toHaveBeenCalled();
  });
});
