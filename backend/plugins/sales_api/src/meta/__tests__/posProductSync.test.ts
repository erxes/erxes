import { sendTRPCMessage } from 'erxes-api-shared/utils';
import type { IModels } from '~/connectionResolvers';
import { sendPosclientMessage } from '~/initWorker';
import { getProductsData } from '~/modules/pos/routes';
import { syncPosProductGroups } from '../productUtils';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));
jest.mock('~/initWorker', () => ({ sendPosclientMessage: jest.fn() }));
jest.mock('~/modules/pos/routes', () => ({ getProductsData: jest.fn() }));
jest.mock('~/modules/pos/utils', () => ({ getChildCategories: jest.fn() }));

const pos = { _id: 'pos', token: 'token' };
const groups = [{ tagIds: ['parent-tag'] }];
const models = {
  Pos: { find: () => ({ lean: async () => [pos] }) },
  ProductGroups: {
    distinct: async () => ['pos'],
    find: () => ({ lean: async () => groups }),
  },
} as unknown as IModels;
const sendMessage = jest.mocked(sendPosclientMessage);
const getCatalog = jest.mocked(getProductsData);

beforeEach(() => {
  jest.clearAllMocks();
  getCatalog.mockResolvedValue([]);
});

it('adds the direct category before an included product', async () => {
  const product = { _id: 'product', categoryId: 'leaf', unitPrice: 100 };
  // Mock only the public catalog's data; Mongoose document methods are not consumed here.
  getCatalog.mockResolvedValue([
    { categories: [{ _id: 'leaf', products: [product] }] },
  ] as unknown as Awaited<ReturnType<typeof getProductsData>>);
  jest
    .mocked(sendTRPCMessage)
    .mockResolvedValue({ _id: 'leaf', parentId: 'parent' });
  await syncPosProductGroups(
    'tenant',
    models,
    'productsEdit',
    { _id: 'product' },
    product,
  );
  expect(sendMessage.mock.calls.map(([request]) => request.input.type)).toEqual(
    ['productCategory', 'product'],
  );
  expect(sendMessage.mock.calls[0][0].input.updatedDocument).toEqual({
    _id: 'leaf',
    parentId: 'parent',
  });
  expect(
    sendMessage.mock.calls.every(
      ([request]) =>
        request.subdomain === 'tenant' &&
        request.pos === pos &&
        request.throwOnError,
    ),
  ).toBe(true);
});

it('removes a product when it stops matching the current filters', async () => {
  await syncPosProductGroups(
    'tenant',
    models,
    'productsEdit',
    { _id: 'product' },
    {},
  );
  expect(sendMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      input: { type: 'productsRemove', productIds: ['product'] },
      pos,
    }),
  );
});

it('removes deleted product ids without relying on their already-deleted Core documents', async () => {
  await syncPosProductGroups(
    'tenant',
    models,
    'productsRemove',
    { productIds: ['deleted'] },
    {},
  );
  expect(sendMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      input: { type: 'productsRemove', productIds: ['deleted'] },
    }),
  );
});

it.each([
  ['tagsTag', { type: 'core:product' }],
  ['tagsEdit', {}],
  ['tagsRemove', {}],
  ['productCategoriesEdit', {}],
])('resyncs membership after %s', async (name, args) => {
  await syncPosProductGroups('tenant', models, name, args, {});
  expect(sendMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      input: { type: 'productGroups', token: 'token', productGroups: [] },
      throwOnError: true,
    }),
  );
});

it('ignores assigning tags to non-products', async () => {
  await syncPosProductGroups(
    'tenant',
    models,
    'tagsTag',
    { type: 'sales:deal' },
    {},
  );
  expect(sendMessage).not.toHaveBeenCalled();
});
