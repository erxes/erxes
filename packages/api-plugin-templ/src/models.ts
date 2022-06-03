import * as Random from 'meteor-random';
import { Model, model } from 'mongoose';
import * as _ from 'underscore';
import { Document, Schema } from 'mongoose';

/*
 * Mongoose field options wrapper
 */
const field = options => {
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

export interface I{Name} {
  name: string;
}

export interface I{Name}Document extends I{Name}, Document {
  _id: string;
  createdAt: Date;
  order?: string;
  relatedIds?: string[];
}

export const {name}Schema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: "Name" }),
});

export interface I{Name}Model extends Model<I{Name}Document> {
  create{Name}(doc: I{Name}): Promise<I{Name}Document>;
}

class {Name} {
  public static async create{Name}(doc) {
    const {name} = await {Name}s.create(doc);
    return {name};
  }
}

{name}Schema.loadClass({Name});

const {Name}s = model<I{Name}Document, I{Name}Model>('{name}s', {name}Schema);

export {
  {Name}s
};