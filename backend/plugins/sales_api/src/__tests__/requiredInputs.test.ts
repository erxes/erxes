import {
  buildSchema,
  defaultFieldResolver,
  graphql,
  GraphQLFieldResolver,
} from 'graphql';
import { selectFields } from './helpers/graphql';
import type { IContext } from '../connectionResolvers';
import posMutations from '../modules/pos/graphql/resolvers/mutations/pos';
import orderQueries from '../modules/pos/graphql/resolvers/queries/orders';
import {
  mutations as posFields,
  types as posTypes,
} from '../modules/pos/graphql/schemas/pos';
import { queries as orderFields } from '../modules/pos/graphql/schemas/orders';
import { dealMutations } from '../modules/sales/graphql/resolvers/mutations/deals';
import { checklistMutations } from '../modules/sales/graphql/resolvers/mutations/checklists';
import { mutations as dealFields } from '../modules/sales/graphql/schemas/deal';
import {
  mutations as checklistFields,
  types as checklistTypes,
} from '../modules/sales/graphql/schemas/checklist';
import {
  syncPosToClient,
  syncProductGroupsToClient,
  syncSlotsToClient,
} from '../modules/pos/graphql/resolvers/mutations/utils';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import type { IProductData } from '../modules/sales/@types';

jest.mock('erxes-api-shared/utils', () => ({
  GQL_CURSOR_PARAM_DEFS: '',
  graphqlPubsub: { publish: jest.fn() },
  sendTRPCMessage: jest.fn().mockResolvedValue([]),
}));
jest.mock('erxes-api-shared/core-modules', () => ({}));
jest.mock('../modules/pos/graphql/resolvers/mutations/utils', () => ({
  syncPosToClient: jest.fn(),
  syncProductGroupsToClient: jest.fn(),
  syncSlotsToClient: jest.fn(),
}));
jest.mock('../modules/sales/utils', () => ({
  getTotalAmounts: jest.fn().mockResolvedValue({ totalAmount: 0 }),
}));
jest.mock('../modules/sales/graphql/resolvers/utils', () => ({
  checkAssignedUserFromPData: jest
    .fn()
    .mockReturnValue({ assignedUserIds: [] }),
  subscriptionWrapper: jest.fn(),
}));
jest.mock(
  '../modules/sales/graphql/resolvers/mutations/loyaltyUtils',
  () => ({}),
);
jest.mock('../modules/sales/utils/productCurrency', () => ({
  normalizeProductCurrencies: async (
    _subdomain: string,
    rows: IProductData[],
  ) => rows,
}));
jest.mock('../modules/sales/utils/discountInfos', () => ({
  normalizeProductDiscountInfos: (rows: IProductData[]) => rows,
}));

// Use the actual argument SDL and resolvers. Output stubs keep these input
// boundary tests independent of federation and unrelated entity resolvers.
const schema = buildSchema(`
  scalar JSON
  scalar Date
  type User { _id: String }
  type Deal { _id: String }
  type PosOrderDetail { _id: String }
  ${posTypes()}
  ${checklistTypes}
  type Query { ${selectFields(orderFields, ['posOrderDetail'])} }
  type Mutation {
    ${selectFields(posFields, [
      'posEdit',
      'productGroupsBulkInsert',
      'posSlotBulkUpdate',
    ])}
    ${selectFields(dealFields, [
      'dealsWatch',
      'dealsCreateProductsData',
      'dealsEditProductData',
      'dealsDeleteProductData',
      'cpDealsCreateProductsData',
      'cpDealsEditProductData',
    ])}
    ${selectFields(checklistFields, [
      'salesChecklistsAdd',
      'salesChecklistItemsAdd',
      'salesChecklistItemsOrder',
    ])}
  }
`);

const resolvers: Record<string, GraphQLFieldResolver<undefined, IContext>> = {
  ...posMutations,
  ...dealMutations,
  ...checklistMutations,
  posOrderDetail: orderQueries.posOrderDetail,
};

const createContext = () => ({
  subdomain: 'tenant',
  user: { _id: 'user' },
  checkPermission: jest.fn().mockResolvedValue(undefined),
  models: {
    Pos: {
      getPos: jest.fn().mockResolvedValue({ _id: 'pos' }),
      posEdit: jest.fn().mockResolvedValue({ _id: 'pos' }),
    },
    ProductGroups: {
      groups: jest.fn().mockResolvedValue([{ _id: 'old-group' }]),
      groupsEdit: jest.fn(),
      deleteMany: jest.fn(),
      insertMany: jest.fn(),
    },
    PosSlots: {
      find: jest.fn().mockResolvedValue([{ _id: 'old-slot' }]),
      deleteMany: jest.fn(),
      bulkWrite: jest.fn(),
      insertMany: jest.fn(),
    },
    PosOrders: {
      findOne: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: 'order', items: [] }),
      }),
    },
    Deals: {
      watchDeal: jest.fn(),
      getDeal: jest.fn().mockResolvedValue({
        _id: 'deal',
        stageId: 'stage',
        productsData: [{ _id: 'row' }],
      }),
      findOneAndUpdate: jest.fn().mockResolvedValue({
        _id: 'deal',
        productsData: [{ _id: 'row' }],
      }),
    },
    Stages: { getStage: jest.fn().mockResolvedValue({ defaultTick: true }) },
    Checklists: {
      createChecklist: jest.fn().mockResolvedValue({ _id: 'list' }),
    },
    ChecklistItems: {
      createChecklistItem: jest
        .fn()
        .mockResolvedValue({ _id: 'item', checklistId: 'list' }),
      updateItemOrder: jest.fn().mockResolvedValue({ _id: 'item' }),
    },
  },
});

let context = createContext();
beforeEach(() => {
  jest.clearAllMocks();
  context = createContext();
});

const run = (source: string, variableValues?: Record<string, unknown>) =>
  graphql({
    schema,
    source,
    variableValues,
    contextValue: context,
    fieldResolver: (source, args, ctx, info) => {
      const resolver = resolvers[info.fieldName];
      if (
        info.parentType.name === 'Mutation' ||
        info.parentType.name === 'Query'
      ) {
        return resolver(source, args, ctx, info);
      }
      return defaultFieldResolver(source, args, ctx, info);
    },
  });

const expectNoModelCalls = (): void => {
  for (const model of Object.values(context.models)) {
    for (const method of Object.values(model)) {
      expect(method).not.toHaveBeenCalled();
    }
  }
  expect(syncPosToClient).not.toHaveBeenCalled();
  expect(syncProductGroupsToClient).not.toHaveBeenCalled();
  expect(syncSlotsToClient).not.toHaveBeenCalled();
  expect(graphqlPubsub.publish).not.toHaveBeenCalled();
};

describe('required target IDs', () => {
  const operations = [
    ['posEdit', '_id'],
    ['productGroupsBulkInsert', 'posId'],
    ['posSlotBulkUpdate', 'posId'],
    ['dealsWatch', '_id'],
  ];

  it.each(operations)(
    '%s rejects omitted and null %s during GraphQL validation',
    async (operation, argument) => {
      for (const args of ['', `(${argument}: null)`]) {
        const result = await run(
          `mutation salesRequiredInputTargetOmitted { ${operation}${args} { _id } }`,
        );
        expect(result.errors?.[0].message).toMatch(/String!/);
        expect(context.checkPermission).not.toHaveBeenCalled();
        expectNoModelCalls();
      }
    },
  );

  it.each(operations)(
    '%s rejects an empty %s after permission checking',
    async (operation, argument) => {
      const result = await run(
        `mutation salesRequiredInputTargetEmpty { ${operation}(${argument}: "") { _id } }`,
      );
      expect(result.errors?.[0].message).toBe(`${argument} is required`);
      expect(context.checkPermission).toHaveBeenCalledWith(operation);
      expectNoModelCalls();
    },
  );
});

describe('nullable caller contracts still validate required values at runtime', () => {
  it.each([
    [
      'productGroupsBulkInsert(posId: "pos") { _id }',
      'groups must be an array',
    ],
    [
      'productGroupsBulkInsert(posId: "pos", groups: null) { _id }',
      'groups must be an array',
    ],
    [
      'productGroupsBulkInsert(posId: "pos", groups: [{_id: "group"}, null]) { _id }',
      'Every group must have an _id',
    ],
    [
      'productGroupsBulkInsert(posId: "pos", groups: [{}]) { _id }',
      'Every group must have an _id',
    ],
    ['posSlotBulkUpdate(posId: "pos") { _id }', 'slots must be an array'],
    [
      'posSlotBulkUpdate(posId: "pos", slots: null) { _id }',
      'slots must be an array',
    ],
    [
      'posSlotBulkUpdate(posId: "pos", slots: [{posId: "pos"}, null]) { _id }',
      'Every slot must have a posId',
    ],
    ['salesChecklistsAdd { _id }', 'contentTypeId is required'],
    [
      'salesChecklistsAdd(contentTypeId: "") { _id }',
      'contentTypeId is required',
    ],
    [
      'salesChecklistItemsAdd(checklistId: null) { _id }',
      'checklistId is required',
    ],
    [
      'salesChecklistItemsAdd(checklistId: "") { _id }',
      'checklistId is required',
    ],
    [
      'salesChecklistItemsOrder(_id: "item") { _id }',
      'destinationIndex must be an integer',
    ],
    [
      'salesChecklistItemsOrder(_id: "item", destinationIndex: null) { _id }',
      'destinationIndex must be an integer',
    ],
  ])('%s fails before reading or writing data', async (operation, message) => {
    const result = await run(
      `mutation salesRequiredInputNullableInput { ${operation} }`,
    );
    expect(result.errors?.[0].message).toBe(message);
    expect(context.checkPermission).toHaveBeenCalledTimes(1);
    expectNoModelCalls();
  });

  it.each([undefined, null, ''])(
    'posOrderDetail rejects ID %s without a lookup',
    async (id) => {
      const result = await run(
        'query salesRequiredInputOrderId ($id: String) { posOrderDetail(_id: $id) { _id } }',
        { id },
      );
      expect(result.errors?.[0].message).toBe('_id is required');
      expect(context.checkPermission).toHaveBeenCalledWith('posOrderRead');
      expectNoModelCalls();
    },
  );

  it.each(['dealsCreateProductsData', 'cpDealsCreateProductsData'])(
    '%s rejects missing IDs and malformed JSON arrays',
    async (operation) => {
      const source = `mutation salesRequiredInputCreateProductsValidation ($id: String, $docs: JSON) { ${operation}(dealId: $id, docs: $docs) }`;
      const missingId = await run(source, { docs: [] });
      expect(missingId.errors?.[0].message).toBe('dealId is required');
      for (const docs of [undefined, null, {}, 'bad', [null], [[]]]) {
        const result = await run(source, { id: 'deal', docs });
        expect(result.errors?.[0].message).toBe(
          'docs must be an array of product objects',
        );
      }
      expectNoModelCalls();
    },
  );

  it.each(['dealsEditProductData', 'cpDealsEditProductData'])(
    '%s rejects missing IDs and malformed product objects',
    async (operation) => {
      const source = `mutation salesRequiredInputEditProductValidation ($id: String, $row: String, $doc: JSON) { ${operation}(dealId: $id, dataId: $row, doc: $doc) }`;
      for (const variables of [
        { row: 'row' },
        { id: 'deal' },
        { id: '', row: 'row' },
      ]) {
        const result = await run(source, { ...variables, doc: {} });
        expect(result.errors?.[0].message).toBe(
          'dealId and dataId are required',
        );
      }
      for (const doc of [undefined, null, [], 'bad']) {
        const result = await run(source, { id: 'deal', row: 'row', doc });
        expect(result.errors?.[0].message).toBe('doc must be a product object');
      }
      expectNoModelCalls();
    },
  );

  it('dealsDeleteProductData requires a deal and an explicit selection', async () => {
    for (const [args, message] of [
      ['dataIds: []', 'dealId is required'],
      ['dealId: "deal"', 'dataIds must be an array'],
      ['dealId: "deal", dataIds: null', 'dataIds must be an array'],
    ]) {
      const result = await run(
        `mutation salesRequiredInputDeleteProductsValidation { dealsDeleteProductData(${args}) }`,
      );
      expect(result.errors?.[0].message).toBe(message);
    }
    expectNoModelCalls();
  });
});

describe('product row contents', () => {
  it.each([
    ['dealsCreateProductsData', true],
    ['cpDealsCreateProductsData', true],
    ['dealsEditProductData', false],
    ['cpDealsEditProductData', false],
  ])(
    '%s rejects malformed rows before model access',
    async (operation, create) => {
      const valid = { productId: 'product', quantity: 1, unitPrice: 100 };
      const source = create
        ? `mutation salesRequiredInputProductContents($payload: JSON) { ${operation}(dealId: "deal", docs: $payload) }`
        : `mutation salesRequiredInputProductContentsEdit($payload: JSON) { ${operation}(dealId: "deal", dataId: "row", doc: $payload) }`;
      for (const doc of [
        {},
        { ...valid, productId: '' },
        { ...valid, productId: '  ' },
        { ...valid, productId: 1 },
        { ...valid, quantity: undefined },
        { ...valid, quantity: '1' },
        { ...valid, unitPrice: null },
        { ...valid, unitPrice: '100' },
        { ...valid, unitPrice: Number.POSITIVE_INFINITY },
        { ...valid, globalUnitPrice: '100' },
        { ...valid, unitPricePercent: {} },
        { ...valid, currency: 1 },
        { ...valid, uom: [] },
        { ...valid, uomInfo: 'bad' },
        { ...valid, uomInfo: { uom: 7 } },
      ]) {
        const result = await run(source, {
          payload: create ? [valid, doc] : doc,
        });
        expect(result.errors?.[0].message).toMatch(/^Product /);
        expectNoModelCalls();
      }
    },
  );

  it.each(['dealsCreateProductsData', 'cpDealsCreateProductsData'])(
    '%s preserves zero values and authoritative entry-unit values',
    async (operation) => {
      const result = await run(
        `mutation salesRequiredInputProductEntryValues($docs: JSON) { ${operation}(dealId: "deal", docs: $docs) }`,
        {
          docs: [
            { productId: 'free', unitPrice: 0, quantity: 0 },
            {
              productId: 'converted',
              uom: 'each',
              uomInfo: {
                uom: 'box',
                ratio: 0.1,
                unitPrice: 100,
                quantity: 2,
              },
            },
          ],
        },
      );
      expect(result.errors).toBeUndefined();
      expect(context.models.Deals.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'deal' },
        expect.objectContaining({
          $set: expect.objectContaining({
            productsData: expect.arrayContaining([
              expect.objectContaining({
                productId: 'free',
                unitPrice: 0,
                quantity: 0,
              }),
              expect.objectContaining({
                productId: 'converted',
                unitPrice: 10,
                quantity: 20,
              }),
            ]),
          }),
        }),
        { new: true },
      );
    },
  );
});

describe('supported requests keep their behavior', () => {
  it('accepts the legacy nullable order-detail variable with a valid ID', async () => {
    const result = await run(
      'query salesRequiredInputOrderDetail($id: String) { posOrderDetail(_id: $id) { _id } }',
      { id: 'order' },
    );
    expect(result.errors).toBeUndefined();
    expect(result.data?.posOrderDetail).toEqual({ _id: 'order' });
    expect(context.models.PosOrders.findOne).toHaveBeenCalledWith({
      _id: 'order',
    });
  });

  it('edits and syncs the requested POS in the same tenant', async () => {
    const result = await run(
      'mutation salesRequiredInputPosEdit ($id: String!) { posEdit(_id: $id, name: "Updated") { _id } }',
      { id: 'pos' },
    );
    expect(result.errors).toBeUndefined();
    expect(context.models.Pos.posEdit).toHaveBeenCalledWith(
      'pos',
      expect.objectContaining({ name: 'Updated' }),
    );
    expect(syncPosToClient).toHaveBeenCalledWith('tenant', { _id: 'pos' });
  });

  it('keeps explicit empty arrays as the clear-groups and clear-slots actions', async () => {
    for (const operation of [
      'productGroupsBulkInsert(posId: "pos", groups: [])',
      'posSlotBulkUpdate(posId: "pos", slots: [])',
    ]) {
      const result = await run(
        `mutation salesRequiredInputClearPosRows { ${operation} { _id } }`,
      );
      expect(result.errors).toBeUndefined();
    }
    expect(context.models.ProductGroups.deleteMany).toHaveBeenCalled();
    expect(context.models.PosSlots.deleteMany).toHaveBeenCalledWith({
      _id: { $in: ['old-slot'] },
    });
    expect(syncProductGroupsToClient).toHaveBeenCalledWith(
      'tenant',
      context.models,
      { _id: 'pos' },
    );
    expect(syncSlotsToClient).toHaveBeenCalled();
  });

  it.each([true, false])(
    'preserves watch/unwatch with isAdd=%s',
    async (isAdd) => {
      const result = await run(
        `mutation salesRequiredInputWatch { dealsWatch(_id: "deal", isAdd: ${isAdd}) { _id } }`,
      );
      expect(result.errors).toBeUndefined();
      expect(context.models.Deals.watchDeal).toHaveBeenCalledWith(
        'deal',
        isAdd,
        'user',
      );
    },
  );

  it('permits zero as a checklist position and publishes added items', async () => {
    const result = await run(
      'mutation salesRequiredInputChecklist { salesChecklistItemsOrder(_id: "item", destinationIndex: 0) { _id } salesChecklistItemsAdd(checklistId: "list", content: "Task") { _id } salesChecklistsAdd(contentTypeId: "deal", title: "List") { _id } }',
    );
    expect(result.errors).toBeUndefined();
    expect(context.models.ChecklistItems.updateItemOrder).toHaveBeenCalledWith(
      'item',
      0,
    );
    expect(graphqlPubsub.publish).toHaveBeenCalledWith(
      'salesChecklistDetailChanged:list',
      expect.objectContaining({ salesChecklistDetailChanged: { _id: 'list' } }),
    );
  });

  it('keeps optional-variable documents valid and an empty product selection as a no-op', async () => {
    const result = await run(
      'mutation salesRequiredInputDeleteEmpty ($id: String, $ids: [String]) { dealsDeleteProductData(dealId: $id, dataIds: $ids) }',
      { id: 'deal', ids: [] },
    );
    expect(result.errors).toBeUndefined();
    expect(result.data?.dealsDeleteProductData).toEqual({
      dataIds: [],
      productsData: [{ _id: 'row' }],
    });
    expect(context.models.Deals.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it.each(['dealsCreateProductsData', 'cpDealsCreateProductsData'])(
    '%s still permits an explicit empty product array',
    async (operation) => {
      const result = await run(
        `mutation salesRequiredInputCreateEmpty ($docs: JSON) { ${operation}(dealId: "deal", docs: $docs) }`,
        { docs: [] },
      );
      expect(result.errors).toBeUndefined();
      expect(context.models.Deals.findOneAndUpdate).toHaveBeenCalled();
    },
  );

  it.each(['dealsCreateProductsData', 'cpDealsCreateProductsData'])(
    '%s still appends valid product rows',
    async (operation) => {
      const doc = {
        _id: 'new-row',
        productId: 'product',
        quantity: 1,
        unitPrice: 100,
      };
      const result = await run(
        `mutation salesRequiredInputCreateProducts ($docs: JSON) { ${operation}(dealId: "deal", docs: $docs) }`,
        { docs: [doc] },
      );
      expect(result.errors).toBeUndefined();
      expect(context.models.Deals.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'deal' },
        expect.objectContaining({
          $set: expect.objectContaining({
            productsData: [{ _id: 'row' }, { ...doc, tickUsed: true }],
          }),
        }),
        { new: true },
      );
    },
  );

  it.each(['dealsEditProductData', 'cpDealsEditProductData'])(
    '%s still replaces the selected product row',
    async (operation) => {
      const doc = {
        _id: 'row',
        productId: 'product',
        quantity: 2,
        unitPrice: 100,
      };
      const result = await run(
        `mutation salesRequiredInputEditProduct ($doc: JSON) { ${operation}(dealId: "deal", dataId: "row", doc: $doc) }`,
        { doc },
      );
      expect(result.errors).toBeUndefined();
      expect(context.models.Deals.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'deal' },
        expect.objectContaining({
          $set: expect.objectContaining({ productsData: [doc] }),
        }),
        { new: true },
      );
    },
  );

  it('allows new groups with temporary IDs and new slots without IDs', async () => {
    const result = await run(
      'mutation salesRequiredInputCreatePosRows { productGroupsBulkInsert(posId: "pos", groups: [{_id: "temporaryId-new", name: "Group"}]) { _id } posSlotBulkUpdate(posId: "pos", slots: [{posId: "pos", name: "Table"}]) { _id } }',
    );
    expect(result.errors).toBeUndefined();
    expect(context.models.ProductGroups.insertMany).toHaveBeenCalledWith([
      { name: 'Group', posId: 'pos' },
    ]);
    expect(context.models.PosSlots.insertMany).toHaveBeenCalledWith([
      { posId: 'pos', name: 'Table' },
    ]);
  });

  it('requires product-edit permission before looking up the deal', async () => {
    context.checkPermission
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Permission denied'));
    const result = await run(
      'mutation salesRequiredInputProductPermission { dealsCreateProductsData(dealId: "deal", docs: []) }',
    );
    expect(result.errors?.[0].message).toBe('Permission denied');
    expect(context.checkPermission.mock.calls).toEqual([
      ['dealsEdit'],
      ['dealsProductsEdit'],
    ]);
    expectNoModelCalls();
  });

  it('keeps permission failures ahead of runtime validation', async () => {
    context.checkPermission.mockRejectedValue(new Error('Permission denied'));
    const result = await run(
      'mutation salesRequiredInputPosPermission { posEdit(_id: "") { _id } }',
    );
    expect(result.errors?.[0].message).toBe('Permission denied');
    expectNoModelCalls();
  });
});
