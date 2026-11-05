import sift from 'sift';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import type { IContext, IModels } from '~/connectionResolvers';
import {
  getPipelineProductSelection,
  getPipelineProductSelectionForRequest,
} from '../pipelineProductFilter';

jest.mock('erxes-api-shared/utils', () => ({
  sendTRPCMessage: jest.fn(),
  escapeRegExp: (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
}));

const categoryTree: Record<string, string[]> = {
  category: [
    'category',
    'category-child',
    'blocked-category',
    'blocked-category-child',
  ],
  'blocked-category': ['blocked-category', 'blocked-category-child'],
};
const scope = {
  initialCategoryIds: ['category'],
  excludeCategoryIds: ['blocked-category'],
  tagIds: ['tag'],
  excludeTagIds: ['blocked-tag'],
  productIds: ['explicit'],
  excludeProductIds: ['blocked-product'],
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
];
const makeModels = () => {
  const tags = [
    { _id: 'tag', order: 'A.+/' },
    { _id: 'tag-child', order: 'A.+/B/' },
    { _id: 'unrelated-tag', order: 'ABC/B/' },
    { _id: 'blocked-tag', order: 'A.+/X/' },
    { _id: 'blocked-tag-child', order: 'A.+/X/Y/' },
  ];
  const find = jest.fn(
    (query: {
      _id?: { $in: string[] };
      $or?: { order: { $regex: string } }[];
    }) => ({
      lean: async () =>
        tags.filter((tag) =>
          query._id
            ? query._id.$in.includes(tag._id)
            : query.$or?.some(({ order }) =>
                new RegExp(order.$regex).test(tag.order),
              ),
        ),
    }),
  );
  const getChildCategories = jest.fn(async (ids: string[]) =>
    ids.flatMap((id) => categoryTree[id] || [id]).map((_id) => ({ _id })),
  );
  return {
    models: {
      Tags: { find },
      ProductCategories: { getChildCategories },
    } as unknown as Pick<IModels, 'Tags' | 'ProductCategories'>,
    find,
    getChildCategories,
  };
};

beforeEach(() => jest.clearAllMocks());

it('unions category/tag trees and products, then applies every exclusion', async () => {
  const { models } = makeModels();
  const selection = await getPipelineProductSelection(models, scope);
  expect(selection.categoryIds).toEqual(categoryTree.category);
  expect(
    products.filter(sift({ $and: selection.conditions })).map(({ _id }) => _id),
  ).toEqual(['category-match', 'tag-match', 'explicit']);
});

it.each([
  [
    { initialCategoryIds: ['category'], excludeTagIds: ['blocked-tag'] },
    ['category-match', 'blocked-by-category', 'blocked-product'],
  ],
  [
    { tagIds: ['tag'], excludeCategoryIds: ['blocked-category'] },
    ['tag-match', 'blocked-by-tag', 'blocked-product'],
  ],
  [
    {
      productIds: products.map(({ _id }) => _id),
      excludeCategoryIds: ['blocked-category'],
      excludeTagIds: ['blocked-tag'],
      excludeProductIds: ['blocked-product'],
    },
    ['category-match', 'tag-match', 'explicit', 'unrelated'],
  ],
])('applies cross-field exclusions for %j', async (pipeline, expected) => {
  const { models } = makeModels();
  const { conditions } = await getPipelineProductSelection(models, pipeline);
  expect(
    products.filter(sift({ $and: conditions })).map(({ _id }) => _id),
  ).toEqual(expected);
});

it('does not broaden a fully excluded include tree', async () => {
  const { models } = makeModels();
  const { conditions } = await getPipelineProductSelection(models, {
    initialCategoryIds: ['category'],
    excludeCategoryIds: ['category'],
  });
  expect(products.filter(sift({ $and: conditions }))).toEqual([]);
});

it('leaves unconfigured pipelines unrestricted and skips empty lookups', async () => {
  const { models, find, getChildCategories } = makeModels();
  expect((await getPipelineProductSelection(models)).conditions).toEqual([]);
  expect(find).not.toHaveBeenCalled();
  expect(getChildCategories).not.toHaveBeenCalled();
});

it('keeps unknown include tags restrictive', async () => {
  const { models } = makeModels();
  const { conditions } = await getPipelineProductSelection(models, {
    tagIds: ['missing'],
  });
  expect(products.filter(sift({ $and: conditions }))).toEqual([]);
});

it('resolves trees once per request and pipeline, including priority sorting', async () => {
  const { models, find, getChildCategories } = makeModels();
  jest.mocked(sendTRPCMessage).mockResolvedValue(scope);
  const context = { subdomain: 'tenant', models } as unknown as IContext;
  const first = getPipelineProductSelectionForRequest(context, 'pipeline');
  expect(getPipelineProductSelectionForRequest(context, 'pipeline')).toBe(
    first,
  );
  await first;
  expect(sendTRPCMessage).toHaveBeenCalledTimes(1);
  expect(find).toHaveBeenCalledTimes(4);
  expect(getChildCategories).toHaveBeenCalledTimes(2);
  expect(sendTRPCMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      subdomain: 'tenant',
      input: {
        query: { _id: 'pipeline' },
        fields: expect.objectContaining({
          initialCategoryIds: 1,
          productIds: 1,
          tagIds: 1,
          excludeTagIds: 1,
        }),
      },
    }),
  );
  await getPipelineProductSelectionForRequest(
    { subdomain: 'other-tenant', models } as unknown as IContext,
    'pipeline',
  );
  expect(sendTRPCMessage).toHaveBeenCalledTimes(2);
  expect(getChildCategories).toHaveBeenCalledTimes(4);
});
