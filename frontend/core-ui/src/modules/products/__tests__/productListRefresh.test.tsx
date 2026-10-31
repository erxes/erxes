/** @jest-environment jsdom */
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable,
  useQuery,
} from '@apollo/client';
import { getOperationAST } from 'graphql';
import type { PropsWithChildren } from 'react';
import { productsQueries } from '@/products/graphql';
import { useAddCategory } from '../product-category/add-category/hooks/useAddCategory';
import { useBundleConditionAdd } from '../settings/hooks/useBundleConditionAdd';
import { BUNDLE_CONDITIONS } from '../settings/graphql/queries/getBundleConditions';
import { useAddPackage } from '../packages/hooks/usePackageMutations';
import { GET_PACKAGES } from '../packages/graphql/packageQueries';

jest.mock(
  '@/products/graphql',
  () => {
    const { gql: document } =
      jest.requireActual<typeof import('@apollo/client')>('@apollo/client');
    return {
      productsQueries: {
        productCategories: document`
    query productCategories($searchValue: String) {
      productCategories(searchValue: $searchValue) { _id name __typename }
    }
  `,
        productCategoriesTotalCount: document`
          query ProductCategoriesTotalCount($searchValue: String) {
            productCategoriesTotalCount(searchValue: $searchValue)
          }
        `,
      },
    };
  },
  { virtual: true },
);

const record = {
  _id: 'created',
  name: 'QA new record',
  code: 'QA-NEW',
  description: '',
  coverImage: '',
  products: [],
  tagIds: [],
  price: 0,
  percent: 0,
  totalPrice: 0,
  status: 'active',
  createdAt: '2026-10-31T00:00:00.000Z',
  updatedAt: '2026-10-31T00:00:00.000Z',
  userId: null,
  isDefault: false,
};
const pageInfo = {
  hasNextPage: false,
  hasPreviousPage: false,
  startCursor: null,
  endCursor: null,
  __typename: 'PageInfo',
};

const cases = [
  {
    name: 'product categories',
    query: productsQueries.productCategories,
    countQuery: productsQueries.productCategoriesTotalCount,
    response: (created: boolean) => ({
      productCategoriesTotalCount: created ? 1 : 0,
      productCategories: created
        ? [
            {
              _id: record._id,
              name: record.name,
              __typename: 'ProductCategory',
            },
          ]
        : [],
    }),
    mutation: {
      productCategoriesAdd: { _id: record._id, __typename: 'ProductCategory' },
    },
    useCreate: () => {
      const { productCategoriesAdd } = useAddCategory();
      return () =>
        productCategoriesAdd({
          variables: { name: record.name, code: record.code },
        });
    },
  },
  {
    name: 'bundle conditions',
    query: BUNDLE_CONDITIONS,
    countQuery: undefined,
    response: (created: boolean) => ({
      bundleConditions: created
        ? [{ ...record, __typename: 'BundleCondition' }]
        : [],
    }),
    mutation: {
      bundleConditionAdd: { ...record, __typename: 'BundleCondition' },
    },
    useCreate: () => {
      const { bundleConditionAdd } = useBundleConditionAdd();
      return () =>
        bundleConditionAdd({
          variables: { name: record.name, code: record.code },
        });
    },
  },
  {
    name: 'packages',
    query: GET_PACKAGES,
    countQuery: undefined,
    response: (created: boolean) => ({
      productPackages: {
        list: created ? [{ ...record, __typename: 'ProductPackage' }] : [],
        totalCount: created ? 1 : 0,
        pageInfo,
        __typename: 'ProductPackageList',
      },
    }),
    mutation: {
      productPackagesAdd: { ...record, __typename: 'ProductPackage' },
    },
    useCreate: () => {
      const { addPackage } = useAddPackage();
      return () =>
        addPackage({ variables: { name: record.name, products: [] } });
    },
  },
];

it.each(cases)(
  'refreshes the active filtered $name query after creation',
  async ({ query, countQuery, response, mutation, useCreate }) => {
    let created = false;
    const requests: Record<string, unknown>[] = [];
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: new ApolloLink(
        (operation) =>
          new Observable((observer) => {
            if (getOperationAST(operation.query)?.operation === 'mutation') {
              created = true;
              observer.next({ data: mutation });
            } else {
              requests.push({
                ...operation.variables,
                operationName: operation.operationName,
              });
              observer.next({ data: response(created) });
            }
            observer.complete();
          }),
      ),
    });
    const variables = { searchValue: 'QA' };
    const wrapper = ({ children }: PropsWithChildren) => (
      <ApolloProvider client={client}>{children}</ApolloProvider>
    );
    const { result } = renderHook(
      () => {
        useQuery(query, { variables });
        useQuery(countQuery || query, { variables, skip: !countQuery });
        return useCreate();
      },
      { wrapper },
    );

    const operationName = getOperationAST(query)?.name?.value;
    await waitFor(() =>
      expect(requests).toContainEqual({ ...variables, operationName }),
    );
    await act(async () => {
      await result.current();
    });
    await waitFor(() =>
      expect(
        requests.filter(
          (request) =>
            request.searchValue === 'QA' &&
            request.operationName === operationName,
        ),
      ).toHaveLength(2),
    );
    expect(JSON.stringify(client.readQuery({ query, variables }))).toContain(
      'QA new record',
    );
    if (countQuery) {
      expect(client.readQuery({ query: countQuery, variables })).toEqual({
        productCategoriesTotalCount: 1,
      });
    }
  },
);
