import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  IClassification,
  IClassificationDocument,
  classificationSchema
} from './definitions/classification';

export const loadClassificationClass = (models: IModels) => {
  class Classification {
    public static async createClassifications(
      classifications: IClassification[]
    ) {
      for await (const mur of classifications) {
        await models.Contracts.updateMany(
          { _id: mur.contractId },
          { $set: { classification: mur.newClassification } }
        );
      }

      return await models.Classification.insertMany(classifications);
    }
    /**
     * Create a periodLock
     */
    public static async createClassification(
      classification: IClassificationDocument
    ) {
      return await models.Classification.create(classification);
    }

    public static async getClassification(_id: string) {
      return await models.Classification.findOne({ _id }).lean();
    }

    public static async updateClassification(
      _id: string,
      classification: IClassification
    ) {
      return await models.Classification.updateOne(
        { _id },
        { $set: classification }
      );
    }
  }
  classificationSchema.loadClass(Classification);
  return classificationSchema;
};

export interface IClassificationModel extends Model<IClassificationDocument> {
  createClassifications(classifications: IClassification[]);
  createClassification(classification: IClassification);
  getClassification(_id: string);
  updateClassification(_id, classification: IClassification);
}