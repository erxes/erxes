import { nanoid } from 'nanoid';
import { Schema, type Connection, type Model } from 'mongoose';
import { schemaWrapper } from 'erxes-api-shared/utils';
import { z } from 'zod';
import type { DataModelRegistry } from '../registry';
import { DATA_MODEL_RECORD_FIELD_TYPES } from '../records/types';

export interface IDataModelField {
  _id: string;
  dataModelId: string;
  name: string;
  label: string;
  description: string;
  type: string;
  required: boolean;
  options: { label: string; value: string }[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  archivedAt: Date | null;
  relation?: {
    targetModelId: string;
    multiple: boolean;
    inverseFieldId: string;
    isInverse: boolean;
    morphId?: string;
    morphName?: string;
    morphSize?: number;
    targetModelName?: string;
    targetModelLabel?: string;
  } | null;
}

const nameSchema = z
  .string()
  .regex(/^[a-z][A-Za-z0-9_]{0,62}$/)
  .refine(
    (name) => !['constructor', 'prototype', '__proto__'].includes(name),
    'Reserved field name',
  );
const presentation = {
  label: z.string().trim().min(1).max(100),
  description: z.string().trim().max(2000).default(''),
  required: z.boolean().default(false),
  options: z
    .array(
      z
        .object({
          label: z.string().trim().min(1).max(100),
          value: z
            .string()
            .regex(/^[A-Za-z][A-Za-z0-9_]{0,62}$/)
            .refine((value) => !['true', 'false', 'null'].includes(value)),
        })
        .strict(),
    )
    .max(100)
    .default([]),
};
const createSchema = z
  .object({
    name: nameSchema,
    autoName: z.boolean().optional(),
    type: z.enum(DATA_MODEL_RECORD_FIELD_TYPES),
    relation: z
      .object({
        targetModelId: z.string().min(1).max(128).optional(),
        targetModelIds: z
          .array(z.string().min(1).max(128))
          .min(1)
          .max(20)
          .optional(),
        multiple: z.boolean().default(false),
        inverseName: nameSchema,
        autoInverseName: z.boolean().optional(),
        inverseLabel: z.string().trim().min(1).max(100),
      })
      .strict()
      .optional(),
    ...presentation,
  })
  .strict();
const updateSchema = z.object(presentation).partial().strict();

export const getDataModelFieldModel = (
  connection: Connection,
): Model<IDataModelField> => {
  const name = 'data_model_fields';
  if (connection.models[name]) return connection.model<IDataModelField>(name);
  const schema = schemaWrapper(
    new Schema<IDataModelField>(
      {
        dataModelId: { type: String, required: true, immutable: true },
        name: { type: String, required: true, immutable: true },
        label: { type: String, required: true },
        description: { type: String, default: '' },
        type: {
          type: String,
          required: true,
          immutable: true,
          enum: DATA_MODEL_RECORD_FIELD_TYPES,
        },
        relation: {
          type: new Schema(
            {
              targetModelId: { type: String, required: true },
              multiple: { type: Boolean, required: true },
              inverseFieldId: { type: String, required: true },
              isInverse: { type: Boolean, required: true },
              morphId: String,
              morphName: String,
              morphSize: Number,
              targetModelName: String,
              targetModelLabel: String,
            },
            { _id: false },
          ),
          immutable: true,
          default: null,
        },
        required: { type: Boolean, default: false },
        options: [
          {
            _id: false,
            label: { type: String, required: true },
            value: { type: String, required: true },
          },
        ],
        version: { type: Number, default: 1, required: true },
        createdBy: { type: String, required: true, immutable: true },
        updatedBy: { type: String, required: true },
        archivedAt: { type: Date, default: null },
      },
      { timestamps: true },
    ),
  );
  schema.index({ dataModelId: 1, name: 1 }, { unique: true });
  schema.index({ 'relation.targetModelId': 1, archivedAt: 1 });
  return connection.model<IDataModelField>(name, schema, name);
};

export const BUILTIN_GRAPHQL_TYPES: Record<string, string> = {
  customer: 'Customer',
  company: 'Company',
  product: 'Product',
  user: 'User',
};

export class DataModelFields {
  private readonly fields: Model<IDataModelField>;
  constructor(
    connection: Connection,
    private readonly registry: Pick<DataModelRegistry, 'get'>,
  ) {
    this.fields = getDataModelFieldModel(connection);
  }

  async list(modelId: string, archived = false): Promise<IDataModelField[]> {
    await this.registry.get(modelId);
    return this.fields
      .find({
        dataModelId: modelId,
        archivedAt: archived ? { $ne: null } : null,
      })
      .sort({ createdAt: 1, _id: 1 })
      .lean<IDataModelField[]>()
      .exec();
  }

  async create(
    modelId: string,
    input: unknown,
    actor: string,
    reserved: string[] = [],
    targetReserved: string[] | Record<string, string[]> = [],
  ): Promise<IDataModelField> {
    const parsed = createSchema.parse(input);
    const { autoName, ...params } = parsed;
    if (autoName) {
      const source = await this.activeModel(modelId);
      params.name = await this.availableName(modelId, params.name, [
        ...reserved,
        ...source.systemFields.map((entry) => entry.code),
      ]);
    }
    const relation = params.relation;
    if (!relation) return this.createOne(modelId, params, actor, reserved, []);
    if (relation.targetModelId && relation.targetModelIds)
      throw new Error(
        'Provide one destination or a list of destinations, not both',
      );
    const destinations =
      relation.targetModelIds ??
      (relation.targetModelId ? [relation.targetModelId] : []);
    if (!destinations.length)
      throw new Error('Choose at least one destination object');
    if (new Set(destinations).size !== destinations.length)
      throw new Error('Destination objects must be unique');
    if (destinations.length > 1 && destinations.includes(modelId))
      throw new Error(
        'A relation cannot include its source object with other destinations',
      );
    const settings = {
      multiple: relation.multiple,
      inverseName: relation.inverseName,
      inverseLabel: relation.inverseLabel,
    };
    const reservedFor = (id: string): string[] =>
      Array.isArray(targetReserved) ? targetReserved : targetReserved[id] ?? [];
    if (destinations.length === 1) {
      const target = await this.activeModel(destinations[0]);
      const inverseName = relation.autoInverseName
        ? await this.availableName(target._id, relation.inverseName, [
            ...reservedFor(target._id),
            ...target.systemFields.map((entry) => entry.code),
            ...(target._id === modelId ? [params.name] : []),
          ])
        : relation.inverseName;
      return this.createOne(
        modelId,
        {
          ...params,
          relation: { ...settings, inverseName, targetModelId: target._id },
        },
        actor,
        reserved,
        reservedFor(target._id),
      );
    }
    await this.activeModel(modelId);
    if (
      reserved.includes(params.name) ||
      (await this.fields.exists({
        dataModelId: modelId,
        $or: [{ name: params.name }, { 'relation.morphName': params.name }],
      }))
    )
      throw new Error(
        'This relation name is already in use, including archived fields',
      );
    const morph = {
      id: nanoid(),
      name: params.name,
      size: destinations.length,
    };
    const created: IDataModelField[] = [];
    try {
      for (const targetId of destinations) {
        const target = await this.activeModel(targetId);
        const name = `${params.name}_${target.name}`;
        const inverseName = relation.autoInverseName
          ? await this.availableName(target._id, settings.inverseName, [
              ...reservedFor(target._id),
              ...target.systemFields.map((entry) => entry.code),
            ])
          : settings.inverseName;
        if (name.length > 63)
          throw new Error(
            'Use a shorter GraphQL name for this multi-object relation',
          );
        created.push(
          await this.createOne(
            modelId,
            {
              ...params,
              name,
              relation: { ...settings, inverseName, targetModelId: targetId },
            },
            actor,
            reserved,
            reservedFor(targetId),
            {
              ...morph,
              targetModelName: target.name,
              targetModelLabel: target.labelSingular,
            },
          ),
        );
      }
      return created[0];
    } catch (error: unknown) {
      const ids = created.flatMap((field) =>
        [field._id, field.relation?.inverseFieldId].filter((id): id is string =>
          Boolean(id),
        ),
      );
      if (ids.length) await this.fields.deleteMany({ _id: { $in: ids } });
      throw error;
    }
  }

  private async createOne(
    modelId: string,
    input: unknown,
    actor: string,
    reserved: string[] = [],
    targetReserved: string[] = [],
    morph?: {
      id: string;
      name: string;
      size: number;
      targetModelName: string;
      targetModelLabel: string;
    },
  ): Promise<IDataModelField> {
    const model = await this.activeModel(modelId);
    const params = createSchema.parse(input);
    if (params.relation && !params.relation.targetModelId)
      throw new Error('A destination object is required');
    const recordNames = [
      '_id',
      'id',
      'dataModelId',
      'values',
      'propertiesData',
      'version',
      'createdAt',
      'updatedAt',
      'createdBy',
      'updatedBy',
      'deletedAt',
      'deletedBy',
    ];
    const systemNames = [
      ...recordNames,
      ...model.systemFields.map((field) => field.code),
      ...reserved,
    ];
    if (systemNames.includes(params.name))
      throw new Error('This field name is reserved by the model');
    if ((params.type === 'relation') !== Boolean(params.relation))
      throw new Error(
        'Relation fields require a target and reverse field; other types cannot define a relation',
      );
    if (params.relation) {
      if (model.source === 'BUILTIN' && !BUILTIN_GRAPHQL_TYPES[model.name])
        throw new Error('This built-in model does not support relations');
      const target = await this.activeModel(
        params.relation.targetModelId ?? '',
      );
      if (target.source === 'BUILTIN' && !BUILTIN_GRAPHQL_TYPES[target.name])
        throw new Error('This built-in model does not support relations');
      if (
        [
          ...recordNames,
          ...target.systemFields.map((field) => field.code),
          ...targetReserved,
        ].includes(params.relation.inverseName)
      )
        throw new Error(
          'The reverse field name is reserved by the target model',
        );
      if (
        target._id === model._id &&
        params.name === params.relation.inverseName
      )
        throw new Error(
          'A self relation requires different forward and reverse field names',
        );
      const targetCount = await this.fields.countDocuments({
        dataModelId: target._id,
      });
      if (targetCount >= (target._id === model._id ? 199 : 200))
        throw new Error('The target model has no capacity for a reverse field');
    }
    if (
      !morph &&
      (await this.fields.exists({
        dataModelId: modelId,
        'relation.morphName': params.name,
      }))
    )
      throw new Error('This name belongs to an existing multi-object relation');
    const count = await this.fields.countDocuments({ dataModelId: modelId });
    if (count >= 200)
      throw new Error('A model supports at most 200 field definitions');
    this.validateOptions(params.type, params.options);
    await this.fields.init();
    const now = new Date();
    if (params.relation) {
      const id = nanoid();
      const inverseId = nanoid();
      const { relation, ...values } = params;
      const common = {
        version: 1,
        createdBy: actor,
        updatedBy: actor,
        createdAt: now,
        updatedAt: now,
        archivedAt: null,
      };
      if (model.source === 'BUILTIN')
        await this.fields.db
          .collection('data_model_builtin_values')
          .createIndex({ 'propertiesData.$**': 1 });
      try {
        const [created] = await this.fields.insertMany([
          {
            ...values,
            ...common,
            _id: id,
            dataModelId: modelId,
            relation: {
              targetModelId: relation.targetModelId,
              multiple: relation.multiple,
              inverseFieldId: inverseId,
              isInverse: false,
              ...(morph
                ? {
                    morphId: morph.id,
                    morphName: morph.name,
                    morphSize: morph.size,
                    targetModelName: morph.targetModelName,
                    targetModelLabel: morph.targetModelLabel,
                  }
                : {}),
            },
          },
          {
            ...common,
            _id: inverseId,
            dataModelId: relation.targetModelId,
            name: relation.inverseName,
            label: relation.inverseLabel,
            description: `Reverse of ${model.name}.${params.name}`,
            type: 'relation',
            required: false,
            options: [],
            relation: {
              targetModelId: modelId,
              multiple: true,
              inverseFieldId: id,
              isInverse: true,
            },
          },
        ]);
        return created.toObject<IDataModelField>();
      } catch (error: unknown) {
        await this.fields.deleteMany({ _id: { $in: [id, inverseId] } });
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          error.code === 11000
        )
          throw new Error(
            'A forward or reverse field name already exists, including archived fields',
          );
        throw error;
      }
    }
    try {
      return (
        await this.fields.create({
          ...params,
          _id: nanoid(),
          dataModelId: modelId,
          version: 1,
          createdBy: actor,
          updatedBy: actor,
          createdAt: now,
          updatedAt: now,
          archivedAt: null,
        })
      ).toObject<IDataModelField>();
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      )
        throw new Error(
          'A field with this GraphQL name already exists. Restore it from Archived fields instead.',
        );
      throw error;
    }
  }

  async update(
    modelId: string,
    id: string,
    input: unknown,
    version: number,
    actor: string,
  ): Promise<IDataModelField> {
    await this.activeModel(modelId);
    const previous = await this.get(modelId, id, version);
    if (previous.relation?.isInverse)
      throw new Error('Manage a reverse relation from its original field');
    if (previous.archivedAt)
      throw new Error('Restore this field before editing it');
    const patch = updateSchema.parse(input);
    if (!Object.keys(patch).length)
      throw new Error('At least one field setting is required');
    if (patch.options) {
      this.validateOptions(previous.type, patch.options);
      const removed = previous.options.filter(
        (option) => !patch.options?.some((next) => next.value === option.value),
      );
      if (removed.length)
        throw new Error(
          'Option API values are permanent. Keep existing values; their labels can change and new options can be added.',
        );
    }
    return previous.relation?.morphId
      ? this.saveMorph(previous, version, patch, actor)
      : this.save(modelId, id, version, patch, actor);
  }

  async setArchived(
    modelId: string,
    id: string,
    version: number,
    actor: string,
    archived: boolean,
  ): Promise<IDataModelField> {
    await this.activeModel(modelId);
    const previous = await this.get(modelId, id, version);
    if (previous.relation?.isInverse)
      throw new Error('Archive or restore a relation from its original field');
    if (previous.relation?.morphId) {
      const members = await this.morphMembers(previous, version);
      if (members.some((member) => Boolean(member.archivedAt) === archived))
        throw new Error(
          archived
            ? 'Relation is already archived'
            : 'Relation is already active',
        );
      if (!archived)
        for (const member of members)
          await this.activeModel(member.relation?.targetModelId ?? '');
      const saved = await this.saveMorph(
        previous,
        version,
        { archivedAt: archived ? new Date() : null },
        actor,
      );
      await this.fields.updateMany(
        {
          _id: {
            $in: members.map((member) => member.relation?.inverseFieldId),
          },
        },
        {
          $set: {
            archivedAt: saved.archivedAt,
            updatedBy: actor,
            updatedAt: new Date(),
          },
          $inc: { version: 1 },
        },
      );
      return saved;
    }
    if (previous.relation && !archived)
      await this.activeModel(previous.relation.targetModelId);
    if (Boolean(previous.archivedAt) === archived)
      throw new Error(
        archived ? 'Field is already archived' : 'Field is already active',
      );
    const saved = await this.save(
      modelId,
      id,
      version,
      { archivedAt: archived ? new Date() : null },
      actor,
    );
    if (previous.relation)
      await this.fields.updateOne(
        { _id: previous.relation.inverseFieldId },
        {
          $set: { archivedAt: saved.archivedAt, updatedBy: actor },
          $inc: { version: 1 },
        },
      );
    return saved;
  }

  private async availableName(
    modelId: string,
    requested: string,
    reserved: string[],
  ): Promise<string> {
    const existing = await this.fields
      .find({ dataModelId: modelId })
      .select({ name: 1, 'relation.morphName': 1 })
      .lean<IDataModelField[]>()
      .exec();
    const used = new Set([
      ...reserved,
      'id',
      'dataModelId',
      'values',
      'propertiesData',
      'version',
      'createdAt',
      'updatedAt',
      'createdBy',
      'updatedBy',
      'deletedAt',
      'deletedBy',
      ...existing.flatMap((field) => [
        field.name,
        field.relation?.morphName ?? '',
      ]),
    ]);
    let candidate = requested;
    for (let suffix = 2; used.has(candidate); suffix++) {
      const ending = String(suffix);
      candidate = `${requested.slice(0, 63 - ending.length)}${ending}`;
    }
    return candidate;
  }

  private async morphMembers(
    field: IDataModelField,
    version: number,
  ): Promise<IDataModelField[]> {
    const members = await this.fields
      .find({
        dataModelId: field.dataModelId,
        'relation.morphId': field.relation?.morphId,
      })
      .lean<IDataModelField[]>()
      .exec();
    if (
      members.length !== field.relation?.morphSize ||
      members.some((member) => member.version !== version)
    )
      throw new Error(
        'Relation changed or is incomplete; reload it before saving',
      );
    return members;
  }

  private async saveMorph(
    field: IDataModelField,
    version: number,
    changes: Partial<IDataModelField>,
    actor: string,
  ): Promise<IDataModelField> {
    const members = await this.morphMembers(field, version);
    const result = await this.fields.updateMany(
      {
        _id: { $in: members.map((member) => member._id) },
        dataModelId: field.dataModelId,
        version,
      },
      {
        $set: { ...changes, updatedBy: actor, updatedAt: new Date() },
        $inc: { version: 1 },
      },
      { runValidators: true },
    );
    if (result.matchedCount !== members.length)
      throw new Error('Relation changed; reload it before saving');
    return this.get(field.dataModelId, field._id, version + 1);
  }

  private async activeModel(id: string) {
    const model = await this.registry.get(id);
    if (model.archivedAt)
      throw new Error('Restore the model before changing its fields');
    return model;
  }

  private async get(
    modelId: string,
    id: string,
    version: number,
  ): Promise<IDataModelField> {
    if (!Number.isInteger(version) || version < 1)
      throw new Error('A valid expectedVersion is required');
    const field = await this.fields
      .findOne({ _id: id, dataModelId: modelId })
      .lean<IDataModelField>()
      .exec();
    if (!field) throw new Error('Data model field not found');
    if (field.version !== version)
      throw new Error('Field changed; reload it before saving');
    return field;
  }

  private async save(
    modelId: string,
    id: string,
    version: number,
    changes: Partial<IDataModelField>,
    actor: string,
  ): Promise<IDataModelField> {
    const field = await this.fields
      .findOneAndUpdate(
        { _id: id, dataModelId: modelId, version },
        {
          $set: { ...changes, updatedBy: actor, updatedAt: new Date() },
          $inc: { version: 1 },
        },
        { new: true, runValidators: true },
      )
      .lean<IDataModelField>()
      .exec();
    if (!field) throw new Error('Field changed; reload it before saving');
    return field;
  }

  private validateOptions(type: string, options: { value: string }[]): void {
    const choice = ['select', 'radio', 'multiSelect', 'check'].includes(type);
    if (choice && !options.length)
      throw new Error('Choice fields require at least one option');
    if (!choice && options.length)
      throw new Error('Only choice fields accept options');
    if (new Set(options.map((option) => option.value)).size !== options.length)
      throw new Error('Option values must be unique');
  }
}
