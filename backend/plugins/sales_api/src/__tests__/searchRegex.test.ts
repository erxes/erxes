import type { GraphQLResolveInfo } from 'graphql';
import sift from 'sift';
import { cursorPaginate, sendTRPCMessage } from 'erxes-api-shared/utils';
import type { IContext, IModels } from '../connectionResolvers';
import { addressQueries } from '../modules/ecommerce/graphql/resolvers/queries/address';
import orderQueries from '../modules/pos/graphql/resolvers/queries/orders';
import { generateFilter } from '../modules/sales/graphql/resolvers/queries/deals';

jest.mock('erxes-api-shared/utils', () => ({
  escapeRegExp:
    jest.requireActual<typeof import('lodash')>('lodash').escapeRegExp,
  cursorPaginate: jest.fn().mockResolvedValue({ list: [] }),
  sendTRPCMessage: jest.fn().mockResolvedValue([]),
}));

type Query = Record<string, unknown>;
const findOrders = jest
  .fn<{ countDocuments: () => Promise<number> }, [Query]>()
  .mockReturnValue({
    countDocuments: jest.fn().mockResolvedValue(0),
  });
const context = {
  subdomain: 'tenant',
  user: { _id: 'user' },
  checkPermission: jest.fn(),
  models: {
    Address: {},
    PosOrders: {
      find: findOrders,
      aggregate: jest.fn().mockResolvedValue([]),
    },
  },
} as unknown as IContext;

const getDealFilter = (search: string) =>
  generateFilter({} as IModels, 'tenant', 'user', {
    search,
    noSkipArchive: true,
  });

const searches: Array<{
  name: string;
  fields: string[];
  getFilter: (search: string) => Promise<Query>;
}> = [
  {
    name: 'deal',
    fields: ['name', 'number', 'description'],
    getFilter: getDealFilter,
  },
  {
    name: 'POS order',
    fields: ['number', 'origin', 'description'],
    getFilter: async (search) => {
      await orderQueries.posOrdersTotalCount(undefined, { search }, context);
      return findOrders.mock.calls[0][0];
    },
  },
  {
    name: 'address',
    fields: ['address1', 'address2', 'city', 'district', 'street', 'phone'],
    getFilter: async (searchValue) => {
      await addressQueries.addressList(
        undefined,
        { searchValue },
        context,
        {} as GraphQLResolveInfo,
      );
      const query = jest.mocked(cursorPaginate).mock.calls[0][0].query;
      if (!query) throw new Error('Expected address query');
      return query;
    },
  },
];

beforeEach(() => jest.clearAllMocks());

describe.each(searches)('$name search', ({ fields, getFilter }) => {
  it.each(['(', '.*', 'a.b', '[1]', 'x+y', 'a\\b'])(
    'matches %s literally and case-insensitively in every searched field',
    async (search) => {
      const matches = sift(await getFilter(search));
      for (const field of fields) {
        expect(
          matches({ [field]: `before ${search.toUpperCase()} after` }),
        ).toBe(true);
        expect(matches({ [field]: 'unrelated aXb xxxy 1 ab' })).toBe(false);
      }
    },
  );

  it('keeps an empty search unrestricted', async () => {
    const query = await getFilter('');
    expect(query.$or).toBeUndefined();
    expect(sift(query)({})).toBe(true);
  });
});

it('preserves formatted customer-phone matching and filters by the deal customer', async () => {
  jest.mocked(sendTRPCMessage).mockResolvedValueOnce([{ _id: 'customer' }]);
  const filter = await getDealFilter('+976 (9911) 2233');
  const request = jest.mocked(sendTRPCMessage).mock.calls[0][0];
  expect(request.subdomain).toBe('tenant');
  expect(request.action).toBe('findActiveCustomers');
  const matches = sift(request.input.query);
  expect(matches({ primaryPhone: '(976) 9911-2233' })).toBe(true);
  expect(matches({ phones: ['976.9911.2233'] })).toBe(true);
  expect(matches({ primaryPhone: '976 9911 2244' })).toBe(false);
  // Deals keep their customer themselves; no relation lookup.
  expect(filter.$or).toContainEqual({ customerId: { $in: ['customer'] } });
  expect(sendTRPCMessage).toHaveBeenCalledTimes(1);
});

it.each(['INV9911', '9911.*'])(
  'does not treat %s as a phone search',
  async (search) => {
    await getDealFilter(search);
    expect(sendTRPCMessage).not.toHaveBeenCalled();
  },
);

it('keeps address scope filters alongside the text search', async () => {
  const scope = {
    customerId: 'customer',
    aliasType: 'home',
    city: 'City',
    district: 'District',
    street: 'Street',
  };
  await addressQueries.addressList(
    undefined,
    { ...scope, searchValue: '(' },
    context,
    {} as GraphQLResolveInfo,
  );
  expect(jest.mocked(cursorPaginate).mock.calls[0][0].query).toMatchObject({
    customerId: scope.customerId,
    alias: scope.aliasType,
    city: scope.city,
    district: scope.district,
    street: scope.street,
  });
});

it('preserves literal product search through JSON transport to Core', async () => {
  await orderQueries.posProducts(undefined, { searchValue: 'a.b' }, context);
  const request = jest.mocked(sendTRPCMessage).mock.calls[0][0];
  expect(request.subdomain).toBe('tenant');
  expect(request.module).toBe('products');
  const query: Query = JSON.parse(JSON.stringify(request.input.query));
  const matches = sift(query);
  expect(matches({ name: 'Item A.B' })).toBe(true);
  expect(matches({ code: 'A.B-001' })).toBe(true);
  expect(matches({ name: 'Item AxB', code: 'AxB-001' })).toBe(false);
});
