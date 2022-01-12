import Random from 'meteor-random';
import { removeKey } from '../../inmemoryStorage';

/*
 * Mongoose field options wrapper
 */
export const field = options => {
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

export const schemaWrapper = schema => {
  schema.add({ scopeBrandIds: [String] });

  return schema;
};

const hookList = [
  'save',
  'remove',
  'update',
  'updateOne',
  'updateMany',
  'deleteOne',
  'deleteMany',
  'findOneAndUpdate'
];

export const schemaHooksWrapper = (schema, cacheKey: string) => {
  for (const hook of hookList) {
    schema.post(hook, () => {
      removeKey(cacheKey);
    });
  }

  return schemaWrapper(schema);
};