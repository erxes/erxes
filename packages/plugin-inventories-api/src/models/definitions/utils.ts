import * as Random from 'meteor-random';

/*
 * Mongoose field options wrapper
 */
export const field = (options: any) => {
  const { pkey, type, optional } = options;

  if (type === String && !pkey && !optional) {
    options.validate = /\S+/;
  }

  // TODO: remove
  if (pkey) {
    options.type = String;
    options.default = () => Random.id();
  }

  return options;
};

export const schemaWrapper = (schema: any) => {
  schema.add({ scopeBrandIds: [String] });

  return schema;
};

export const schemaHooksWrapper = (schema: any, _cacheKey: string) => {
  return schemaWrapper(schema);
};
