import { Aggregate, Query, Schema } from 'mongoose';

const configuredSchemas = new WeakSet<Schema>();

export const withAccountingDiskUse = <TSchema extends Schema>(
  schema: TSchema,
): TSchema => {
  if (configuredSchemas.has(schema)) {
    return schema;
  }

  schema.pre(['find', 'findOne'], function (this: Query<unknown, unknown>) {
    const options = this.getOptions();
    if (options.sort && options.allowDiskUse === undefined) {
      this.allowDiskUse(true);
    }
  });

  schema.pre('aggregate', function (this: Aggregate<unknown[]>) {
    if (this.options.allowDiskUse === undefined) {
      this.allowDiskUse(true);
    }
  });

  configuredSchemas.add(schema);
  return schema;
};
