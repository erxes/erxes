import { buildSchema, defaultFieldResolver, graphql } from 'graphql';
import { selectFields } from './helpers/graphql';
import { deleteModel, model, Schema } from 'mongoose';
import { cursorPaginate } from 'erxes-api-shared/utils';
import type { IModels } from '../connectionResolvers';
import type { IDealDocument } from '../modules/sales/@types';
import { loadDealClass, IDealModel } from '../modules/sales/db/models/Deals';
import { dealMutations } from '../modules/sales/graphql/resolvers/mutations/deals';
import { pipelineLabelMutations } from '../modules/sales/graphql/resolvers/mutations/labels';
import { stageMutations } from '../modules/sales/graphql/resolvers/mutations/stages';
import dealResolvers from '../modules/sales/graphql/resolvers/customResolvers/deal';
import { subscriptionWrapper } from '../modules/sales/graphql/resolvers/utils';
import { archivedItems } from '../modules/sales/utils';
import { mutations as dealFields } from '../modules/sales/graphql/schemas/deal';
import { mutations as labelFields } from '../modules/sales/graphql/schemas/label';
import { mutations as stageFields } from '../modules/sales/graphql/schemas/stage';

jest.mock('erxes-api-shared/utils', () => ({
  GQL_CURSOR_PARAM_DEFS: '',
  cursorPaginate: jest.fn(),
  graphqlPubsub: { publish: jest.fn() },
  sendTRPCMessage: jest.fn(),
}));
jest.mock('erxes-api-shared/core-modules', () => ({}));
jest.mock('../modules/sales/db/definitions/deals', () => ({
  dealSchema: new Schema({ _id: String, watchedUserIds: [String] }),
}));
jest.mock('../modules/sales/meta/activity-log', () => ({
  generateDealWatchActivityLog: jest.fn().mockReturnValue({ action: 'watch' }),
}));
jest.mock('../modules/sales/graphql/resolvers/utils', () => ({
  subscriptionWrapper: jest.fn(),
}));
jest.mock('../modules/sales/graphql/resolvers/mutations/utils', () => ({}));
jest.mock(
  '../modules/sales/graphql/resolvers/mutations/loyaltyUtils',
  () => ({}),
);

// Execute the real mutation declarations/resolvers and watch model method.
// Persistence and external notifications are isolated at their boundaries.
const schema = buildSchema(`
  type Query { unused: Boolean }
  type Deal { _id: String!, isWatched: Boolean }
  type Mutation {
    ${selectFields(dealFields, ['dealsWatch'])}
    ${selectFields(labelFields, ['salesPipelineLabelsLabel'])}
    ${selectFields(stageFields, ['salesStagesSortItems'])}
  }
`);

const mutations = {
  ...dealMutations,
  ...pipelineLabelMutations,
  ...stageMutations,
};
const models = {
  Deals: {
    getDeal: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateOne: jest.fn(),
    find: jest.fn(),
    bulkWrite: jest.fn(),
  },
  Stages: { getStage: jest.fn(), find: jest.fn() },
  PipelineLabels: { labelObject: jest.fn() },
};
const createActivityLog = jest.fn();
const Deal = model<IDealDocument, IDealModel>(
  'SalesResolverContractDeal',
  loadDealClass(models as unknown as IModels, 'tenant', {
    createActivityLog,
    sendDbEventLog: jest.fn(),
  } as unknown as Parameters<typeof loadDealClass>[2]),
);
const context = {
  user: { _id: 'user' },
  checkPermission: jest.fn(),
  models: {
    ...models,
    Deals: { ...models.Deals, watchDeal: Deal.watchDeal },
  },
};

const run = (source: string) =>
  graphql({
    schema,
    source,
    contextValue: context,
    fieldResolver: (source, args, ctx, info) => {
      if (info.parentType.name === 'Mutation') {
        return mutations[info.fieldName](source, args, ctx, info);
      }
      if (info.parentType.name === 'Deal' && info.fieldName === 'isWatched') {
        return dealResolvers.isWatched(source, undefined, ctx);
      }
      return defaultFieldResolver(source, args, ctx, info);
    },
  });

beforeEach(() => jest.resetAllMocks());
afterAll(() => deleteModel('SalesResolverContractDeal'));

it.each([true, false])(
  'returns the persisted watch state for isAdd=%s',
  async (isAdd) => {
    const previous = new Deal({
      _id: 'deal',
      watchedUserIds: isAdd ? [] : ['user'],
    });
    const updated = new Deal({
      _id: 'deal',
      watchedUserIds: isAdd ? ['user'] : [],
    });
    models.Deals.getDeal.mockResolvedValue(previous);
    models.Deals.findOneAndUpdate.mockResolvedValueOnce(updated);

    const result = await run(`mutation salesResolverWatch {
    dealsWatch(_id: "deal", isAdd: ${isAdd}) { _id isWatched }
  }`);

    expect(result.errors).toBeUndefined();
    expect(result.data?.dealsWatch).toEqual({ _id: 'deal', isWatched: isAdd });
    expect(models.Deals.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'deal' },
      isAdd
        ? { $addToSet: { watchedUserIds: 'user' } }
        : { $pull: { watchedUserIds: 'user' } },
      { new: true },
    );
    expect(context.checkPermission).toHaveBeenCalledWith('dealsWatch');
    expect(createActivityLog).toHaveBeenCalledTimes(1);
  },
);

it('does not write or publish when watch permission is denied', async () => {
  context.checkPermission.mockRejectedValue(new Error('Permission denied'));
  const result = await run(
    'mutation salesResolverWatchDenied { dealsWatch(_id: "deal", isAdd: true) { _id } }',
  );
  expect(result.errors?.[0].message).toBe('Permission denied');
  expect(models.Deals.updateOne).not.toHaveBeenCalled();
  expect(models.Deals.findOneAndUpdate).not.toHaveBeenCalled();
  expect(createActivityLog).not.toHaveBeenCalled();
});

it('acknowledges label changes only after publishing the updated deal', async () => {
  const oldDeal = { _id: 'deal', stageId: 'stage', labelIds: [] };
  const deal = { ...oldDeal, labelIds: ['label'] };
  models.PipelineLabels.labelObject.mockResolvedValue({ oldDeal, deal });
  models.Stages.getStage.mockResolvedValue({ pipelineId: 'pipeline' });
  const source =
    'mutation salesResolverLabel { salesPipelineLabelsLabel(targetId: "deal", labelIds: ["label"]) }';

  const result = await run(source);
  expect(result.errors).toBeUndefined();
  expect(result.data?.salesPipelineLabelsLabel).toBe('success');
  expect(subscriptionWrapper).toHaveBeenCalledWith(context.models, {
    action: 'update',
    oldDeal,
    deal,
    pipelineId: 'pipeline',
  });

  jest
    .mocked(subscriptionWrapper)
    .mockRejectedValueOnce(new Error('Publish failed'));
  const failed = await run(source);
  expect(failed.errors?.[0].message).toBe('Publish failed');
  expect(failed.data?.salesPipelineLabelsLabel).toBeNull();
});

it.each(['created-asc', 'close-asc'])(
  'acknowledges an empty stage sort (%s) without writes',
  async (sortType) => {
    models.Deals.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([]),
    });
    const result = await run(`mutation salesResolverEmptySort {
    salesStagesSortItems(stageId: "stage", sortType: "${sortType}")
  }`);
    expect(result.errors).toBeUndefined();
    expect(result.data?.salesStagesSortItems).toBe('ok');
    expect(models.Deals.bulkWrite).not.toHaveBeenCalled();
  },
);

it('returns a complete empty archive for a pipeline with no stages', async () => {
  models.Stages.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
  const result = await archivedItems(models as unknown as IModels, {
    pipelineId: 'empty',
    search: '',
  });
  expect(result).toEqual({
    list: [],
    totalCount: 0,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  });
  expect(cursorPaginate).not.toHaveBeenCalled();
});

it('keeps stage sorting and propagates write failures', async () => {
  const sort = jest
    .fn()
    .mockResolvedValue([{ _id: 'first' }, { _id: 'second' }]);
  models.Deals.find.mockReturnValue({ sort });
  const source =
    'mutation salesResolverSort { salesStagesSortItems(stageId: "stage", sortType: "created-asc") }';
  const result = await run(source);
  expect(result.errors).toBeUndefined();
  expect(result.data?.salesStagesSortItems).toBe('ok');
  expect(sort).toHaveBeenCalledWith({ createdAt: 1 });
  expect(models.Deals.bulkWrite).toHaveBeenCalledWith([
    { updateOne: { filter: { _id: 'first' }, update: { order: 100 } } },
    { updateOne: { filter: { _id: 'second' }, update: { order: 110 } } },
  ]);

  models.Deals.bulkWrite.mockRejectedValueOnce(new Error('Write failed'));
  const failed = await run(source);
  expect(failed.errors?.[0].message).toBe('Write failed');
  expect(failed.data?.salesStagesSortItems).toBeNull();
});

it('preserves archive pagination and its stage filter when stages exist', async () => {
  models.Stages.find.mockReturnValue({
    lean: jest.fn().mockResolvedValue([{ _id: 'stage' }]),
  });
  const page = {
    list: [new Deal({ _id: 'archived' })],
    totalCount: 1,
    pageInfo: {
      startCursor: 'start',
      endCursor: 'end',
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
  jest.mocked(cursorPaginate).mockResolvedValueOnce(page);
  const result = await archivedItems(models as unknown as IModels, {
    pipelineId: 'pipeline',
    search: '',
  });
  expect(result).toEqual(page);
  expect(cursorPaginate).toHaveBeenCalledWith(
    expect.objectContaining({
      query: { status: 'archived', stageId: { $in: ['stage'] } },
    }),
  );
});
