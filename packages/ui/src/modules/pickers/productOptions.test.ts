// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import type { ProductChoice, ProductSearchQueries } from '../records/products';
import { useProductOptions } from './LookupPicker';

const PRODUCTS: ProductChoice[] = [
  { id: 'p1', name: 'iPhone 15', code: 'IP15' },
  { id: 'p2', name: 'Phone case', code: null },
  { id: 'p3', name: 'Charger', code: 'CH' },
];

const asked: unknown[] = [];

const products: ProductSearchQueries = {
  search: (search) => ({
    queryKey: ['products', search],
    queryFn: async () => {
      asked.push({ search });

      const term = search?.toLowerCase() ?? '';

      return { data: PRODUCTS.filter((product) => product.name.toLowerCase().includes(term)) };
    },
  }),
  byIds: (ids) => ({
    queryKey: ['products', ids],
    queryFn: async () => {
      asked.push({ ids });

      return { data: PRODUCTS.filter((product) => ids.includes(product.id)) };
    },
  }),
};

beforeAll(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});

const labels = async (enabled: boolean, picked: string[], search: string, count: number) => {
  let shown: string[] = [];

  const Probe = () => {
    shown = useProductOptions(products, enabled, picked, search).options.map(
      (option) => option.label,
    );

    return null;
  };

  const root = createRoot(document.createElement('div'));
  const client = new QueryClient();

  await act(async () => {
    root.render(createElement(QueryClientProvider, { client }, createElement(Probe)));
  });
  await vi.waitFor(() => expect(shown).toHaveLength(count));
  act(() => root.unmount());

  return shown;
};

describe('useProductOptions', () => {
  it('lists the picked products first, with their codes, then the matches of the search', async () => {
    expect(await labels(true, ['p3'], 'phone', 3)).toEqual([
      'Charger · CH',
      'iPhone 15 · IP15',
      'Phone case',
    ]);
    expect(asked).toContainEqual({ ids: ['p3'] });
    expect(asked).toContainEqual({ search: 'phone' });
  });

  it('asks nothing for a field that is not a product', async () => {
    const before = asked.length;

    expect(await labels(false, ['p1'], 'phone', 0)).toEqual([]);
    expect(asked).toHaveLength(before);
  });
});
