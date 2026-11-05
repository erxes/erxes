import sift from 'sift';
import {
  cursorPaginateAggregation,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import type { IContext } from '~/connectionResolvers';
import { productQueries } from '../product';

jest.mock('erxes-api-shared/core-modules', () => ({
  buildPropertyFilter: jest.fn(),
}));
jest.mock('@/products/utils', () => ({
  getSimilaritiesProducts: jest.fn(),
  getSimilaritiesProductsCount: jest.fn(),
}));
jest.mock('erxes-api-shared/utils', () => ({
  sendTRPCMessage: jest.fn(),
  escapeRegExp: (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  cursorPaginate: jest.fn(),
  cursorPaginateAggregation: jest.fn(async () => ({ list: [] })),
  defaultPaginate: jest.fn(async (value: unknown) => value),
}));

it('applies the same pipeline union and exclusions to products, productsMain and count', async () => {
  const products = [
    { _id: 'category-match', categoryId: 'child', tagIds: [] },
    { _id: 'tag-match', categoryId: 'other', tagIds: ['tag'] },
    { _id: 'explicit', categoryId: 'other', tagIds: [] },
    { _id: 'excluded-tag', categoryId: 'child', tagIds: ['blocked-child'] },
    { _id: 'excluded-product', categoryId: 'child', tagIds: ['tag'] },
    { _id: 'unrelated', categoryId: 'other', tagIds: [] },
  ];
  jest.mocked(sendTRPCMessage).mockResolvedValue({
    initialCategoryIds: ['category'],
    tagIds: ['tag'],
    productIds: ['explicit', 'excluded-tag'],
    excludeTagIds: ['blocked'],
    excludeProductIds: ['excluded-product'],
  });
  const find = jest.fn((query: Record<string, unknown>) => ({
    sort: () => ({ lean: async () => products.filter(sift(query)) }),
  }));
  const countDocuments = jest.fn(
    async (query: Record<string, unknown>) =>
      products.filter(sift(query)).length,
  );
  const getChildCategories = jest.fn(async () => [
    { _id: 'category' },
    { _id: 'child' },
  ]);
  const tags = [
    { _id: 'tag', order: 'T/' },
    { _id: 'blocked', order: 'B/' },
    { _id: 'blocked-child', order: 'B/C/' },
  ];
  const context = {
    subdomain: 'tenant',
    commonQuerySelector: {},
    models: {
      Products: { find, countDocuments },
      ProductCategories: { find: async () => [], getChildCategories },
      Tags: {
        find: (query: Record<string, unknown>) => ({
          lean: async () => tags.filter(sift(query)),
        }),
      },
    },
  } as unknown as IContext;
  const expected = ['category-match', 'tag-match', 'explicit'];
  expect(
    await productQueries.products(
      undefined,
      { pipelineId: 'pipeline' },
      context,
    ),
  ).toEqual(products.filter(({ _id }) => expected.includes(_id)));
  await productQueries.productsMain(
    undefined,
    { pipelineId: 'pipeline' },
    context,
  );
  expect(
    await productQueries.productsTotalCount(
      undefined,
      { pipelineId: 'pipeline' },
      context,
    ),
  ).toBe(expected.length);
  const pipeline = jest.mocked(cursorPaginateAggregation).mock.calls[0][0]
    .pipeline;
  const match = pipeline.find((stage) => '$match' in stage);
  expect(match).toEqual({ $match: find.mock.calls[0][0] });
  expect(countDocuments.mock.calls[0][0]).toEqual(find.mock.calls[0][0]);
  expect(getChildCategories).toHaveBeenCalledTimes(1);
  expect(sendTRPCMessage).toHaveBeenCalledTimes(1);
});
