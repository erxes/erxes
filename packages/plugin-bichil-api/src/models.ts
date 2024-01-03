import { model } from 'mongoose';
import { Schema } from 'mongoose';
import * as _ from 'underscore';

export const bichilSchema = new Schema({
  name: String
});

export const loadBichilClass = () => {
  class Bichil {
    // create
    public static async createBichil(doc) {
      return Bichils.create({
        ...doc,
        createdAt: new Date()
      });
    }
  }

  bichilSchema.loadClass(Bichil);

  return bichilSchema;
};

export const Bichils = model<any, any>('bichils', loadBichilClass());
