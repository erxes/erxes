import * as _ from 'underscore';
import { model } from 'mongoose';
import { Schema } from 'mongoose';

export const typeSchema = new Schema({
  name: String
});

export const pmsSchema = new Schema({
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

export const loadPmsClass = () => {
  class Pms {
    public static async getPms(_id: string) {
      const pms = await Pmss.findOne({ _id });

      if (!pms) {
        throw new Error('Pms not found');
      }

      return pms;
    }

    // create
    public static async createPms(doc) {
      return Pmss.create({
        ...doc,
        createdAt: new Date()
      });
    }
    // update
    public static async updatePms (_id: string, doc) {
      await Pmss.updateOne(
        { _id },
        { $set: { ...doc } }
      ).then(err => console.error(err));
    }
    // remove
    public static async removePms(_id: string) {
      return Pmss.deleteOne({ _id });
    }
  }

pmsSchema.loadClass(Pms);

return pmsSchema;
};

loadPmsClass();
loadTypeClass();

// tslint:disable-next-line
export const Types = model<any, any>(
  'pms_types',
  typeSchema
);

// tslint:disable-next-line
export const Pmss = model<any, any>('pmss', pmsSchema);
