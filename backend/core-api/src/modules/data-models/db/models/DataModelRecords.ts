import type { Connection, Model } from 'mongoose';
import { createDataModelRecordSchema } from '../definitions/dataModelRecords';
import { dataModelRecordCollectionName } from '../../records/identity';
import type {
  IDataModelRecord,
  IDataModelRecordDocument,
  IDataModelRecordQuery,
  IDataModelRecordStore,
} from '../../records/types';

export const getDataModelRecordModel = (
  connection: Connection,
  modelId: string,
): Model<IDataModelRecordDocument> => {
  const name = dataModelRecordCollectionName(modelId);
  return connection.models[name]
    ? connection.model<IDataModelRecordDocument>(name)
    : connection.model<IDataModelRecordDocument>(
        name,
        createDataModelRecordSchema(),
        name,
      );
};

// Model and deleted-state predicates cannot be overridden by caller-supplied filters.
export const createDataModelRecordStore = (
  connection: Connection,
  modelId: string,
): IDataModelRecordStore => {
  const model = getDataModelRecordModel(connection, modelId);
  const identity = (deleted: boolean) => ({
    dataModelId: modelId,
    deletedAt: deleted ? { $ne: null } : null,
  });
  const selector = (query: IDataModelRecordQuery) => ({
    $and: [identity(query.deleted), query.filter],
  });
  return {
    list: (query) =>
      model
        .find(selector(query))
        .sort(query.sort)
        .skip(query.offset)
        .limit(query.limit)
        .maxTimeMS(3000)
        .lean<IDataModelRecord[]>()
        .exec(),
    count: (query) =>
      model.countDocuments(selector(query)).maxTimeMS(3000).exec(),
    get: (id, deleted) =>
      model
        .findOne({ ...identity(deleted), _id: id })
        .lean<IDataModelRecord>()
        .exec(),
    insert: async (record) => {
      if (record.dataModelId !== modelId)
        throw new Error('Record belongs to another data model');
      await model.init();
      return (await model.create(record)).toObject<IDataModelRecord>();
    },
    update: (id, expectedVersion, deleted, changes) =>
      model
        .findOneAndUpdate(
          { ...identity(deleted), _id: id, version: expectedVersion },
          { $set: changes, $inc: { version: 1 } },
          { new: true, runValidators: true },
        )
        .lean<IDataModelRecord>()
        .exec(),
  };
};
