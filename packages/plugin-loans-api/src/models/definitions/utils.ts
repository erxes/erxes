import * as Random from 'meteor-random';

/*
 * Mongoose field options wrapper
 */

interface Options {
  /**
   * @property {boolean} pkey хувьсагч нь primary key эсэх
   */
  pkey?: boolean;
  type?: any;
  optional?: boolean;
  default?: any;
  validate?: any;
  label?: string;
  index?: boolean;
  required?: boolean;
  enum?: Array<string>;
  min?: number;
  max?: number;
  selectOptions?: any;
  unique?: boolean;
}
/**
 *
 * @param options
 * @returns {Object} тухайн талбарын бүтэцийг буцаана
 */
export const field = (options: Options) => {
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

export const schemaHooksWrapper = (schema, _cacheKey: string) => {
  return schemaWrapper(schema);
};
