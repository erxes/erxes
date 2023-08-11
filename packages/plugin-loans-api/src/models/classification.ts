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
          { _id: mur.dtl.map(a => a.contractId) },
          { $set: { classification: mur.newClassification } }
        );
      }

      var res = await models.Classification.insertMany(classifications);

      return res;
    }
    /**
     * Create a periodLock
     */
    public static async createClassification(
      classification: IClassificationDocument
    ) {
      var res = await models.Classification.create(classification);

      return res;
    }

    public static async getClassification(_id: string) {
      var res = await models.Classification.findOne({ _id }).lean();

      return res;
    }

    public static async updateClassification(
      _id: string,
      classification: IClassification
    ) {
      var res = await models.Classification.updateOne(
        { _id },
        { $set: classification }
      );

      return res;
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
