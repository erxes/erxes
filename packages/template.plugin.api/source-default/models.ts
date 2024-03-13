import * as _ from 'underscore';
import { model } from 'mongoose';
import { Schema } from 'mongoose';

export const typeSchema = new Schema({
  name: String
});

export const {name}Schema = new Schema({
  name: String,
  createdAt: Date,
  expiryDate: Date,
  checked: Boolean,
  typeId: String
});

export const loadTypeClass = () => {
  class Type {
    public static async getType(_id: string) {
      const type = await Types.findOne({ _id });

      if (!type) {
        throw new Error('Type not found');
      }

      return type;
    }
    // create type
    public static async createType(doc) {
      return Types.create({ ...doc });
    }
    // remove type
    public static async removeType(_id: string) {
      return Types.deleteOne({ _id });
    }

    public static async updateType(_id: string, doc) {
      return Types.updateOne({ _id }, { $set: { ...doc } });
    }
  }

  typeSchema.loadClass(Type);
  return typeSchema;
};

export const load{Name}Class = () => {
  class {Name} {
    public static async get{Name}(_id: string) {
      const {name} = await {Name}s.findOne({ _id });

      if (!{name}) {
        throw new Error('{Name} not found');
      }

      return {name};
    }

    // create
    public static async create{Name}(doc) {
      return {Name}s.create({
        ...doc,
        createdAt: new Date()
      });
    }
    // update
    public static async update{Name} (_id: string, doc) {
      await {Name}s.updateOne(
        { _id },
        { $set: { ...doc } }
      ).then(err => console.error(err));
    }
    // remove
    public static async remove{Name}(_id: string) {
      return {Name}s.deleteOne({ _id });
    }
  }

{name}Schema.loadClass({Name});

return {name}Schema;
};

load{Name}Class();
loadTypeClass();

// tslint:disable-next-line
export const Types = model<any, any>(
  '{name}_types',
  typeSchema
);

// tslint:disable-next-line
export const {Name}s = model<any, any>('{name}s', {name}Schema);
