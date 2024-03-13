import { Schema, model } from 'mongoose';

export const typeSchema = new Schema({
  name: String,
});

export const syncpolarisSchema = new Schema({
  name: String,
  createdAt: Date,
  expiryDate: Date,
  checked: Boolean,
  typeId: String,
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

export const loadSyncpolarisClass = () => {
  class Syncpolaris {
    public static async getSyncpolaris(_id: string) {
      const syncpolaris = await Syncpolariss.findOne({ _id });

      if (!syncpolaris) {
        throw new Error('Syncpolaris not found');
      }

      return syncpolaris;
    }

    // create
    public static async createSyncpolaris(doc) {
      return Syncpolariss.create({
        ...doc,
        createdAt: new Date(),
      });
    }
    // update
    public static async updateSyncpolaris(_id: string, doc) {
      await Syncpolariss.updateOne({ _id }, { $set: { ...doc } }).then((err) =>
        console.error(err),
      );
    }
    // remove
    public static async removeSyncpolaris(_id: string) {
      return Syncpolariss.deleteOne({ _id });
    }
  }

  syncpolarisSchema.loadClass(Syncpolaris);

  return syncpolarisSchema;
};

loadSyncpolarisClass();
loadTypeClass();

// tslint:disable-next-line
export const Types = model<any, any>('syncpolaris_types', typeSchema);

// tslint:disable-next-line
export const Syncpolariss = model<any, any>('syncpolariss', syncpolarisSchema);
