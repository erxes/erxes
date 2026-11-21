// @vitest-environment happy-dom
import { describe, expect, it } from 'vite-plus/test';
import { setupDomRender } from '../lib/render-in-dom';
import { RecordTable } from '../modules/record-table/components/RecordTable';
import { Button } from './button';
import { Table } from './table';

const render = setupDomRender();

const LINES = [
  { id: '1', product: 'Latte', repeated: true },
  { id: '2', product: 'Tea', repeated: false },
  { id: '3', product: 'Latte', repeated: true },
];

describe('marks on a part itself', () => {
  it('marks the cells whose value another line repeats, and no others', () => {
    const container = render(
      <Table>
        <Table.Body>
          {LINES.map((line) => (
            <Table.Row key={line.id}>
              <Table.Cell tint={line.repeated ? 'repeated' : 'none'}>{line.product}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>,
    );

    const marked = [...container.querySelectorAll('td[data-tint="repeated"]')].map(
      (cell) => cell.textContent,
    );

    expect(marked).toEqual(['Latte', 'Latte']);
    expect(container.querySelectorAll('td[data-tint]')).toHaveLength(2);
  });

  it("marks a row's button while what it opens is on", () => {
    const container = render(
      <>
        <RecordTable.MoreButton tint="highlight" aria-label="Split on" />
        <RecordTable.MoreButton aria-label="Split off" />
      </>,
    );

    const marked = [...container.querySelectorAll('button[data-tint="highlight"]')].map((button) =>
      button.getAttribute('aria-label'),
    );

    expect(marked).toEqual(['Split on']);
  });

  it('tells which of a list of buttons is picked', () => {
    const container = render(
      <div>
        {['#101', '#102', '#103'].map((voucher) => (
          <Button key={voucher} variant="ghost" size="multiline" selected={voucher === '#102'}>
            {voucher}
          </Button>
        ))}
      </div>,
    );

    const pressed = [...container.querySelectorAll('button[aria-pressed="true"]')].map(
      (button) => button.textContent,
    );

    expect(pressed).toEqual(['#102']);
    expect(container.querySelectorAll('button[aria-pressed="false"]')).toHaveLength(2);
  });

  it('leaves a plain button without a pressed state', () => {
    const container = render(<Button fill="border">Add line</Button>);

    expect(container.querySelector('button')?.hasAttribute('aria-pressed')).toBe(false);
  });
});
