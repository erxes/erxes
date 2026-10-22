import type { Connection } from 'mongoose';
import { z } from 'zod';
import { escapeRegExp } from 'lodash';
import { createDataModelDefinitionStore } from './db/models/DataModelDefinitions';
import { getDataModelRecordModel } from './db/models/DataModelRecords';
import {
  getDataModelFieldModel,
  type IDataModelField,
} from './fields/registry';
import { DataModelRegistry } from './registry';
import { dataModelRecordIdSchema } from './records/validation';
import type { IDataModel } from './types';
import type { IDataModelDefinitionDocument } from './types';
import { dataModelDefinitionSchema } from './db/definitions/dataModelDefinitions';

export const DATA_MODEL_BUILTIN_ACCESS: Record<
  string,
  { read: string; update: string; collection: string }
> = {
  customer: {
    read: 'contactsRead',
    update: 'contactsUpdate',
    collection: 'customers',
  },
  company: {
    read: 'contactsRead',
    update: 'contactsUpdate',
    collection: 'companies',
  },
  product: {
    read: 'productsRead',
    update: 'productsUpdate',
    collection: 'products',
  },
  user: {
    read: 'teamMembersRead',
    update: 'teamMembersUpdate',
    collection: 'users',
  },
};

interface RelatedRecord extends Record<string, unknown> {
  _id: string;
  propertiesData?: Record<string, unknown>;
}

// Both forward reads and reverse lookups use only this request's tenant connection.
export class DataModelRelations {
  private readonly registry: DataModelRegistry;
  constructor(
    private readonly connection: Connection,
    private readonly checkPermission: (action: string) => Promise<void>,
  ) {
    const definitions = connection.models.data_model_definitions
      ? connection.model<IDataModelDefinitionDocument>('data_model_definitions')
      : connection.model<IDataModelDefinitionDocument>(
          'data_model_definitions',
          dataModelDefinitionSchema,
        );
    this.registry = new DataModelRegistry(
      createDataModelDefinitionStore(definitions),
    );
  }

  async target(id: string): Promise<IDataModel> {
    await this.checkPermission('dataModelRecordsRead');
    const model = await this.registry.get(id);
    if (model.archivedAt) throw new Error('The related model is archived');
    if (model.source === 'BUILTIN') {
      const access = DATA_MODEL_BUILTIN_ACCESS[model.name];
      if (!access)
        throw new Error('This built-in model does not support relations');
      await this.checkPermission(access.read);
    }
    return model;
  }

  async records(model: IDataModel, ids: string[]): Promise<RelatedRecord[]> {
    if (!ids.length) return [];
    if (model.source === 'BUILTIN')
      return this.connection
        .collection<RelatedRecord>(
          DATA_MODEL_BUILTIN_ACCESS[model.name].collection,
        )
        .find({ _id: { $in: ids }, deletedAt: null })
        .maxTimeMS(3000)
        .toArray();
    return getDataModelRecordModel(this.connection, model._id)
      .find({ dataModelId: model._id, _id: { $in: ids }, deletedAt: null })
      .maxTimeMS(3000)
      .lean<RelatedRecord[]>()
      .exec();
  }

  async validate(field: IDataModelField, value: unknown): Promise<void> {
    if (!field.relation) throw new Error('Relation configuration is missing');
    if (field.relation.isInverse)
      throw new Error(
        'Reverse relations are read-only; edit the original relation',
      );
    const target = await this.target(field.relation.targetModelId);
    if (value === null || value === '') return;
    const ids = field.relation.multiple
      ? z.array(dataModelRecordIdSchema).max(100).parse(value)
      : [dataModelRecordIdSchema.parse(value)];
    if (new Set(ids).size !== ids.length)
      throw new Error('A relation cannot contain duplicate records');
    const found = await this.records(target, ids);
    if (found.length !== ids.length)
      throw new Error(
        `${field.label}: a related record is missing, deleted, or belongs to another model`,
      );
  }

  async resolve(
    field: IDataModelField,
    recordId: string,
    value: unknown,
    args: { limit?: number; offset?: number } = {},
  ): Promise<RelatedRecord | RelatedRecord[] | null> {
    const relation = field.relation;
    if (!relation) throw new Error('Relation configuration is missing');
    const target = await this.target(relation.targetModelId);
    if (!relation.isInverse) {
      const ids = relation.multiple
        ? z
            .array(dataModelRecordIdSchema)
            .max(100)
            .parse(value ?? [])
        : value == null
        ? []
        : [dataModelRecordIdSchema.parse(value)];
      const found = new Map(
        (await this.records(target, ids)).map((record) => [record._id, record]),
      );
      const ordered = ids.flatMap((id) => {
        const record = found.get(id);
        return record ? [record] : [];
      });
      return relation.multiple ? ordered : ordered[0] ?? null;
    }
    const limit = z
      .number()
      .int()
      .min(1)
      .max(100)
      .parse(args.limit ?? 25);
    const offset = z
      .number()
      .int()
      .min(0)
      .max(100000)
      .parse(args.offset ?? 0);
    const owner = await getDataModelFieldModel(this.connection)
      .findOne({
        _id: relation.inverseFieldId,
        dataModelId: target._id,
        archivedAt: null,
      })
      .lean<IDataModelField>()
      .exec();
    if (
      !owner?.relation ||
      owner.relation.isInverse ||
      owner.relation.inverseFieldId !== field._id
    )
      return [];
    const path = `propertiesData.${owner._id}`;
    if (target.source === 'CUSTOM')
      return getDataModelRecordModel(this.connection, target._id)
        .find({ dataModelId: target._id, deletedAt: null, [path]: recordId })
        .sort({ _id: 1 })
        .skip(offset)
        .limit(limit)
        .maxTimeMS(3000)
        .lean<RelatedRecord[]>()
        .exec();
    // Filter missing/deleted business records before paging. Otherwise a page
    // of stale sidecars can look empty even when later linked records exist.
    return this.connection
      .collection('data_model_builtin_values')
      .aggregate<RelatedRecord>(
        [
          { $match: { dataModelId: target._id, [path]: recordId } },
          {
            $lookup: {
              from: DATA_MODEL_BUILTIN_ACCESS[target.name].collection,
              localField: 'recordId',
              foreignField: '_id',
              as: 'linkedRecord',
            },
          },
          { $unwind: '$linkedRecord' },
          { $match: { 'linkedRecord.deletedAt': null } },
          { $sort: { recordId: 1 } },
          { $skip: offset },
          { $limit: limit },
          { $replaceRoot: { newRoot: '$linkedRecord' } },
        ],
        { maxTimeMS: 3000 },
      )
      .toArray();
  }

  async options(
    fieldId: string,
    search: string,
    limit: number,
    offset: number,
    recordIds?: string[] | null,
  ): Promise<{
    list: { _id: string; label: string; imageUrl: string | null }[];
    totalCount: number;
  }> {
    const field = await getDataModelFieldModel(this.connection)
      .findOne({
        _id: dataModelRecordIdSchema.parse(fieldId),
        archivedAt: null,
      })
      .lean<IDataModelField>()
      .exec();
    if (!field?.relation) throw new Error('Active relation field not found');
    await this.target(field.dataModelId);
    const target = await this.target(field.relation.targetModelId);
    const term = z.string().max(200).parse(search);
    const pageSize = z.number().int().min(1).max(100).parse(limit);
    const start = z.number().int().min(0).max(100000).parse(offset);
    const identities =
      recordIds == null
        ? undefined
        : z.array(dataModelRecordIdSchema).max(100).parse(recordIds);
    const fields = await getDataModelFieldModel(this.connection)
      .find({
        dataModelId: target._id,
        archivedAt: null,
        type: { $in: ['text', 'phone', 'textarea'] },
      })
      .sort({ createdAt: 1, _id: 1 })
      .lean<IDataModelField[]>()
      .exec();
    const labelField =
      target.source === 'CUSTOM'
        ? fields.find((entry) => entry._id === target.recordLabelField)
        : target.systemFields.find(
            (entry) => entry.code === target.recordLabelField,
          );
    const configuredLabel = labelField
      ? target.source === 'CUSTOM'
        ? `propertiesData.${target.recordLabelField}`
        : target.recordLabelField
      : null;
    const labels = configuredLabel
      ? [configuredLabel]
      : target.recordLabelField
      ? []
      : target.source === 'CUSTOM'
      ? fields.slice(0, 3).map((entry) => `propertiesData.${entry._id}`)
      : target.name === 'customer'
      ? ['firstName', 'lastName', 'primaryEmail']
      : target.name === 'user'
      ? ['details.fullName', 'email']
      : target.name === 'company'
      ? ['primaryName', 'code']
      : ['name', 'code'];
    const imageField =
      target.source === 'CUSTOM'
        ? fields.find(
            (entry) =>
              entry._id === target.recordImageField && entry.type === 'text',
          )
        : target.systemFields.find(
            (entry) =>
              entry.code === target.recordImageField && entry.type === 'file',
          );
    const imagePath = imageField
      ? target.source === 'CUSTOM'
        ? `propertiesData.${target.recordImageField}`
        : target.recordImageField
      : null;
    const query: Record<string, unknown> = {
      deletedAt: null,
      ...(target.source === 'CUSTOM' ? { dataModelId: target._id } : {}),
      ...(identities ? { _id: { $in: identities } } : {}),
      ...(term
        ? {
            $or: ['_id', ...labels].map((path) => ({
              [path]: { $regex: escapeRegExp(term), $options: 'i' },
            })),
          }
        : {}),
    };
    const collectionName =
      target.source === 'CUSTOM'
        ? getDataModelRecordModel(this.connection, target._id).collection
            .collectionName
        : DATA_MODEL_BUILTIN_ACCESS[target.name].collection;
    const collection =
      this.connection.collection<RelatedRecord>(collectionName);
    const [records, totalCount] = await Promise.all([
      collection
        .find(query)
        .sort({ _id: 1 })
        .skip(start)
        .limit(pageSize)
        .maxTimeMS(3000)
        .toArray(),
      collection.countDocuments(query, { maxTimeMS: 3000 }),
    ]);
    const readPath = (record: RelatedRecord, path: string): unknown =>
      path
        .split('.')
        .reduce<unknown>(
          (value, key) =>
            value && typeof value === 'object'
              ? Reflect.get(value, key)
              : undefined,
          record,
        );
    return {
      list: records.map((record) => {
        const image = imagePath ? readPath(record, imagePath) : null;
        const imageUrl =
          typeof image === 'string'
            ? image
            : image &&
              typeof image === 'object' &&
              'url' in image &&
              typeof image.url === 'string'
            ? image.url
            : null;
        return {
          _id: record._id,
          label:
            labels
              .map((path) => readPath(record, path))
              .filter(
                (value): value is string =>
                  typeof value === 'string' && Boolean(value),
              )
              .join(' · ') || record._id,
          imageUrl,
        };
      }),
      totalCount,
    };
  }
}
