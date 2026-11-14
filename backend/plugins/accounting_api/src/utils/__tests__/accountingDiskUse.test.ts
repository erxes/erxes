import { Mongoose, Schema } from 'mongoose';
import { withAccountingDiskUse } from '../accountingDiskUse';

const createModel = (configure = true) => {
  const mongoose = new Mongoose();
  const schema = new Schema({ code: String });
  const model = mongoose.model(
    'AccountingSortTest',
    configure ? withAccountingDiskUse(schema) : schema,
  );
  const cursor = { toArray: jest.fn().mockResolvedValue([]) };
  // Only the MongoDB cursor boundary is stubbed; Mongoose executes real middleware.
  const find = jest
    .spyOn(model.collection, 'find')
    .mockReturnValue(
      cursor as unknown as ReturnType<typeof model.collection.find>,
    );
  const findOne = jest
    .spyOn(model.collection, 'findOne')
    .mockResolvedValue(null);
  const aggregate = jest
    .spyOn(model.collection, 'aggregate')
    .mockReturnValue(
      cursor as unknown as ReturnType<typeof model.collection.aggregate>,
    );
  return { mongoose, model, schema, find, findOne, aggregate };
};

it('sends disk use with sorted, projected and paginated queries without changing their filters', async () => {
  const { model, find } = createModel();

  await model
    .find({ code: '1501' })
    .select('code')
    .sort({ code: 1 })
    .skip(1000)
    .limit(100)
    .lean();

  expect(find).toHaveBeenCalledWith(
    { code: '1501' },
    expect.objectContaining({
      sort: { code: 1 },
      skip: 1000,
      limit: 100,
      projection: { code: 1 },
      allowDiskUse: true,
    }),
  );
});

it('covers sorted single-record lookups', async () => {
  const { model, findOne } = createModel();

  await model.findOne({ code: '1501' }).sort({ code: -1 }).lean();

  expect(findOne).toHaveBeenCalledWith(
    { code: '1501' },
    expect.objectContaining({ sort: { code: -1 }, allowDiskUse: true }),
  );
});

it('does not add a sort or disk option to unsorted reads', async () => {
  const { model, find, findOne } = createModel();

  await model.find({ code: '1501' }).lean();
  await model.findOne({ code: '1501' }).lean();

  expect(find).toHaveBeenCalledWith({ code: '1501' }, {});
  expect(findOne).toHaveBeenCalledWith({ code: '1501' }, {});
});

it.each([true, false])(
  'preserves explicit query disk use %s',
  async (allowDiskUse) => {
    const { model, find } = createModel();

    const query = model.find().sort({ code: 1 });
    query.getOptions().allowDiskUse = allowDiskUse;
    await query.lean();

    expect(find).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ allowDiskUse }),
    );
  },
);

it('covers report sorting and grouping without changing pipeline or existing options', async () => {
  const { model, aggregate } = createModel();
  const pipeline = [
    { $match: { code: '1501' } },
    { $unwind: '$details' },
    { $sort: { code: 1 as const } },
    { $group: { _id: '$code', count: { $sum: 1 } } },
  ];

  await model.aggregate(pipeline).option({ maxTimeMS: 10000 });

  expect(aggregate).toHaveBeenCalledWith(pipeline, {
    maxTimeMS: 10000,
    allowDiskUse: true,
  });
});

it('also permits disk use for grouping pipelines without sort', async () => {
  const { model, aggregate } = createModel();
  const pipeline = [{ $group: { _id: '$code', count: { $sum: 1 } } }];

  await model.aggregate(pipeline);

  expect(aggregate).toHaveBeenCalledWith(pipeline, { allowDiskUse: true });
});

it.each([true, false])(
  'preserves explicit aggregate disk use %s',
  async (allowDiskUse) => {
    const { model, aggregate } = createModel();
    const pipeline = [{ $match: {} }];

    await model.aggregate(pipeline, { allowDiskUse });

    expect(aggregate).toHaveBeenCalledWith(pipeline, { allowDiskUse });
  },
);

it('registers hooks once when the same schema is reused across tenant models', async () => {
  const { mongoose, schema } = createModel();
  withAccountingDiskUse(schema);
  withAccountingDiskUse(schema);
  const otherTenant = mongoose.createConnection();
  const otherModel = otherTenant.model('AccountingOtherTenant', schema);
  jest.spyOn(otherModel.collection, 'findOne').mockResolvedValue(null);
  const query = otherModel.findOne().sort({ code: 1 });
  const allowDiskUse = jest.spyOn(query, 'allowDiskUse');

  await query.lean();

  expect(allowDiskUse).toHaveBeenCalledTimes(1);
  expect(allowDiskUse).toHaveBeenCalledWith(true);
});

it('keeps unregistered models on the same connection unaffected', async () => {
  const { mongoose, model } = createModel();
  const otherModel = mongoose.model(
    'PlatformSortTest',
    new Schema({ code: String }),
  );
  const otherFind = jest
    .spyOn(otherModel.collection, 'findOne')
    .mockResolvedValue(null);

  await model.findOne().sort({ code: 1 }).lean();
  await otherModel.findOne().sort({ code: 1 }).lean();

  expect(otherFind).toHaveBeenCalledWith({}, { sort: { code: 1 } });
});
