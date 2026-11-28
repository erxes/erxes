// @vitest-environment happy-dom
import { Provider as JotaiProvider, createStore } from 'jotai';
import { describe, expect, it } from 'vite-plus/test';
import { setupDomRender } from '../../../lib/render-in-dom';
import { Button } from '../../../components/button';
import { Tabs } from '../../../components/tabs';
import { RecordTable } from './RecordTable';
import type { RecordTableColumnDef } from './RecordTableProvider';

const render = setupDomRender();

interface TrRow {
  id: string;
  ptrId: string;
  account: string;
}

const ROWS: TrRow[] = [
  { id: '1', ptrId: 'a', account: '1101 Cash' },
  { id: '2', ptrId: 'a', account: '3101 Sales' },
  { id: '3', ptrId: 'b', account: '1201 Bank' },
  { id: '4', ptrId: 'b', account: '2101 Payable' },
  { id: '5', ptrId: 'c', account: '1101 Cash' },
];

const columns: RecordTableColumnDef<TrRow>[] = [
  { id: 'account', cell: ({ row }) => <span>{row.original.account}</span> },
];

/** Each row's text, marked when it starts a group. */
const rows = () =>
  [...document.querySelectorAll('tbody tr')].map(
    (row) => `${row.hasAttribute('data-group-start') ? '— ' : ''}${row.textContent}`,
  );

describe('RecordTable.RowList groupBy', () => {
  it('starts a group at each row whose voucher differs from the row before', () => {
    render(
      <JotaiProvider store={createStore()}>
        <RecordTable.Provider columns={columns} data={ROWS}>
          <RecordTable>
            <RecordTable.Body>
              <RecordTable.RowList groupBy="ptrId" />
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Provider>
      </JotaiProvider>,
    );

    expect(rows()).toEqual([
      '1101 Cash',
      '3101 Sales',
      '— 1201 Bank',
      '2101 Payable',
      '— 1101 Cash',
    ]);
  });

  it('draws no groups without groupBy', () => {
    render(
      <JotaiProvider store={createStore()}>
        <RecordTable.Provider columns={columns} data={ROWS}>
          <RecordTable>
            <RecordTable.Body>
              <RecordTable.RowList />
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Provider>
      </JotaiProvider>,
    );

    expect(rows().filter((row) => row.startsWith('—'))).toEqual([]);
  });
});

describe('3.x voucher looks', () => {
  it('marks the open closable tab, which holds its own close button', () => {
    render(
      <Tabs value="1">
        <Tabs.List>
          {['Main', 'Cash'].map((label, index) => (
            <Tabs.Trigger key={label} value={String(index)} variant="closable" render={<div />}>
              {label}
              <Button variant="ghost" size="icon" aria-label={`Remove ${label}`} />
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs>,
    );

    const open = [...document.querySelectorAll('[role="tab"]')].filter((tab) =>
      tab.hasAttribute('data-active'),
    );

    expect(open.map((tab) => tab.textContent)).toEqual(['Cash']);
    expect(document.querySelectorAll('[role="tab"] button')).toHaveLength(2);
  });
});
