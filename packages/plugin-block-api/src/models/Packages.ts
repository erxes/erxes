import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import {
  IPackage,
  IPackageDocument,
  packageSchema
} from './definitions/packages';

export interface IPackageModel extends Model<IPackageDocument> {
  createPackage(doc: IPackage): Promise<IPackageDocument>;
  updatePackage(_id: string, doc: IPackage): Promise<IPackageDocument>;
  removePackage(_id): Promise<IPackageDocument>;
}

export const loadPackageClass = (models: IModels) => {
  class Package {
    public static async createPackage(doc: IPackage) {
      return models.Packages.create({
        ...doc,
        createdAt: new Date()
      });
    }

    public static async updatePackage(_id, doc: IPackage) {
      await models.Packages.updateOne(
        {
          _id
        },
        { $set: { ...doc, modifiedAt: new Date() } }
      );

      return models.Packages.findOne({ _id });
    }

    public static async removePackage(_id) {
      return models.Packages.remove({ _id });
    }
  }

  packageSchema.loadClass(Package);

  return packageSchema;
};
