import * as _ from 'underscore';
import { model } from 'mongoose';
import { Schema } from 'mongoose';

export const typeSchema = new Schema({
  name: String
});

export const activitySchema = new Schema({
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

export const loadActivityClass = () => {
  class Activity {
    public static async getActivity(_id: string) {
      const activity = await Activities.findOne({ _id });

      if (!activity) {
        throw new Error('Activity not found');
      }

      return activity;
    }

    // create
    public static async createActivity(doc) {
      return Activities.create({
        ...doc,
        createdAt: new Date()
      });
    }
    // update
    public static async updateActivity (_id: string, doc) {
      await Activities.updateOne(
        { _id },
        { $set: { ...doc } }
      ).then(err => console.error(err));
    }
    // remove
    public static async removeActivity(_id: string) {
      return Activities.deleteOne({ _id });
    }
  }

activitySchema.loadClass(Activity);

return activitySchema;
};

loadActivityClass();
loadTypeClass();

// tslint:disable-next-line
export const Types = model<any, any>(
  'activity_types',
  typeSchema
);

// tslint:disable-next-line
export const Activities = model<any, any>('activities', activitySchema);
