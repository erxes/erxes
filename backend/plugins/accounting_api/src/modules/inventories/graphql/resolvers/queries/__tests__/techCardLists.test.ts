import type { IContext } from '~/connectionResolvers';
import {
  getTechCardFilter,
  getTechCardOutputsPipeline,
} from '../../../../utils/techCardFilters';
import queries from '../techCards';

test('filters combine card text, cost names, input/output products, and duration', () => {
  const filter = getTechCardFilter({
    searchValue: 'step',
    laborCostName: 'pack',
    overheadCostName: 'electric',
    inputProductId: 'input',
    outputProductId: 'output',
    durationType: 'hour',
  });
  expect(filter).toEqual({
    $or: [
      { name: { $regex: 'step', $options: 'i' } },
      { code: { $regex: 'step', $options: 'i' } },
      { description: { $regex: 'step', $options: 'i' } },
    ],
    'laborCosts.name': { $regex: 'pack', $options: 'i' },
    'overheadCosts.name': { $regex: 'electric', $options: 'i' },
    'inputs.productId': 'input',
    'outputs.productId': 'output',
    durationType: 'hour',
  });
});

test('text filters treat regex characters literally and ignore blank text', () => {
  expect(
    getTechCardFilter({ laborCostName: 'a.b' })['laborCosts.name'],
  ).toEqual({ $regex: 'a\\.b', $options: 'i' });
  expect(
    getTechCardFilter({ searchValue: ' ', overheadCostName: ' ' }),
  ).toEqual({});
});

test('output filtering and counting happen after unwind, with stable source-row ids', () => {
  const pipeline = getTechCardOutputsPipeline({
    outputProductId: 'product',
    page: 2,
    perPage: 10,
  });
  expect(pipeline).toEqual([
    { $match: { 'outputs.productId': 'product' } },
    { $set: { techCard: '$$ROOT' } },
    { $unwind: { path: '$outputs', includeArrayIndex: 'outputIndex' } },
    { $match: { 'outputs.productId': 'product' } },
    { $sort: { modifiedAt: -1, _id: 1, outputIndex: 1 } },
    {
      $facet: {
        rows: [
          { $skip: 10 },
          { $limit: 10 },
          {
            $project: {
              _id: { $concat: ['$_id', ':', { $toString: '$outputIndex' }] },
              techCard: 1,
              output: '$outputs',
              outputIndex: 1,
            },
          },
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]);
});

test('output pages are bounded without dropping source rows before unwind', () => {
  const pipeline = getTechCardOutputsPipeline({ page: -1, perPage: 500 });
  expect(pipeline[pipeline.length - 1]).toMatchObject({
    $facet: { rows: [{ $skip: 0 }, { $limit: 100 }, expect.any(Object)] },
  });
  expect(pipeline.some((stage) => '$group' in stage)).toBe(false);
});

const setup = () => {
  const aggregate = jest.fn().mockResolvedValue([]);
  const checkPermission = jest.fn().mockResolvedValue(undefined);
  const context = {
    models: { TechCards: { aggregate } },
    checkPermission,
  } as unknown as IContext;
  return { aggregate, checkPermission, context };
};

test('denied output reads never access tenant data', async () => {
  const { context, aggregate, checkPermission } = setup();
  checkPermission.mockRejectedValue(new Error('Denied'));
  await expect(queries.techCardOutputs(undefined, {}, context)).rejects.toThrow(
    'Denied',
  );
  expect(aggregate).not.toHaveBeenCalled();
});

test('two cards sharing the same output product remain distinct rows', async () => {
  const { context, aggregate, checkPermission } = setup();
  const rows = [
    {
      _id: 'card-a:0',
      techCard: { _id: 'card-a' },
      output: { productId: 'shared' },
      outputIndex: 0,
    },
    {
      _id: 'card-b:0',
      techCard: { _id: 'card-b' },
      output: { productId: 'shared' },
      outputIndex: 0,
    },
  ];
  aggregate.mockResolvedValue([{ rows, totalCount: [{ count: 2 }] }]);
  await expect(
    queries.techCardOutputs(undefined, {}, context),
  ).resolves.toEqual({ rows, totalCount: 2 });
  expect(checkPermission).toHaveBeenCalledWith('readTechCards');
});

test('an empty aggregate response produces an empty page and zero count', async () => {
  const { context } = setup();
  await expect(
    queries.techCardOutputs(undefined, {}, context),
  ).resolves.toEqual({ rows: [], totalCount: 0 });
});
