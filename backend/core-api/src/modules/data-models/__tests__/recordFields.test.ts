import { Mongoose, Query } from 'mongoose';
import { createDataModelRecordFields } from '../records/fields';
import { getDataModelFieldModel } from '../fields/registry';

afterEach(() => jest.restoreAllMocks());

it('loads first-class field metadata from this tenant and model, not Properties', async () => {
  const connection = new Mongoose().connection;
  const fields = getDataModelFieldModel(connection);
  const execute = jest.spyOn(Query.prototype, 'exec').mockResolvedValue([
    {
      _id: 'enabled',
      name: 'enabled',
      label: 'Enabled',
      type: 'boolean',
      required: true,
      options: [],
    },
  ]);
  const provider = createDataModelRecordFields(connection);
  const result = await provider.list('a');
  expect(fields.collection.collectionName).toBe('data_model_fields');
  expect(execute.mock.contexts[0].getFilter()).toEqual({
    dataModelId: 'a',
    archivedAt: null,
  });
  expect(result).toEqual([
    expect.objectContaining({
      _id: 'enabled',
      name: 'Enabled',
      code: 'enabled',
      isRequired: true,
    }),
  ]);
});
