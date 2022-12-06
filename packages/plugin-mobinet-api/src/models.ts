import * as _ from 'underscore';
import { model } from 'mongoose';
import { Schema } from 'mongoose';

export const typeSchema = new Schema({
  name: String
});

export const mobinetSchema = new Schema({
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

export const loadMobinetClass = () => {
  class Mobinet {
    public static async getMobinet(_id: string) {
      const mobinet = await Mobinets.findOne({ _id });

      if (!mobinet) {
        throw new Error('Mobinet not found');
      }

      return mobinet;
    }

    // create
    public static async createMobinet(doc) {
      return Mobinets.create({
        ...doc,
        createdAt: new Date()
      });
    }
    // update
    public static async updateMobinet(_id: string, doc) {
      await Mobinets.updateOne({ _id }, { $set: { ...doc } }).then(err =>
        console.error(err)
      );
    }
    // remove
    public static async removeMobinet(_id: string) {
      return Mobinets.deleteOne({ _id });
    }
  }

  mobinetSchema.loadClass(Mobinet);

  return mobinetSchema;
};

loadMobinetClass();
loadTypeClass();

// tslint:disable-next-line
export const Types = model<any, any>('mobinet_types', typeSchema);

// tslint:disable-next-line
export const Mobinets = model<any, any>('mobinets', mobinetSchema);
