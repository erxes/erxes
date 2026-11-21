// @vitest-environment happy-dom
import { Provider as JotaiProvider, createStore } from 'jotai';
import { act, useState } from 'react';
import { describe, expect, it } from 'vite-plus/test';
import { setupDomRender } from '../../../lib/render-in-dom';
import { RecordTable } from './RecordTable';
import type { RecordTableColumnDef } from './RecordTableProvider';
import { RecordTableTree } from './RecordTableTree';

const render = setupDomRender();

interface Category {
  id: string;
  name: string;
  order: string;
  hasChildren: boolean;
}

const CATEGORIES: Category[] = [
  { id: 'a', name: 'Assets', order: '1/', hasChildren: true },
  { id: 'b', name: 'Cash', order: '1/11/', hasChildren: true },
  { id: 'c', name: 'Bank', order: '1/11/111/', hasChildren: false },
  { id: 'd', name: 'Stock', order: '1/12/', hasChildren: false },
  { id: 'e', name: 'Liabilities', order: '2/', hasChildren: false },
];

const columns: RecordTableColumnDef<Category>[] = [
  {
    id: 'name',
    cell: ({ row }) => (
      <RecordTableTree.Trigger
        order={row.original.order}
        name={row.original.name}
        hasChildren={row.original.hasChildren}
      >
        <span data-name="">{row.original.name}</span>
      </RecordTableTree.Trigger>
    ),
  },
];

const Tree = ({ rows, ordered = true }: { rows: Category[]; ordered?: boolean }) => (
  <RecordTable.Provider columns={columns} data={rows}>
    <RecordTableTree id="categories" ordered={ordered} length={rows.length}>
      <RecordTable>
        <RecordTable.Body>
          <RecordTable.RowList Row={RecordTableTree.Row} />
        </RecordTable.Body>
      </RecordTable>
    </RecordTableTree>
  </RecordTable.Provider>
);

/** The tree with a button that drops its last row. */
const Changing = () => {
  const [rows, setRows] = useState(CATEGORIES);

  return (
    <>
      <button type="button" data-drop="" onClick={() => setRows(CATEGORIES.slice(0, 4))}>
        Drop
      </button>
      <Tree rows={rows} />
    </>
  );
};

/** The names of the rows that show. */
const names = () => [...document.querySelectorAll('[data-name]')].map((cell) => cell.textContent);

/** Clicks the fold arrow in a row. */
const fold = (name: string) =>
  act(() => {
    const row = [...document.querySelectorAll('tr')].find((tr) => tr.textContent === name);

    row?.querySelector<HTMLElement>('[role="button"]')?.click();
  });

const inStore = (node: React.ReactNode) =>
  render(<JotaiProvider store={createStore()}>{node}</JotaiProvider>);

describe('RecordTableTree', () => {
  it('folds a row’s children and their children, and opens them again', () => {
    inStore(<Tree rows={CATEGORIES} />);

    expect(names()).toEqual(['Assets', 'Cash', 'Bank', 'Stock', 'Liabilities']);

    fold('Cash');
    expect(names()).toEqual(['Assets', 'Cash', 'Stock', 'Liabilities']);

    fold('Assets');
    expect(names()).toEqual(['Assets', 'Liabilities']);

    fold('Assets');
    expect(names()).toEqual(['Assets', 'Cash', 'Stock', 'Liabilities']);
  });

  it('draws a fold arrow only on rows with children', () => {
    inStore(<Tree rows={CATEGORIES} />);

    const arrows = [...document.querySelectorAll('tr')].map(
      (row) => row.querySelectorAll('[role="button"]').length,
    );

    expect(arrows).toEqual([1, 1, 0, 0, 0]);
  });

  it('opens every row when the rows change', () => {
    inStore(<Changing />);
    fold('Assets');
    expect(names()).toEqual(['Assets', 'Liabilities']);

    act(() => document.querySelector<HTMLElement>('[data-drop]')?.click());
    expect(names()).toEqual(['Assets', 'Cash', 'Bank', 'Stock']);
  });

  it('neither indents nor hides rows that are not in tree order', () => {
    inStore(<Tree rows={CATEGORIES} ordered={false} />);
    fold('Assets');

    expect(names()).toEqual(['Assets', 'Cash', 'Bank', 'Stock', 'Liabilities']);
  });
});
