import { nanoid } from 'nanoid';
import { DATA_MODEL_RECORD_FIELD_TYPES } from './records/types';
import {
  getBuiltinDataModels,
  getCustomDataModelSystemFields,
} from './builtins';
import type {
  DataModelDefinitionChanges,
  IDataModel,
  IDataModelDefinition,
  IDataModelDefinitionStore,
  IDataModelList,
} from './types';
import {
  dataModelActorSchema,
  dataModelCreateSchema,
  dataModelListSchema,
  dataModelUpdateSchema,
  dataModelVersionSchema,
} from './validation';

const toCustomDataModel = (definition: IDataModelDefinition): IDataModel => ({
  ...definition,
  source: 'CUSTOM',
  contentType: `core:dataModel_${definition._id}`,
  systemFields: getCustomDataModelSystemFields(),
  recordFieldTypes: [...DATA_MODEL_RECORD_FIELD_TYPES],
});

const withBuiltinPresentation = (
  builtin: IDataModel,
  override?: IDataModelDefinition | null,
): IDataModel =>
  override?.source === 'BUILTIN'
    ? {
        ...builtin,
        labelSingular: override.labelSingular,
        labelPlural: override.labelPlural,
        description: override.description,
        icon: override.icon,
        recordLabelField: override.recordLabelField ?? null,
        recordImageField: override.recordImageField ?? null,
        version: override.version,
        updatedAt: override.updatedAt,
        updatedBy: override.updatedBy,
      }
    : builtin;

export class DataModelRegistry {
  constructor(private readonly store: IDataModelDefinitionStore) {}

  async list(input: unknown = {}): Promise<IDataModelList> {
    const params = dataModelListSchema.parse(input);
    const overrides = params.archived
      ? []
      : await this.store.builtinOverrides();
    const builtins = params.archived
      ? []
      : getBuiltinDataModels().map((builtin) =>
          withBuiltinPresentation(
            builtin,
            overrides.find((entry) => entry._id === builtin._id),
          ),
        );
    const list = builtins.slice(params.offset, params.offset + params.limit);
    const customLimit = params.limit - list.length;
    const [custom, count] = await Promise.all([
      customLimit > 0
        ? this.store.list({
            ...params,
            offset: Math.max(0, params.offset - builtins.length),
            limit: customLimit,
          })
        : Promise.resolve([]),
      this.store.count(params.archived),
    ]);

    return {
      list: [...list, ...custom.map(toCustomDataModel)],
      totalCount: builtins.length + count,
    };
  }

  async get(id: string): Promise<IDataModel> {
    const builtin = getBuiltinDataModels().find((model) => model._id === id);

    if (builtin) {
      return withBuiltinPresentation(builtin, await this.store.findById(id));
    }

    return toCustomDataModel(await this.getCustomDefinition(id));
  }

  async create(input: unknown, actorId: string): Promise<IDataModel> {
    const actor = dataModelActorSchema.parse(actorId);
    const settings = dataModelCreateSchema.parse(input);
    const reservedNames = [
      ...getBuiltinDataModels().map(({ name }) => name),
      'customers',
      'companies',
      'products',
      'users',
      'team_members',
    ];

    if (reservedNames.includes(settings.name)) {
      throw new Error('This model name is reserved for a built-in model');
    }
    await this.ensureSchemaCapacity();

    const now = new Date();

    try {
      return toCustomDataModel(
        await this.store.insert({
          ...settings,
          source: 'CUSTOM',
          _id: nanoid(),
          version: 1,
          createdAt: now,
          updatedAt: now,
          createdBy: actor,
          updatedBy: actor,
          archivedAt: null,
          archivedBy: null,
        }),
      );
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new Error('A custom model with this name already exists');
      }

      throw error;
    }
  }

  async update(
    id: string,
    input: unknown,
    expectedVersion: number,
    actorId: string,
  ): Promise<IDataModel> {
    const settings = dataModelUpdateSchema.parse(input);
    const builtin = getBuiltinDataModels().find((model) => model._id === id);
    if (builtin) {
      const version = dataModelVersionSchema.parse(expectedVersion);
      const actor = dataModelActorSchema.parse(actorId);
      const current = await this.get(id);
      if (current.version !== version)
        throw new Error('Data model changed; reload it before saving');
      await this.validateRecordIdentity(current, settings);
      const now = new Date();
      if (version === 1) {
        try {
          const override = await this.store.insert({
            _id: id,
            name: builtin.name,
            source: 'BUILTIN',
            labelSingular: current.labelSingular,
            labelPlural: current.labelPlural,
            description: current.description,
            icon: current.icon,
            recordLabelField: current.recordLabelField,
            recordImageField: current.recordImageField,
            ...settings,
            version: 2,
            createdAt: now,
            updatedAt: now,
            createdBy: actor,
            updatedBy: actor,
            archivedAt: null,
            archivedBy: null,
          });
          return withBuiltinPresentation(builtin, override);
        } catch (error: unknown) {
          if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 11000
          )
            throw new Error('Data model changed; reload it before saving');
          throw error;
        }
      }
      const updated = await this.store.update(id, version, {
        ...settings,
        updatedAt: now,
        updatedBy: actor,
      });
      if (!updated)
        throw new Error('Data model changed; reload it before saving');
      return withBuiltinPresentation(builtin, updated);
    }
    const definition = await this.getCustomDefinition(id, expectedVersion);

    if (definition.archivedAt) {
      throw new Error('Restore the model before editing its settings');
    }

    await this.validateRecordIdentity(toCustomDataModel(definition), settings);
    return this.save(id, expectedVersion, actorId, settings);
  }

  private async validateRecordIdentity(
    model: IDataModel,
    settings: {
      recordLabelField?: string | null;
      recordImageField?: string | null;
    },
  ): Promise<void> {
    if (!settings.recordLabelField && !settings.recordImageField) return;
    const fields =
      model.source === 'BUILTIN'
        ? model.systemFields.map((field) => ({
            _id: field.code,
            type: field.type,
          }))
        : await this.store.identityFields(model._id);
    for (const [setting, types] of [
      ['recordLabelField', ['text', 'phone', 'textarea']],
      ['recordImageField', model.source === 'BUILTIN' ? ['file'] : ['text']],
    ] as const) {
      const id = settings[setting];
      const allowedTypes: readonly string[] = types;
      if (
        id &&
        !fields.some(
          (field) => field._id === id && allowedTypes.includes(field.type),
        )
      )
        throw new Error(
          setting === 'recordLabelField'
            ? 'Choose an active text field on this object for the record label'
            : 'Choose an image field on this object, or a text field containing an image URL',
        );
    }
  }

  async archive(
    id: string,
    expectedVersion: number,
    actorId: string,
  ): Promise<IDataModel> {
    const definition = await this.getCustomDefinition(id, expectedVersion);

    if (definition.archivedAt) {
      throw new Error('This model is already archived');
    }

    return this.save(id, expectedVersion, actorId, {
      archivedAt: new Date(),
      archivedBy: dataModelActorSchema.parse(actorId),
    });
  }

  async restore(
    id: string,
    expectedVersion: number,
    actorId: string,
  ): Promise<IDataModel> {
    const definition = await this.getCustomDefinition(id, expectedVersion);

    if (!definition.archivedAt) {
      throw new Error('This model is not archived');
    }
    await this.ensureSchemaCapacity();

    return this.save(id, expectedVersion, actorId, {
      archivedAt: null,
      archivedBy: null,
    });
  }

  private async getCustomDefinition(
    id: string,
    expectedVersion?: number,
  ): Promise<IDataModelDefinition> {
    if (getBuiltinDataModels().some((model) => model._id === id)) {
      throw new Error(
        'Built-in models cannot be changed through the model registry',
      );
    }

    const definition = await this.store.findById(id);

    if (!definition) {
      throw new Error('Data model not found');
    }

    if (
      expectedVersion !== undefined &&
      definition.version !== dataModelVersionSchema.parse(expectedVersion)
    ) {
      throw new Error('Data model changed; reload it before saving');
    }

    return definition;
  }

  private async ensureSchemaCapacity(): Promise<void> {
    if (
      (await this.store.count(false)) + getBuiltinDataModels().length >=
      1000
    ) {
      throw new Error('A workspace supports at most 1000 active data models');
    }
  }

  private async save(
    id: string,
    expectedVersion: number,
    actorId: string,
    changes: DataModelDefinitionChanges,
  ): Promise<IDataModel> {
    const version = dataModelVersionSchema.parse(expectedVersion);
    const actor = dataModelActorSchema.parse(actorId);
    const updated = await this.store.update(id, version, {
      ...changes,
      updatedAt: new Date(),
      updatedBy: actor,
    });

    if (!updated) {
      throw new Error('Data model changed; reload it before saving');
    }

    return toCustomDataModel(updated);
  }
}
