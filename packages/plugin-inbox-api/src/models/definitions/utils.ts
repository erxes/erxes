import { nanoid } from 'nanoid';
import redis from '@erxes/api-utils/src/redis';

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
    options.default = () => nanoid();
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
    schema.post(hook, async () => {
      await redis.del(cacheKey);
    });
  }

  return schemaWrapper(schema);
};
