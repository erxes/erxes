import { nanoid } from 'nanoid';
import type { DataModelRegistry } from '../registry';
import { dataModelActorSchema, dataModelVersionSchema } from '../validation';
import { validateDataModelRecordPatch } from './fields';
import { buildDataModelRecordQuery } from './query';
import type {
  DataModelRecordEventSink,
  IDataModelRecord,
  IDataModelRecordFields,
  IDataModelRecordList,
  IDataModelRecordStore,
} from './types';
import {
  dataModelRecordIdSchema,
  dataModelRecordInputSchema,
} from './validation';

export interface DataModelRecordDependencies {
  registry: Pick<DataModelRegistry, 'get'>;
  fields: IDataModelRecordFields;
  store: (modelId: string) => IDataModelRecordStore;
  emit: DataModelRecordEventSink;
}

export class DataModelRecords {
  constructor(private readonly dependencies: DataModelRecordDependencies) {}

  async list(
    modelId: string,
    input: unknown = {},
  ): Promise<IDataModelRecordList> {
    const { model, store } = await this.scope(modelId);
    const fields = await this.dependencies.fields.list(model._id);
    const query = buildDataModelRecordQuery(fields, input);
    const [list, totalCount] = await Promise.all([
      store.list(query),
      store.count(query),
    ]);
    return { list, totalCount };
  }

  async get(modelId: string, id: string): Promise<IDataModelRecord> {
    const { store } = await this.scope(modelId);
    return this.getRecord(store, id, false);
  }

  async create(
    modelId: string,
    input: unknown,
    actorId: string,
  ): Promise<IDataModelRecord> {
    const actor = dataModelActorSchema.parse(actorId);
    const patch = dataModelRecordInputSchema.parse(input);
    const { model, store } = await this.scope(modelId);
    const fields = await this.dependencies.fields.list(model._id);
    const propertiesData = await validateDataModelRecordPatch(
      fields,
      this.dependencies.fields.validate,
      patch.propertiesData,
    );
    const now = new Date();
    const current = await store.insert({
      _id: nanoid(),
      dataModelId: model._id,
      propertiesData,
      version: 1,
      createdBy: actor,
      updatedBy: actor,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deletedBy: null,
    });
    this.dependencies.emit(model._id, { action: 'create', current });
    return current;
  }

  async update(
    modelId: string,
    id: string,
    input: unknown,
    expectedVersion: number,
    actorId: string,
  ): Promise<IDataModelRecord> {
    const actor = dataModelActorSchema.parse(actorId);
    const version = dataModelVersionSchema.parse(expectedVersion);
    const patch = dataModelRecordInputSchema.parse(input);
    if (!Object.keys(patch.propertiesData).length)
      throw new Error('At least one field value is required');
    const { model, store } = await this.scope(modelId);
    const previous = await this.getRecord(store, id, false);
    this.assertVersion(previous, version);
    const fields = await this.dependencies.fields.list(model._id);
    const propertiesData = await validateDataModelRecordPatch(
      fields,
      this.dependencies.fields.validate,
      patch.propertiesData,
      previous.propertiesData,
    );
    const current = await store.update(id, version, false, {
      propertiesData,
      updatedAt: new Date(),
      updatedBy: actor,
      deletedAt: null,
      deletedBy: null,
    });
    if (!current) throw new Error('Record changed; reload it before saving');
    this.dependencies.emit(model._id, { action: 'update', previous, current });
    return current;
  }

  async remove(
    modelId: string,
    id: string,
    expectedVersion: number,
    actorId: string,
  ): Promise<IDataModelRecord> {
    return this.setDeleted(modelId, id, expectedVersion, actorId, true);
  }

  async restore(
    modelId: string,
    id: string,
    expectedVersion: number,
    actorId: string,
    input: unknown = { propertiesData: {} },
  ): Promise<IDataModelRecord> {
    return this.setDeleted(modelId, id, expectedVersion, actorId, false, input);
  }

  private async setDeleted(
    modelId: string,
    id: string,
    expectedVersion: number,
    actorId: string,
    deleted: boolean,
    input: unknown = { propertiesData: {} },
  ): Promise<IDataModelRecord> {
    const actor = dataModelActorSchema.parse(actorId);
    const version = dataModelVersionSchema.parse(expectedVersion);
    const { model, store } = await this.scope(modelId);
    const previous = await this.getRecord(store, id, !deleted);
    this.assertVersion(previous, version);
    const propertiesData = deleted
      ? previous.propertiesData
      : await validateDataModelRecordPatch(
          await this.dependencies.fields.list(model._id),
          this.dependencies.fields.validate,
          dataModelRecordInputSchema.parse(input).propertiesData,
          previous.propertiesData,
        );
    const now = new Date();
    const current = await store.update(id, version, !deleted, {
      propertiesData,
      updatedAt: now,
      updatedBy: actor,
      deletedAt: deleted ? now : null,
      deletedBy: deleted ? actor : null,
    });
    if (!current) throw new Error('Record changed; reload it before saving');
    this.dependencies.emit(model._id, {
      action: deleted ? 'delete' : 'update',
      previous,
      current,
    });
    return current;
  }

  private async scope(modelId: string) {
    const model = await this.dependencies.registry.get(modelId);
    if (model.source !== 'CUSTOM')
      throw new Error('Use the existing business API for built-in records');
    if (model.archivedAt)
      throw new Error('Restore the data model before accessing its records');
    dataModelRecordIdSchema.parse(model._id);
    return { model, store: this.dependencies.store(model._id) };
  }

  private async getRecord(
    store: IDataModelRecordStore,
    id: string,
    deleted: boolean,
  ): Promise<IDataModelRecord> {
    const record = await store.get(dataModelRecordIdSchema.parse(id), deleted);
    if (!record) throw new Error('Data model record not found');
    return record;
  }

  private assertVersion(record: IDataModelRecord, version: number): void {
    if (record.version !== version)
      throw new Error('Record changed; reload it before saving');
  }
}
