/** @jest-environment jsdom */
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { GET_PACKAGE_CHOSEN_PRODUCTS } from '../../graphql/packageQueries';
import {
  usePackageChosenProducts,
  usePackageProductsTotal,
} from '../usePackageChosenProducts';

const product = (_id: string, unitPrice: number) => ({
  __typename: 'Product',
  _id,
  name: `Product ${_id}`,
  code: _id,
  unitPrice,
});

const wrapperWith =
  (mocks: MockedResponse[]) =>
  ({ children }: { children: ReactNode }) =>
    <MockedProvider mocks={mocks}>{children}</MockedProvider>;

// More than the 100 a `productsMain` page allows.
const MANY_IDS = Array.from({ length: 150 }, (_, index) => `p${index}`);
const MANY_ITEMS = MANY_IDS.map((productId) => ({ productId, quantity: 2 }));
const ONE_ID = ['p1'];

describe('usePackageProductsTotal', () => {
  it('prices every product of a package past 100, in one request', async () => {
    const sent: Record<string, unknown>[] = [];
    const { result } = renderHook(() => usePackageProductsTotal(MANY_ITEMS), {
      wrapper: wrapperWith([
        {
          request: { query: GET_PACKAGE_CHOSEN_PRODUCTS },
          variableMatcher: (variables) => {
            sent.push(variables as Record<string, unknown>);
            return true;
          },
          result: { data: { products: MANY_IDS.map((id) => product(id, 3)) } },
        },
      ]),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeUndefined();
    expect(result.current.total).toBe(150 * 2 * 3);
    expect(sent).toEqual([{ ids: MANY_IDS }]);
  });
});

describe('usePackageChosenProducts', () => {
  it('reports a failed load and loads the products again on retry', async () => {
    const request = {
      query: GET_PACKAGE_CHOSEN_PRODUCTS,
      variables: { ids: ONE_ID },
    };
    const { result } = renderHook(() => usePackageChosenProducts(ONE_ID), {
      wrapper: wrapperWith([
        { request, error: new Error('Network down') },
        { request, result: { data: { products: [product('p1', 5)] } } },
      ]),
    });

    await waitFor(() =>
      expect(result.current.error?.message).toBe('Network down'),
    );
    expect(result.current.loading).toBe(false);

    act(() => result.current.retry());

    await waitFor(() =>
      expect(result.current.products).toEqual([product('p1', 5)]),
    );
    expect(result.current.error).toBeUndefined();
  });

  it('asks for nothing without products', () => {
    const { result } = renderHook(() => usePackageChosenProducts([]), {
      wrapper: wrapperWith([]),
    });

    expect(result.current).toMatchObject({
      products: [],
      loading: false,
      error: undefined,
    });
  });
});
