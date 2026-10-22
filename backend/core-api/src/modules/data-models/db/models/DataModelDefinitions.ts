import type { Model } from 'mongoose';
import { getDataModelFieldModel } from '../../fields/registry';
import type {
  IDataModelDefinition,
  IDataModelDefinitionDocument,
  IDataModelDefinitionStore,
} from '../../types';

const archiveSelector = (archived: boolean) => ({
  source: { $ne: 'BUILTIN' },
  archivedAt: archived ? { $ne: null } : null,
});

// The model is supplied from the request tenant's IModels, never mongoose's global connection.
export const createDataModelDefinitionStore = (
  model: Model<IDataModelDefinitionDocument>,
): IDataModelDefinitionStore => ({
  builtinOverrides: () =>
    model.find({ source: 'BUILTIN' }).lean<IDataModelDefinition[]>().exec(),
  identityFields: (dataModelId) =>
    getDataModelFieldModel(model.db)
      .find({
        dataModelId,
        archivedAt: null,
        type: { $in: ['text', 'phone', 'textarea'] },
      })
      .select({ _id: 1, type: 1 })
      .lean<{ _id: string; type: string }[]>()
      .exec(),
  list: ({ archived, limit, offset }) =>
    model
      .find(archiveSelector(archived))
      .sort({ name: 1 })
      .skip(offset)
      .limit(limit)
      .lean<IDataModelDefinition[]>()
      .exec(),
  count: (archived) => model.countDocuments(archiveSelector(archived)).exec(),
  findById: (id) =>
    model.findOne({ _id: id }).lean<IDataModelDefinition>().exec(),
  insert: async (definition) => {
    await model.init();
    return (await model.create(definition)).toObject<IDataModelDefinition>();
  },
  update: (id, expectedVersion, changes) =>
    model
      .findOneAndUpdate(
        { _id: id, version: expectedVersion },
        { $set: changes, $inc: { version: 1 } },
        { new: true, runValidators: true },
      )
      .lean<IDataModelDefinition>()
      .exec(),
});
