import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  IInsurancePackage,
  IInsurancePackageDocument,
  packageSchema
} from './definitions/package';

export interface IInsurancePackageModel
  extends Model<IInsurancePackageDocument> {
  getInsurancePackage(doc: any): IInsurancePackageDocument;
  createInsurancePackage(
    doc: IInsurancePackage,
    userId?: string
  ): IInsurancePackageDocument;
  updateInsurancePackage(
    doc: IInsurancePackage,
    userId?: string
  ): IInsurancePackageDocument;
}

export const loadPackageClass = (models: IModels) => {
  class InsurancePackage {
    public static async getInsurancePackage(doc: any) {
      const insurancePackage = await models.Packages.findOne(doc);

      if (!insurancePackage) {
        throw new Error('package not found');
      }

      return insurancePackage;
    }

    public static async createInsurancePackage(
      doc: IInsurancePackage,
      userId?: string
    ) {
      return models.Packages.create({
        ...doc,
        lastModifiedBy: userId
      });
    }

    public static async updateInsurancePackage(
      doc: IInsurancePackageDocument,
      userId?: string
    ) {
      await models.Packages.getInsurancePackage({ _id: doc._id });

      const updatedDoc: any = {
        ...doc
      };

      if (userId) {
        updatedDoc.lastModifiedBy = userId;
        updatedDoc.updatedAt = new Date();
      }

      await models.Packages.updateOne({ _id: doc._id }, { $set: updatedDoc });

      return models.Packages.findOne({ _id: doc._id });
    }
  }

  packageSchema.loadClass(InsurancePackage);

  return packageSchema;
};
