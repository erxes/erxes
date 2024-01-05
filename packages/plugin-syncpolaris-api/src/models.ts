import { model } from 'mongoose';
import { Schema } from 'mongoose';
import * as _ from 'underscore';

export const syncpolarisSchema = new Schema({
  name: String
});

export const loadSyncpolarisClass = () => {
  class Syncpolaris {
    // create
    public static async createSyncpolaris(doc) {
      return Syncpolariss.create({
        ...doc,
        createdAt: new Date()
      });
    }
  }

  syncpolarisSchema.loadClass(Syncpolaris);

  return syncpolarisSchema;
};

export const Syncpolariss = model<any, any>(
  'syncpolariss',
  loadSyncpolarisClass()
);
