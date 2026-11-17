// @vitest-environment happy-dom
import { act } from 'react';
import { describe, expect, it, vi } from 'vite-plus/test';
import { setupDomRender } from '../../lib/render-in-dom';
import type { TConditionField } from './conditions';
import { FieldPicker } from './FieldPicker';

const render = setupDomRender();

const orders = { label: 'Orders', fields: [] };
const deals = { label: 'Deals', fields: [] };

const FIELDS: TConditionField[] = [
  { path: 'firstName', label: 'First name', type: 'text' },
  { path: 'custom.vip', label: 'VIP', type: 'boolean', group: 'custom' },
  {
    path: 'subject.related.ecommerce.orders.count',
    label: 'Orders: count',
    type: 'number',
    group: 'plugin',
    groupLabel: 'Ecommerce',
    relation: orders,
  },
  {
    path: 'subject.related.ecommerce.orders.sum.total',
    label: 'Orders: Total (total)',
    type: 'number',
    group: 'plugin',
    groupLabel: 'Ecommerce',
    relation: orders,
  },
  {
    path: 'custom.loyalty',
    label: 'Loyalty points',
    type: 'number',
    group: 'plugin',
    groupLabel: 'Ecommerce',
  },
  {
    path: 'subject.related.sales.deals.count',
    label: 'Deals: count',
    type: 'number',
    group: 'plugin',
    groupLabel: 'Sales',
    relation: deals,
  },
];

const items = (container: HTMLElement) =>
  [...container.querySelectorAll('[cmdk-item]')].map((item) => item.textContent);

const headings = (container: HTMLElement) =>
  [...container.querySelectorAll('[cmdk-group-heading]')].map((item) => item.textContent);

/** The rows search leaves showing. */
const shown = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>('[cmdk-item]')]
    .filter((item) => !item.closest('[hidden]'))
    .map((item) => item.textContent);

const click = (container: HTMLElement, text: string) =>
  act(() => {
    [...container.querySelectorAll<HTMLElement>('[cmdk-item]')]
      .find((item) => item.textContent?.includes(text))
      ?.click();
  });

/** Types into the search as a member would, so cmdk filters the rows. */
const type = (container: HTMLElement, text: string) =>
  act(() => {
    const input = container.querySelector('input');

    if (!input) throw new Error('No search input');

    // Past React's own value tracker, so the input event reads as a change.
    Reflect.set(HTMLInputElement.prototype, 'value', text, input);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

const pick = () => vi.fn<(field: TConditionField) => void>();

describe('FieldPicker', () => {
  it('lists core’s fields, and each plugin as one row with its field count', () => {
    const container = render(<FieldPicker fields={FIELDS} onSelect={pick()} />);

    expect(headings(container)).toEqual(['Apps', 'Fields', 'Properties']);
    expect(items(container)).toEqual(['Ecommerce3', 'Sales1', 'First name', 'VIP']);
  });

  it('opens a plugin on its own page, its fields first, then a section per relation', () => {
    const onSelect = pick();
    const container = render(<FieldPicker fields={FIELDS} onSelect={onSelect} />);

    click(container, 'Ecommerce');

    expect(headings(container)).toEqual(['Ecommerce', 'Orders']);
    expect(items(container)).toEqual(['All fields', 'Loyalty points', 'Count', 'Total (total)']);

    click(container, 'Total');

    expect(onSelect).toHaveBeenCalledWith(FIELDS[3]);

    click(container, 'All fields');

    expect(items(container)).toEqual(['Ecommerce3', 'Sales1', 'First name', 'VIP']);
  });

  it('opens on the plugin of the field picked now', () => {
    const container = render(
      <FieldPicker fields={FIELDS} value="subject.related.sales.deals.count" onSelect={pick()} />,
    );

    expect(headings(container)).toEqual(['Deals']);
  });

  it('searches every plugin’s fields from the first page, with whole labels', () => {
    const container = render(<FieldPicker fields={FIELDS} onSelect={pick()} />);

    type(container, 'count');

    expect(shown(container)).toEqual(['Orders: count', 'Deals: count']);
  });

  it('matches words, not letters scattered through a field’s path', () => {
    const container = render(<FieldPicker fields={FIELDS} onSelect={pick()} />);

    type(container, 'total');

    expect(shown(container)).toEqual(['Orders: Total (total)']);

    type(container, 'sales count');

    expect(shown(container)).toEqual(['Deals: count']);
  });
});
