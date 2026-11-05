import sift from 'sift';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { getProductGroupSelection } from '../productGroupFilter';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));
const sendMessage = jest.mocked(sendTRPCMessage);
const descendants: Record<string, string[]> = {
  category: [
    'category',
    'category-child',
    'blocked-category',
    'blocked-category-child',
  ],
  'blocked-category': ['blocked-category', 'blocked-category-child'],
  tag: ['tag', 'tag-child', 'blocked-tag', 'blocked-tag-child'],
  'blocked-tag': ['blocked-tag', 'blocked-tag-child'],
};
const products = [
  { _id: 'category-match', categoryId: 'category-child', tagIds: [] },
  { _id: 'tag-match', categoryId: 'other', tagIds: ['tag-child'] },
  { _id: 'explicit', categoryId: 'other', tagIds: [] },
  {
    _id: 'blocked-by-tag',
    categoryId: 'category-child',
    tagIds: ['blocked-tag-child'],
  },
  {
    _id: 'blocked-by-category',
    categoryId: 'blocked-category-child',
    tagIds: ['tag-child'],
  },
  {
    _id: 'blocked-product',
    categoryId: 'category-child',
    tagIds: ['tag-child'],
  },
  { _id: 'unrelated', categoryId: 'other', tagIds: [] },
  {
    _id: 'deleted',
    categoryId: 'category-child',
    tagIds: [],
    status: 'deleted',
  },
];

beforeEach(() => {
  sendMessage.mockReset();
  sendMessage.mockImplementation(async ({ module, input }) => {
    const ids: string[] =
      module === 'productCategories' ? input.ids : input.query._id.$in;
    return ids.flatMap((id) => descendants[id] || [id]).map((_id) => ({ _id }));
  });
});

it('unions category/tag trees and products, then excludes globally', async () => {
  const selection = await getProductGroupSelection('tenant', {
    categoryIds: ['category'],
    excludedCategoryIds: ['blocked-category'],
    tagIds: ['tag'],
    excludeTagIds: ['blocked-tag'],
    productIds: ['explicit'],
    excludedProductIds: ['blocked-product'],
  });
  expect(selection.categoryIds).toEqual(['category', 'category-child']);
  expect(products.filter(sift(selection.query)).map(({ _id }) => _id)).toEqual([
    'category-match',
    'tag-match',
    'explicit',
  ]);
  expect(sendMessage).toHaveBeenCalledTimes(4);
  expect(
    sendMessage.mock.calls.every(
      ([request]) => request.subdomain === 'tenant' && request.throwOnError,
    ),
  ).toBe(true);
});

it('excludes descendant tags from category-selected products without any include tag', async () => {
  const { query } = await getProductGroupSelection('tenant', {
    categoryIds: ['category'],
    excludeTagIds: ['blocked-tag'],
    excludedProductIds: [],
  });
  expect(products.filter(sift(query)).map(({ _id }) => _id)).toEqual([
    'category-match',
    'blocked-by-category',
    'blocked-product',
  ]);
});

it('excludes descendant categories from tag-selected products without any include category', async () => {
  const { query } = await getProductGroupSelection('tenant', {
    tagIds: ['tag'],
    excludedCategoryIds: ['blocked-category'],
    excludedProductIds: [],
  });
  expect(products.filter(sift(query)).map(({ _id }) => _id)).toEqual([
    'tag-match',
    'blocked-by-tag',
    'blocked-product',
  ]);
});

it('does not widen a fully excluded include tree to the entire catalog', async () => {
  const { query } = await getProductGroupSelection('tenant', {
    categoryIds: ['category'],
    excludedCategoryIds: ['category'],
    excludedProductIds: [],
  });
  expect(products.filter(sift(query))).toEqual([]);
});

it('supports explicit products and skips empty tree lookups', async () => {
  const { query } = await getProductGroupSelection('tenant', {
    productIds: ['explicit'],
    excludedProductIds: [],
  });
  expect(products.filter(sift(query)).map(({ _id }) => _id)).toEqual([
    'explicit',
  ]);
  expect(sendMessage).not.toHaveBeenCalled();
});

it('propagates lookup failures instead of syncing a partial catalog', async () => {
  sendMessage.mockRejectedValue(new Error('Core unavailable'));
  await expect(
    getProductGroupSelection('tenant', {
      tagIds: ['tag'],
      excludedProductIds: [],
    }),
  ).rejects.toThrow('Core unavailable');
});

it('exclusions override even explicitly included products', async () => {
  const { query } = await getProductGroupSelection('tenant', {
    productIds: [
      'explicit',
      'blocked-by-tag',
      'blocked-by-category',
      'blocked-product',
    ],
    excludedCategoryIds: ['blocked-category'],
    excludeTagIds: ['blocked-tag'],
    excludedProductIds: ['blocked-product'],
  });
  expect(products.filter(sift(query)).map(({ _id }) => _id)).toEqual([
    'explicit',
  ]);
});
