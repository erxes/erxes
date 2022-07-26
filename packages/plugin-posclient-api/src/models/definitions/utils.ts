import * as Random from 'meteor-random';

/**
 * Mongoose field options wrapper
 */
export const field = options => {
  const { pkey, type, optional } = options;

  if (type === String && !pkey && !optional) {
    options.validate = /\S+/;
  }

  if (pkey) {
    options.type = String;
    options.default = () => Random.id();
  }

  return options;
};

export const schemaWrapper = schema => {
  schema.add({ scopeBrandIds: [String] });

  return schema;
};

export const schemaHooksWrapper = (schema, _cacheKey: string) => {
  return schemaWrapper(schema);
};

export const getDateFieldDefinition = (label: string) =>
  field({
    type: Date,
    default: new Date(),
    label
  });

/**
 * Prepares mongoose number field definition with common number attributes
 * @param options
 * @returns mongoose schema definition
 */
export const getNumberFieldDefinition = (options: any) => {
  const { positive, label, discount } = options;
  const definition: any = { type: Number, label };

  if (positive === true) {
    definition.min = 0;
  }
  if (discount === true) {
    definition.min = 0;
    definition.max = 100;
  }

  return definition;
};
