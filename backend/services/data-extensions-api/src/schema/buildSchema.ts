import {
  GraphQLBoolean,
  GraphQLError,
  GraphQLFieldConfigMap,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLString,
  Kind,
} from 'graphql';
import {
  DATA_EXTENSION_LIMITS,
  DataExtensionFieldType,
  DataExtensionNativeGraphqlType,
  IDataExtensionField,
  IDataExtensionRecord,
  IDataExtensionRecordType,
} from 'erxes-api-shared/core-modules';
import { IRequestContext } from '~/context';

const parseDate = (value: unknown): string => {
  const date =
    value instanceof Date
      ? value
      : typeof value === 'string'
      ? new Date(value)
      : null;

  if (!date || Number.isNaN(date.getTime())) {
    throw new GraphQLError('Date must be an ISO 8601 string');
  }

  return date.toISOString();
};

/** ISO 8601 strings in and out; owners store real dates. */
export const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'ISO 8601 date-time',
  serialize: parseDate,
  parseValue: parseDate,
  parseLiteral: (ast) => {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError('Date must be an ISO 8601 string');
    }

    return parseDate(ast.value);
  },
});

const nativeType = (
  type: DataExtensionNativeGraphqlType,
): GraphQLOutputType => {
  switch (type) {
    case 'ID':
      return new GraphQLNonNull(GraphQLID);
    case 'Int':
      return GraphQLInt;
    case 'Float':
      return GraphQLFloat;
    case 'Boolean':
      return GraphQLBoolean;
    case 'Date':
      return DateScalar;
    case '[String]':
      return new GraphQLList(GraphQLString);
    default:
      return GraphQLString;
  }
};

const valueType = (type: DataExtensionFieldType) => {
  switch (type) {
    case 'number':
      return GraphQLFloat;
    case 'boolean':
      return GraphQLBoolean;
    case 'date':
      return DateScalar;
    case 'multiSelect':
      return new GraphQLList(new GraphQLNonNull(GraphQLString));
    default:
      return GraphQLString;
  }
};

const describeField = (field: IDataExtensionField) => {
  const options = field.options?.length
    ? ` Options: ${field.options.map((option) => option.value).join(', ')}.`
    : '';

  return `${field.label}${
    field.description ? ` — ${field.description}` : ''
  }.${options}`;
};

const lowerFirst = (name: string) =>
  name.charAt(0).toLowerCase() + name.slice(1);

export interface IRecordTypeOperations {
  descriptor: IDataExtensionRecordType;
  fields: IDataExtensionField[];
  lookupField: string;
  lookupManyField: string;
  searchField: string;
  patchField?: string;
}

/** Root field names a record type gets, kept stable for clients. */
export const getRecordTypeOperations = (
  descriptor: IDataExtensionRecordType,
  fields: IDataExtensionField[],
): IRecordTypeOperations => {
  const base = lowerFirst(descriptor.typeName);

  return {
    descriptor,
    fields,
    lookupField: base,
    lookupManyField: `${base}Many`,
    searchField: `${base}Search`,
    patchField: fields.length ? `${base}DataExtensionsPatch` : undefined,
  };
};

export interface IOwnerResolvers {
  load(
    context: IRequestContext,
    descriptor: IDataExtensionRecordType,
    ids: string[],
  ): Promise<(IDataExtensionRecord | null)[]>;
  patch(
    context: IRequestContext,
    descriptor: IDataExtensionRecordType,
    id: string,
    values: Record<string, unknown>,
  ): Promise<IDataExtensionRecord | null>;
  /** Name search for pickers, newest first. */
  search(
    context: IRequestContext,
    descriptor: IDataExtensionRecordType,
    searchValue?: string,
    limit?: number,
  ): Promise<IDataExtensionRecord[]>;
  /**
   * Adds or removes `targetId` on relation `key` of the `descriptor`
   * records `ids`; returns the ids that hold (add) or dropped (remove) it.
   */
  link(
    context: IRequestContext,
    descriptor: IDataExtensionRecordType,
    key: string,
    ids: string[],
    targetId: string,
    action: 'add' | 'remove',
  ): Promise<string[]>;
  /** Records of `descriptor` whose relation `key` links to `targetId`. */
  findByRelation(
    context: IRequestContext,
    descriptor: IDataExtensionRecordType,
    key: string,
    targetId: string,
    limit?: number,
  ): Promise<IDataExtensionRecord[]>;
}

/** Parent of a `<Type>DataExtensions` object: the record and its values. */
interface IValuesParent {
  record: IDataExtensionRecord;
  values: Record<string, unknown>;
}

type RecordOutputType = GraphQLObjectType<
  IDataExtensionRecord,
  IRequestContext
>;

const isList = (field: IDataExtensionField) =>
  field.relation?.kind === 'manyToMany' ||
  (field.relation?.side === 'inverse' && field.relation.kind === 'manyToOne');

const linkedIds = (value: unknown): string[] =>
  (Array.isArray(value) ? value : [value]).filter(
    (id): id is string => typeof id === 'string' && id.length > 0,
  );

const relationDescription = (
  field: IDataExtensionField,
  target: IDataExtensionRecordType,
) =>
  field.relation?.side === 'source'
    ? `${field.label} — links to ${target.label}.`
    : `${field.label} — ${target.label} linking here.`;

interface IPatchResult {
  _id: string;
  ok: boolean;
  error?: string;
  record?: IDataExtensionRecord | null;
}

/** Owner writes run a few at a time so one bulk call cannot flood an owner. */
const BULK_CONCURRENCY = 5;

const mapWithConcurrency = async <T, R>(
  items: T[],
  limit: number,
  run: (item: T) => Promise<R>,
): Promise<R[]> => {
  const results = new Array<R>(items.length);
  let next = 0;

  const worker = async () => {
    while (next < items.length) {
      const index = next++;

      results[index] = await run(items[index]);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );

  return results;
};

/**
 * Builds one tenant's schema from its active definitions. Nothing here is
 * user-specific: permissions and record scope are checked per request by
 * the resolvers and the owners. Object types are built lazily so relations
 * can point in both directions, including to the same record type.
 */
export const buildTenantSchema = ({
  version,
  recordTypes,
  fields,
  owners,
}: {
  version: number;
  recordTypes: IDataExtensionRecordType[];
  /** Active definitions; `_id` pairs the two sides of a relation. */
  fields: (IDataExtensionField & { _id?: string })[];
  owners: IOwnerResolvers;
}): GraphQLSchema => {
  const descriptors = new Map(
    recordTypes.map((descriptor) => [descriptor.recordType, descriptor]),
  );
  // Relations to a record type whose owner is disabled are left out.
  const usableFields = fields.filter(
    (field) =>
      descriptors.has(field.recordType) &&
      (!field.relation || descriptors.has(field.relation.targetRecordType)),
  );
  const outputTypes = new Map<string, RecordOutputType>();
  const fieldsOf = (recordType: string) =>
    usableFields.filter((field) => field.recordType === recordType);
  /** The stored side of a relation, found from either side. */
  const storedFieldOf = (field: IDataExtensionField) =>
    field.relation?.side === 'source'
      ? field
      : usableFields.find(
          (candidate) => candidate._id === field.relation?.inverseFieldId,
        );
  const outputOf = (recordType: string) =>
    outputTypes.get(recordType) as RecordOutputType;

  const loadOne = async (
    context: IRequestContext,
    descriptor: IDataExtensionRecordType,
    id: string,
  ) => {
    await context.requirePermission(descriptor.readAction);
    const [record] = await owners.load(context, descriptor, [id]);

    return record || null;
  };

  const resolveRelation = async (
    field: IDataExtensionField,
    parent: IValuesParent,
    context: IRequestContext,
    limit?: number,
  ) => {
    const relation = field.relation as NonNullable<
      IDataExtensionField['relation']
    >;
    const target = descriptors.get(
      relation.targetRecordType,
    ) as IDataExtensionRecordType;

    await context.requirePermission(target.readAction);

    if (relation.side === 'source') {
      const ids = linkedIds(parent.values[field.key]);
      // A deleted target simply stops resolving, like SET_NULL.
      const records = (await owners.load(context, target, ids)).filter(
        (record): record is IDataExtensionRecord => Boolean(record),
      );

      return isList(field) ? records : records[0] || null;
    }

    const sourceKey = storedFieldOf(field)?.key;

    if (!sourceKey) {
      return isList(field) ? [] : null;
    }

    const records = await owners.findByRelation(
      context,
      target,
      sourceKey,
      parent.record._id,
      isList(field) ? limit : 1,
    );

    return isList(field) ? records : records[0] || null;
  };

  const buildValuesType = (descriptor: IDataExtensionRecordType) =>
    new GraphQLObjectType<IValuesParent, IRequestContext>({
      name: `${descriptor.typeName}DataExtensions`,
      fields: () => {
        const valueFields: GraphQLFieldConfigMap<
          IValuesParent,
          IRequestContext
        > = {};

        for (const field of fieldsOf(descriptor.recordType)) {
          if (!field.relation) {
            valueFields[field.key] = {
              type: valueType(field.type) as GraphQLOutputType,
              description: describeField(field),
              resolve: ({ values }) => values[field.key] ?? null,
            };
            continue;
          }

          const target = descriptors.get(
            field.relation.targetRecordType,
          ) as IDataExtensionRecordType;
          const targetType = outputOf(target.recordType);

          valueFields[field.key] = {
            type: isList(field)
              ? new GraphQLNonNull(
                  new GraphQLList(new GraphQLNonNull(targetType)),
                )
              : targetType,
            description: relationDescription(field, target),
            args:
              isList(field) && field.relation.side === 'inverse'
                ? {
                    limit: {
                      type: GraphQLInt,
                      description: `Page size, at most ${DATA_EXTENSION_LIMITS.relationPageMax}`,
                    },
                  }
                : undefined,
            resolve: (parent, args: { limit?: number }, context) =>
              resolveRelation(field, parent, context, args?.limit),
          };
        }

        return valueFields;
      },
    });

  for (const descriptor of recordTypes) {
    const hasFields = fieldsOf(descriptor.recordType).length > 0;
    const valuesType = hasFields ? buildValuesType(descriptor) : null;

    outputTypes.set(
      descriptor.recordType,
      new GraphQLObjectType<IDataExtensionRecord, IRequestContext>({
        name: descriptor.typeName,
        description: descriptor.label,
        fields: () => {
          const recordFields: GraphQLFieldConfigMap<
            IDataExtensionRecord,
            IRequestContext
          > = {};

          for (const native of descriptor.nativeFields) {
            recordFields[native.name] = {
              type: nativeType(native.graphqlType),
              resolve: (record) =>
                native.name === '_id' ? record._id : record.native[native.name],
            };
          }

          if (valuesType) {
            recordFields.dataExtensions = {
              type: new GraphQLNonNull(valuesType),
              resolve: (record) => ({
                record,
                values: record.dataExtensions || {},
              }),
            };
          }

          return recordFields;
        },
      }),
    );
  }

  const queryFields: GraphQLFieldConfigMap<unknown, IRequestContext> = {
    dataExtensionsVersion: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Metadata version this schema was generated from',
      resolve: () => version,
    },
  };
  const mutationFields: GraphQLFieldConfigMap<unknown, IRequestContext> = {};

  for (const descriptor of recordTypes) {
    const recordFields = fieldsOf(descriptor.recordType);
    const operations = getRecordTypeOperations(descriptor, recordFields);
    const output = outputOf(descriptor.recordType);

    queryFields[operations.lookupField] = {
      type: output,
      args: { _id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_root, args: { _id: string }, context) =>
        loadOne(context, descriptor, args._id),
    };

    queryFields[operations.lookupManyField] = {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(output))),
      args: {
        _ids: {
          type: new GraphQLNonNull(
            new GraphQLList(new GraphQLNonNull(GraphQLID)),
          ),
        },
      },
      resolve: async (_root, args: { _ids: string[] }, context) => {
        if (args._ids.length > DATA_EXTENSION_LIMITS.recordsPerLookup) {
          throw new GraphQLError(
            `At most ${DATA_EXTENSION_LIMITS.recordsPerLookup} ids per lookup`,
          );
        }

        await context.requirePermission(descriptor.readAction);
        const records = await owners.load(context, descriptor, args._ids);

        return records.filter(Boolean);
      },
    };

    // The virtual side of a relation is writable too: its links are
    // written onto the records of the other type.
    queryFields[operations.searchField] = {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(output))),
      description: `Finds ${descriptor.label} by name, newest first. At most ${DATA_EXTENSION_LIMITS.searchPageMax} per call.`,
      args: {
        searchValue: { type: GraphQLString },
        limit: { type: GraphQLInt },
      },
      resolve: async (
        _root,
        args: { searchValue?: string | null; limit?: number | null },
        context,
      ) => {
        if (
          (args.searchValue?.length || 0) >
          DATA_EXTENSION_LIMITS.searchTextLength
        ) {
          throw new GraphQLError(
            `Search text is limited to ${DATA_EXTENSION_LIMITS.searchTextLength} characters`,
          );
        }

        await context.requirePermission(descriptor.readAction);

        return owners.search(
          context,
          descriptor,
          args.searchValue || undefined,
          args.limit || undefined,
        );
      },
    };

    const writable = recordFields.filter(
      (field) => !field.relation || storedFieldOf(field),
    );
    const writableByKey = new Map(writable.map((field) => [field.key, field]));

    if (!operations.patchField || !writable.length) {
      continue;
    }

    const patchFields: GraphQLInputFieldConfigMap = {};

    for (const field of writable) {
      const targetLabel = field.relation
        ? descriptors.get(field.relation.targetRecordType)?.label
        : '';

      patchFields[field.key] = field.relation
        ? {
            type: isList(field)
              ? new GraphQLList(new GraphQLNonNull(GraphQLID))
              : GraphQLID,
            description:
              field.relation.side === 'source'
                ? `Id${isList(field) ? 's' : ''} of the ${targetLabel} to link. Send null to unlink.`
                : `Id${isList(field) ? 's' : ''} of the ${targetLabel} that should link here; replaces the current links. Send null to unlink all.`,
          }
        : {
            type: valueType(field.type) as GraphQLInputType,
            description: `${describeField(field)} Send null to clear.`,
          };
    }

    const patchInput = new GraphQLInputObjectType({
      name: `${descriptor.typeName}DataExtensionsPatch`,
      fields: patchFields,
    });

    /**
     * Makes the records of the other type that link to `recordId` through
     * the virtual field `field` exactly `value`: stale links are removed
     * first (so a one-to-one slot is free), then new ones added.
     */
    const relinkInverse = async (
      context: IRequestContext,
      field: IDataExtensionField,
      recordId: string,
      value: unknown,
    ) => {
      const stored = storedFieldOf(field) as IDataExtensionField;
      const holder = descriptors.get(
        stored.recordType,
      ) as IDataExtensionRecordType;
      const desired = Array.from(new Set(linkedIds(value)));
      const max = DATA_EXTENSION_LIMITS.relationPageMax;

      if (!isList(field) && desired.length > 1) {
        throw new GraphQLError(`${field.key} links a single ${holder.label}`);
      }

      if (desired.length > DATA_EXTENSION_LIMITS.relationIdsPerValue) {
        throw new GraphQLError(
          `${field.key} links at most ${DATA_EXTENSION_LIMITS.relationIdsPerValue} records`,
        );
      }

      const current = (
        await owners.findByRelation(context, holder, stored.key, recordId, max)
      ).map((record) => record._id);

      if (current.length >= max) {
        throw new GraphQLError(
          `${field.key} has ${max} or more links; change them from ${holder.label}`,
        );
      }

      const toRemove = current.filter((id) => !desired.includes(id));
      const toAdd = desired.filter((id) => !current.includes(id));

      if (toRemove.length) {
        await owners.link(context, holder, stored.key, toRemove, recordId, 'remove');
      }

      if (toAdd.length) {
        const linked = await owners.link(
          context,
          holder,
          stored.key,
          toAdd,
          recordId,
          'add',
        );

        if (linked.length < toAdd.length) {
          throw new GraphQLError(
            `${field.key}: some ${holder.label} could not be linked (a list may be full)`,
          );
        }
      }
    };

    /** Validates links, then asks the owners to write. */
    const patchOne = async (
      context: IRequestContext,
      id: string,
      rawValues: Record<string, unknown>,
    ) => {
      const ownValues: Record<string, unknown> = {};
      const inverseValues: [IDataExtensionField, unknown][] = [];

      for (const [key, value] of Object.entries(rawValues)) {
        const field = writableByKey.get(key);

        if (field?.relation?.side === 'inverse') {
          inverseValues.push([field, value]);
        } else {
          ownValues[key] = value;
        }
      }

      // A link must point at a record the caller can see; writing the
      // virtual side changes those records, so it needs their update right.
      for (const field of writable) {
        const ids = field.relation ? linkedIds(rawValues[field.key]) : [];
        const isInverse = field.relation?.side === 'inverse';

        if (!field.relation || (!ids.length && !isInverse)) {
          continue;
        }

        const target = descriptors.get(
          field.relation.targetRecordType,
        ) as IDataExtensionRecordType;

        if (isInverse && rawValues[field.key] !== undefined) {
          await context.requirePermission(target.updateAction);
        }

        if (!ids.length) {
          continue;
        }

        await context.requirePermission(target.readAction);
        const found = await owners.load(context, target, ids);

        if (found.some((record) => !record)) {
          throw new GraphQLError(
            `${field.key}: no ${target.label} found for every id`,
          );
        }
      }

      const record = Object.keys(ownValues).length
        ? await owners.patch(context, descriptor, id, ownValues)
        : (await owners.load(context, descriptor, [id]))[0];

      if (!record) {
        return null;
      }

      for (const [field, value] of inverseValues) {
        await relinkInverse(context, field, record._id, value);
      }

      return record;
    };

    mutationFields[operations.patchField] = {
      type: output,
      description: `Sets ${descriptor.label} extension values. Omitted keys are unchanged.`,
      args: {
        _id: { type: new GraphQLNonNull(GraphQLID) },
        values: { type: new GraphQLNonNull(patchInput) },
      },
      resolve: async (
        _root,
        args: { _id: string; values: Record<string, unknown> },
        context,
      ) => {
        await context.requirePermission(descriptor.readAction);
        await context.requirePermission(descriptor.updateAction);

        return patchOne(context, args._id, args.values);
      },
    };

    const resultType = new GraphQLObjectType<IPatchResult, IRequestContext>({
      name: `${descriptor.typeName}DataExtensionsPatchResult`,
      fields: {
        _id: { type: new GraphQLNonNull(GraphQLID) },
        ok: { type: new GraphQLNonNull(GraphQLBoolean) },
        error: { type: GraphQLString },
        record: { type: output },
      },
    });

    mutationFields[`${operations.patchField}Many`] = {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(resultType))),
      description: `Sets values on up to ${DATA_EXTENSION_LIMITS.recordsPerLookup} ${descriptor.label} at once. Each item succeeds or fails on its own.`,
      args: {
        items: {
          type: new GraphQLNonNull(
            new GraphQLList(
              new GraphQLNonNull(
                new GraphQLInputObjectType({
                  name: `${descriptor.typeName}DataExtensionsPatchItem`,
                  fields: {
                    _id: { type: new GraphQLNonNull(GraphQLID) },
                    values: { type: new GraphQLNonNull(patchInput) },
                  },
                }),
              ),
            ),
          ),
        },
      },
      resolve: async (
        _root,
        args: { items: { _id: string; values: Record<string, unknown> }[] },
        context,
      ) => {
        if (args.items.length > DATA_EXTENSION_LIMITS.recordsPerLookup) {
          throw new GraphQLError(
            `At most ${DATA_EXTENSION_LIMITS.recordsPerLookup} items per call`,
          );
        }

        await context.requirePermission(descriptor.readAction);
        await context.requirePermission(descriptor.updateAction);

        return mapWithConcurrency(
          args.items,
          BULK_CONCURRENCY,
          async (item) => {
            try {
              const record = await patchOne(context, item._id, item.values);

              return record
                ? { _id: item._id, ok: true, record }
                : { _id: item._id, ok: false, error: 'Record not found' };
            } catch (error) {
              return {
                _id: item._id,
                ok: false,
                error: error instanceof Error ? error.message : String(error),
              };
            }
          },
        );
      },
    };
  }

  return new GraphQLSchema({
    query: new GraphQLObjectType({ name: 'Query', fields: queryFields }),
    mutation: Object.keys(mutationFields).length
      ? new GraphQLObjectType({ name: 'Mutation', fields: mutationFields })
      : undefined,
  });
};
