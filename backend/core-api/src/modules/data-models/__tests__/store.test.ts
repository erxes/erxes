import { Mongoose, Query } from 'mongoose';
import { dataModelDefinitionSchema } from '../db/definitions/dataModelDefinitions';
import { createDataModelDefinitionStore } from '../db/models/DataModelDefinitions';
import type { IDataModelDefinitionDocument } from '../types';

const setup = () => {
  const mongoose = new Mongoose();
  const model = mongoose.model<IDataModelDefinitionDocument>(
    'data_model_definitions',
    dataModelDefinitionSchema.clone(),
  );
  return { model, store: createDataModelDefinitionStore(model) };
};

afterEach(() => jest.restoreAllMocks());

describe('tenant-bound definition persistence', () => {
  it('queries only the request tenant model and uses the exact identity', async () => {
    const first = setup();
    const second = setup();
    const execute = jest.spyOn(Query.prototype, 'exec').mockResolvedValue(null);

    await first.store.findById('same-id');
    await second.store.findById('same-id');

    expect(execute.mock.contexts[0].model).toBe(first.model);
    expect(execute.mock.contexts[1].model).toBe(second.model);
    expect(execute.mock.contexts.map((query) => query.getFilter())).toEqual([
      { _id: 'same-id' },
      { _id: 'same-id' },
    ]);
  });

  it('filters, sorts, and bounds catalog reads in MongoDB', async () => {
    const { store } = setup();
    const execute = jest.spyOn(Query.prototype, 'exec').mockResolvedValue([]);
    await store.list({ archived: false, offset: 10, limit: 20 });
    const query = execute.mock.contexts[0];
    expect(query.getFilter()).toEqual({
      source: { $ne: 'BUILTIN' },
      archivedAt: null,
    });
    expect(query.getOptions()).toMatchObject({
      sort: { name: 1 },
      skip: 10,
      limit: 20,
    });
    expect(query.mongooseOptions().lean).toBe(true);
  });

  it('uses the same archive predicate for counts and lists', async () => {
    const { store } = setup();
    const execute = jest.spyOn(Query.prototype, 'exec').mockResolvedValue([]);
    await store.list({ archived: true, offset: 0, limit: 20 });
    execute.mockResolvedValue(3);
    expect(await store.count(true)).toBe(3);
    expect(execute.mock.contexts.map((query) => query.getFilter())).toEqual([
      { source: { $ne: 'BUILTIN' }, archivedAt: { $ne: null } },
      { source: { $ne: 'BUILTIN' }, archivedAt: { $ne: null } },
    ]);
  });

  it('includes expected version in the atomic update selector', async () => {
    const { store } = setup();
    const execute = jest.spyOn(Query.prototype, 'exec').mockResolvedValue(null);
    const changes = { labelSingular: 'Agreement', updatedBy: 'editor' };
    expect(await store.update('contract-id', 7, changes)).toBeNull();
    const query = execute.mock.contexts[0];
    expect(query.getFilter()).toEqual({ _id: 'contract-id', version: 7 });
    expect(query.getUpdate()).toEqual({ $set: changes, $inc: { version: 1 } });
    expect(query.getOptions()).toMatchObject({
      new: true,
      runValidators: true,
    });
  });
});
