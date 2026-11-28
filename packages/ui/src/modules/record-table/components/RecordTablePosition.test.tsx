// @vitest-environment happy-dom
import { Provider as JotaiProvider, createStore } from 'jotai';
import { act } from 'react';
import { describe, expect, it } from 'vite-plus/test';
import { setupDomRender } from '../../../lib/render-in-dom';
import { RecordTable } from './RecordTable';
import type { RecordTableColumnDef } from './RecordTableProvider';

const render = setupDomRender();

interface Item {
  id: string;
  name: string;
}

const ITEMS: Item[] = Array.from({ length: 40 }, (_, index) => ({
  id: `r${index}`,
  name: `Row ${index}`,
}));

const columns: RecordTableColumnDef<Item>[] = [
  { id: 'name', cell: ({ row }) => <span>{row.original.name}</span> },
];

/** A status link, as 3.x's: it sends the transactions list back to its top. */
const StatusLink = () => {
  const reset = RecordTable.useResetPosition('transactions');

  return (
    <button type="button" data-status="" onClick={reset}>
      Drafts
    </button>
  );
};

const List = () => (
  <RecordTable.Provider columns={columns} data={ITEMS}>
    <RecordTable.CursorProvider sessionKey="transactions" dataLength={ITEMS.length}>
      <RecordTable>
        <RecordTable.Body>
          <RecordTable.RowList />
        </RecordTable.Body>
      </RecordTable>
    </RecordTable.CursorProvider>
  </RecordTable.Provider>
);

describe('RecordTable.useResetPosition', () => {
  it('scrolls a remembered list back to its top', () => {
    render(
      <JotaiProvider store={createStore()}>
        <StatusLink />
        <List />
      </JotaiProvider>,
    );

    // The scrolling box around the table.
    const viewport = document
      .querySelector('.min-h-table')
      ?.closest<HTMLElement>('.rounded-inherit');

    if (!viewport) throw new Error('No scrolling viewport');

    act(() => {
      viewport.scrollTop = 300;
      viewport.dispatchEvent(new Event('scroll'));
    });
    expect(viewport.scrollTop).toBe(300);

    act(() => document.querySelector<HTMLElement>('[data-status]')?.click());

    expect(viewport.scrollTop).toBe(0);
  });
});
