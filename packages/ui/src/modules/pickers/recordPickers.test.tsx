// @vitest-environment happy-dom
import type { OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import { act } from 'react';
import { describe, expect, it, vi } from 'vite-plus/test';
import { settle, setupPageRender } from '../../lib/render-page';
import { Filter } from '../filter/components/Filter';
import type { CustomerContact, ContactSearchQueries } from '../records/contacts';
import type { ProductQueries, ProductRecord } from '../records/products';
import type { UnitChoice, UnitQueries } from '../records/units';
import { SelectCustomer } from './SelectContacts';
import { ProductsInline, SelectProduct } from './SelectProducts';
import { SelectProductsBulk } from './SelectProductsBulk';
import { BranchesInline, SelectBranches } from './SelectUnits';

const page = setupPageRender();

const BRANCHES: UnitChoice[] = [
  { id: 'ub', name: 'Ulaanbaatar', code: '02', parentId: 'hq' },
  { id: 'hq', name: 'Head office', code: '01', parentId: null },
  { id: 'dk', name: 'Darkhan', code: '03', parentId: 'hq' },
];

const units: UnitQueries = {
  list: (kind) => ({
    queryKey: ['units', kind],
    queryFn: async () => ({ data: kind === 'branch' ? BRANCHES : [] }),
  }),
};

const product = (id: string, name: string, code: string, price = 0): ProductRecord => ({
  id,
  name,
  code,
  price,
  currency: 'MNT',
  unit: 'pcs',
  categoryId: null,
});

const PRODUCTS = [
  product('p1', 'Flour', 'FL', 150_000),
  product('p2', 'Sugar', 'SG', 250_000),
  product('p3', 'Salt', 'ST', 50_000),
];

const asked: unknown[] = [];

const products: ProductQueries = {
  page: (input) => ({
    queryKey: ['products', input],
    queryFn: async () => {
      asked.push(input);

      const term = input.search?.toLowerCase() ?? '';
      const data = PRODUCTS.filter((row) => row.name.toLowerCase().includes(term));

      return {
        data,
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: data.length,
      };
    },
  }),
  byIds: (ids) => ({
    queryKey: ['products', 'ids', ids],
    queryFn: async () => ({ data: PRODUCTS.filter((row) => ids.includes(row.id)) }),
  }),
  categories: { queryKey: ['categories'], queryFn: async () => ({ data: [] }) },
};

const customer = (id: string, firstName: string): CustomerContact => ({
  id,
  firstName,
  middleName: null,
  lastName: null,
  primaryEmail: null,
  primaryPhone: null,
  avatarUrl: null,
});

const CUSTOMERS = [customer('c1', 'Bold'), customer('c2', 'Saraa')];

const contacts: ContactSearchQueries = {
  customers: ({ search, ids }) => ({
    queryKey: ['customers', search, ids],
    queryFn: async () => ({
      data: CUSTOMERS.filter((row) =>
        ids ? ids.includes(row.id) : (row.firstName ?? '').includes(search ?? ''),
      ),
    }),
  }),
  companies: () => ({ queryKey: ['companies'], queryFn: async () => ({ data: [] }) }),
};

const rows = () => [...document.querySelectorAll('[cmdk-item]')].map((item) => item.textContent);

const pick = (text: string) =>
  act(() => {
    [...document.querySelectorAll<HTMLElement>('[cmdk-item]')]
      .find((item) => item.textContent === text)
      ?.click();
  });

const open = async (container: HTMLElement) => {
  act(() => container.querySelector('button')?.click());
  await settle();
};

describe('SelectBranches', () => {
  it('shows the picked branch, and lists the rest as a tree, parents first', async () => {
    const onValueChange = vi.fn<(value: string | string[] | undefined) => void>();

    const container = page(
      <SelectBranches.InlineCell units={units} value="dk" onValueChange={onValueChange} />,
    );

    await settle();
    expect(container.textContent).toBe('03Darkhan');

    await open(container);
    expect(rows()).toEqual(['01Head office', '02Ulaanbaatar']);

    pick('02Ulaanbaatar');
    expect(onValueChange).toHaveBeenCalledWith('ub');
  });

  it('names several branches, and counts them past two', async () => {
    const two = page(<BranchesInline units={units} branchIds={['hq', 'dk']} />);

    await settle();
    expect(two.textContent).toBe('Head office, Darkhan');

    document.body.innerHTML = '';

    const three = page(<BranchesInline units={units} branchIds={['hq', 'dk', 'ub']} />);

    await settle();
    expect(three.textContent).toBe('3 branches');
  });
});

describe('SelectProduct', () => {
  it('reads the picked product by id, and searches the catalog as you type', async () => {
    const container = page(
      <SelectProduct.InlineCell products={products} value="p2" onValueChange={() => undefined} />,
    );

    await settle();
    expect(container.textContent).toBe('SGSugar');

    await open(container);
    expect(rows()).toEqual(['FLFlour', 'STSalt']);

    act(() => {
      const input = document.querySelector('[cmdk-input]');

      if (!(input instanceof HTMLInputElement)) throw new Error('No search');

      Reflect.set(HTMLInputElement.prototype, 'value', 'sa', input);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    // The search waits half a second after typing stops.
    await settle(600);

    await settle();

    expect(asked).toContainEqual({ search: 'sa' });
    expect(rows()).toEqual(['STSalt']);
  });

  it('shows the first of several products and how many more', async () => {
    const container = page(<ProductsInline productQueries={products} productIds={['p1', 'p3']} />);

    await settle();
    expect(container.textContent).toBe('FLFlour +1 more');
  });
});

describe('SelectCustomer filter parts', () => {
  it('adds a customer to several, the picked ones on top', async () => {
    const onValueChange = vi.fn<(value: string | string[] | undefined) => void>();

    page(
      <SelectCustomer.Content
        contacts={contacts}
        mode="multiple"
        value={['c1']}
        onValueChange={onValueChange}
      />,
    );
    await settle();

    expect(rows()).toEqual(['SSaraa']);

    pick('SSaraa');
    expect(onValueChange).toHaveBeenCalledWith(['c1', 'c2']);
  });

  it('shows the filtered customers on the bar, and changes them in the address', async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();

    const bar = page(
      <Filter id="tr">
        <SelectCustomer.FilterBar
          filterKey="customerId"
          mode="multiple"
          label="Customer"
          contacts={contacts}
        />
      </Filter>,
      '?customerId=c1,c2',
      onUrlUpdate,
    );

    await settle();
    expect(bar.textContent).toContain('Customer');
    expect(bar.textContent).toContain('2 customers');

    act(() => {
      [...bar.querySelectorAll('button')]
        .find((button) => button.textContent === '2 customers')
        ?.click();
    });
    await settle();
    // Each picked customer is a badge on top of the list; its x unpicks it.
    act(() =>
      document.querySelector<HTMLElement>('[cmdk-list] button[aria-label="Remove"]')?.click(),
    );
    await settle();

    expect(onUrlUpdate.mock.lastCall?.[0].queryString).toBe('?customerId=c2');
  });
});

/** The catalog's product buttons, by the codes they start with. */
const listed = () =>
  [...document.querySelectorAll('button')]
    .map((button) => button.textContent ?? '')
    .filter((text) => /^(FL|SG|ST)/.test(text));

describe('SelectProductsBulk', () => {
  it('puts the most stocked first, and adds the picked products', async () => {
    const onSelect = vi.fn<(ids: string[]) => void>();

    page(
      <SelectProductsBulk
        open
        products={products}
        onSelect={onSelect}
        remainders={(ids) => ({
          queryKey: ['remainders', ids],
          queryFn: async () => ({ p1: 2, p2: 0, p3: 9 }),
        })}
      />,
    );
    await settle();

    expect(listed().map((text) => text.slice(0, 2))).toEqual(['ST', 'FL', 'SG']);
    expect(listed()[0]).toContain('9 pcs');

    act(() => {
      [...document.querySelectorAll('button')]
        .find((button) => button.textContent?.startsWith('ST'))
        ?.click();
    });
    act(() => {
      [...document.querySelectorAll('button')]
        .find((button) => button.textContent === 'Add Many Products')
        ?.click();
    });
    await settle();

    expect(onSelect).toHaveBeenCalledWith(['p3'], [PRODUCTS[2]]);
  });
});
