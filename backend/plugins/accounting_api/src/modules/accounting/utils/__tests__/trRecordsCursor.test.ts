import { Model, PipelineStage } from 'mongoose';
import { ITransactionDocument } from '../../@types/transaction';
import { countTrRecords, paginateTrRecords } from '../trRecordsCursor';

type TRow = {
  _id: string;
  trId: string;
  detailInd: number;
  ptrNumber?: string | null;
  ptrId?: string | null;
};

const row = (trId: string, detailInd: number, ptrNumber: string | null) => ({
  _id: `${trId}-${detailInd}`,
  trId,
  detailInd,
  ptrNumber,
  ptrId: `ptr-${trId}`,
});

const buildModel = (rows: TRow[], count = rows.length) => {
  const aggregate = jest.fn((pipeline: PipelineStage[]) =>
    Promise.resolve(
      pipeline.some((stage) => '$group' in stage) ? [{ count }] : rows,
    ),
  );

  return {
    model: { aggregate } as unknown as Model<ITransactionDocument>,
    aggregate,
  };
};

const listPipeline = (aggregate: jest.Mock) =>
  aggregate.mock.calls
    .map(([pipeline]) => pipeline as PipelineStage[])
    .find((pipeline) => !pipeline.some((stage) => '$group' in stage)) || [];

const filter = { journal: { $in: ['main'] } };

test('the first records page sorts whole transactions on indexed fields before unwinding details', async () => {
  const { model, aggregate } = buildModel([
    row('a', 0, '0002'),
    row('a', 1, '0002'),
    row('b', 0, '0001'),
  ]);

  const page = await paginateTrRecords({ model, filter, limit: 2 });
  const pipeline = listPipeline(aggregate);

  expect(pipeline[0]).toEqual({ $match: filter });
  expect(pipeline[1]).toEqual({ $sort: { ptrNumber: -1, ptrId: -1, _id: 1 } });
  expect(pipeline[2]).toHaveProperty('$unwind');
  expect(pipeline).toContainEqual({ $limit: 3 });
  expect(page.list.map((item) => item._id)).toEqual(['a-0', 'a-1']);
  expect(page.totalCount).toBe(3);
  expect(page.pageInfo).toMatchObject({
    hasNextPage: true,
    hasPreviousPage: false,
  });
});

test('the next records page continues after the last transaction detail of the previous page', async () => {
  const first = buildModel([row('a', 0, '0002'), row('a', 1, '0002')]);
  const firstPage = await paginateTrRecords({
    model: first.model,
    filter,
    limit: 1,
  });

  const next = buildModel([row('a', 1, '0002')]);
  await paginateTrRecords({
    model: next.model,
    filter,
    limit: 1,
    cursor: firstPage.pageInfo.endCursor || '',
  });
  const pipeline = listPipeline(next.aggregate);

  expect(pipeline[0]).toEqual({
    $match: {
      $and: [
        filter,
        {
          $or: [
            { ptrNumber: { $lt: '0002' } },
            { ptrNumber: null },
            { ptrNumber: '0002', ptrId: { $lt: 'ptr-a' } },
            { ptrNumber: '0002', ptrId: null },
            { ptrNumber: '0002', ptrId: 'ptr-a', _id: { $gte: 'a' } },
          ],
        },
      ],
    },
  });
  expect(pipeline).toContainEqual({
    $match: { $or: [{ _id: { $ne: 'a' } }, { detailInd: { $gt: 0 } }] },
  });
});

test('paging backward walks the reverse order and returns rows in display order', async () => {
  const cursor = Buffer.from(
    JSON.stringify({ ptrNumber: null, ptrId: null, trId: 'z', detailInd: 0 }),
  ).toString('base64');
  const { model, aggregate } = buildModel([
    row('b', 1, '0001'),
    row('b', 0, '0001'),
  ]);

  const page = await paginateTrRecords({
    model,
    filter,
    limit: 2,
    cursor,
    direction: 'backward',
  });
  const pipeline = listPipeline(aggregate);

  expect(pipeline[1]).toEqual({ $sort: { ptrNumber: 1, ptrId: 1, _id: -1 } });
  expect(page.list.map((item) => item._id)).toEqual(['b-0', 'b-1']);
  expect(page.pageInfo).toMatchObject({
    hasNextPage: true,
    hasPreviousPage: false,
  });
});

test('a cursor from the previous pager restarts the records list instead of failing', async () => {
  const legacyCursor = Buffer.from(
    JSON.stringify({ ptrNumber: '0002', _id: 'a-0' }),
  ).toString('base64');
  const { model, aggregate } = buildModel([row('a', 0, '0002')]);

  const page = await paginateTrRecords({
    model,
    filter,
    limit: 5,
    cursor: legacyCursor,
  });

  expect(listPipeline(aggregate)[0]).toEqual({ $match: filter });
  expect(page.pageInfo.hasPreviousPage).toBe(false);
});

test('records are counted from detail array sizes without unwinding', async () => {
  const { model, aggregate } = buildModel([], 7);

  await expect(countTrRecords(model, filter)).resolves.toBe(7);
  expect(JSON.stringify(aggregate.mock.calls[0][0])).not.toContain('$unwind');
});
