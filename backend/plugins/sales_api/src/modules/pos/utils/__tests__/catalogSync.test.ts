import { sendTRPCMessage } from 'erxes-api-shared/utils';
import type { IModels } from '~/connectionResolvers';
import type { IPosDocument } from '../../@types/pos';
import { getProductsData } from '../../routes';

jest.mock('~/connectionResolvers', () => ({ generateModels: jest.fn() }));
jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));
jest.mock('../../utils', () => ({
  getChildCategories: jest.fn(async () => []),
  calcProductsTaxRule: jest.fn(
    async (_subdomain: string, _config: unknown, products: { _id: string }[]) =>
      Object.fromEntries(
        products.map((product) => [product._id, { ...product }]),
      ),
  ),
}));
jest.mock('../getProductPricing', () => ({
  getProductPricing: jest.fn(async () => ({})),
}));
const sendMessage = jest.mocked(sendTRPCMessage);

it.each([{ productIds: ['included'] }, { tagIds: ['parent-tag'] }])(
  'syncs only the selected products and their direct category for %j',
  async (selection) => {
    const group = { _id: 'group', ...selection, excludedProductIds: [] };
    const models = {
      ProductGroups: { groups: jest.fn(async () => [group]) },
    } as unknown as IModels;
    const pos = {
      _id: 'pos',
      checkExcludeCategoryIds: [],
      isCheckRemainder: false,
    } as unknown as IPosDocument;
    const product = {
      _id: 'included',
      categoryId: 'leaf-category',
      tagIds: ['child-tag'],
      unitPrice: 100,
    };
    sendMessage.mockImplementation(async ({ module, action, input }) => {
      if (module === 'mnConfigs') return {};
      if (module === 'tags')
        return [{ _id: 'parent-tag' }, { _id: 'child-tag' }];
      if (module === 'products') return [product];
      if (module === 'productCategories' && action === 'find') {
        expect(input.query).toEqual({ _id: { $in: ['leaf-category'] } });
        return [
          { _id: 'leaf-category', parentId: 'parent-category', order: 'P/L/' },
        ];
      }
      throw new Error(`Unexpected request ${module}.${action}`);
    });
    const data = await getProductsData('tenant', models, pos);
    expect(data).toHaveLength(1);
    expect(data[0].categories).toEqual([
      expect.objectContaining({
        _id: 'leaf-category',
        parentId: 'parent-category',
        products: [expect.objectContaining(product)],
      }),
    ]);
    expect(
      sendMessage.mock.calls.every(
        ([request]) => request.subdomain === 'tenant',
      ),
    ).toBe(true);
    sendMessage.mockReset();
  },
);

it('syncs the union minus all exclusions and reuses the resolved category tree', async () => {
  const { default: sift } = await import('sift');
  const group = {
    _id: 'group',
    categoryIds: ['root'],
    excludedCategoryIds: ['blocked-category'],
    tagIds: ['tag'],
    excludeTagIds: ['blocked-tag'],
    productIds: ['explicit', 'explicit-excluded'],
    excludedProductIds: ['blocked-product'],
  };
  const models = {
    ProductGroups: { groups: async () => [group] },
  } as unknown as IModels;
  const pos = {
    _id: 'pos',
    checkExcludeCategoryIds: [],
    isCheckRemainder: false,
  } as unknown as IPosDocument;
  const products = [
    { _id: 'category-match', categoryId: 'child', tagIds: [], unitPrice: 100 },
    {
      _id: 'tag-match',
      categoryId: 'tag-category',
      tagIds: ['tag-child'],
      unitPrice: 100,
    },
    {
      _id: 'explicit',
      categoryId: 'explicit-category',
      tagIds: [],
      unitPrice: 100,
    },
    {
      _id: 'explicit-excluded',
      categoryId: 'child',
      tagIds: ['blocked-tag-child'],
      unitPrice: 100,
    },
    { _id: 'blocked-product', categoryId: 'child', tagIds: [], unitPrice: 100 },
    {
      _id: 'blocked-category-product',
      categoryId: 'blocked-category-child',
      tagIds: ['tag-child'],
      unitPrice: 100,
    },
    {
      _id: 'unrelated',
      categoryId: 'unrelated-category',
      tagIds: [],
      unitPrice: 100,
    },
  ];
  sendMessage.mockReset();
  sendMessage.mockImplementation(async ({ module, action, input }) => {
    if (module === 'mnConfigs') return {};
    if (module === 'tags') {
      const ids: string[] = input.query._id.$in;
      return ids.flatMap((id) => [{ _id: id }, { _id: `${id}-child` }]);
    }
    if (module === 'productCategories' && action === 'withChilds') {
      const ids: string[] = input.ids;
      return ids.includes('root')
        ? ['root', 'child', 'blocked-category', 'blocked-category-child'].map(
            (_id) => ({ _id }),
          )
        : ['blocked-category', 'blocked-category-child'].map((_id) => ({
            _id,
          }));
    }
    if (module === 'products') return products.filter(sift(input.query));
    if (module === 'productCategories' && action === 'find') {
      const ids: string[] = input.query._id.$in;
      return ids.map((_id) => ({ _id, name: _id, order: `${_id}/` }));
    }
    throw new Error(`Unexpected request ${module}.${action}`);
  });
  const data = await getProductsData('tenant', models, pos);
  expect(data[0].categories.map(({ _id }) => _id)).toEqual([
    'root',
    'child',
    'tag-category',
    'explicit-category',
  ]);
  expect(
    data[0].categories.flatMap(({ products: items }) =>
      items.map(({ _id }) => _id),
    ),
  ).toEqual(['category-match', 'tag-match', 'explicit']);
  expect(
    sendMessage.mock.calls.filter(
      ([request]) => request.action === 'withChilds',
    ),
  ).toHaveLength(2);
  expect(
    sendMessage.mock.calls.filter(([request]) => request.module === 'products'),
  ).toHaveLength(1);
});
