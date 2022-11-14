import { model } from 'mongoose';
import { Schema } from 'mongoose';
import * as _ from 'underscore';

export const {name}Schema = new Schema({
  name: String
});

export const load{Name}Class = () => {
  class {Name} {
    // create
    public static async create{Name}(doc) {
      return {Name}s.create({
        ...doc,
        createdAt: new Date()
      });
    }
  }

  {name}Schema.loadClass({Name});

  return {name}Schema;
};

export const {Name}s = model<any, any>(
  '{name}s',
  load{Name}Class()
);