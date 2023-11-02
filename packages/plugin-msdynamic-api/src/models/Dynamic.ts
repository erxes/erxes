import {
  IDynamic,
  IDynamicDocument,
  msdynamicSchema
} from './definitions/dynamic';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IUser } from '@erxes/api-utils/src/types';

export interface IDynamicModel extends Model<IDynamicDocument> {
  createMsdynamicConfig(args: IDynamic): Promise<IDynamicDocument>;
  updateMsdynamicConfig(args: IDynamic, user: IUser): Promise<IDynamicDocument>;
}

export const loadDynamicClass = (model: IModels) => {
  class Msdynamic {
    // create
    public static async createMsdynamicConfig(doc: IDynamic) {
      return await model.Msdynamics.create({
        ...doc,
        createdAt: new Date()
      });
    }
    // update
    public static async updateMsdynamicConfig(doc: IDynamic, user: IUser) {
      if (!user) {
        throw new Error('You are not logged in');
      }

      const result = await model.Msdynamics.findOne({
        _id: doc._id
      });

      if (result) {
        await model.Msdynamics.updateOne(
          { _id: result._id },
          { $set: { ...doc } }
        );
        return result;
      }
    }
  }

  msdynamicSchema.loadClass(Msdynamic);

  return msdynamicSchema;
};
