import { validSearchText } from '@erxes/api-utils/src';
import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import { IRisk, IRiskDocument, riskSchema } from './definitions/risks';

export interface IRiskModel extends Model<IRiskDocument> {
  getRisk(doc: any): IRiskDocument;
  createRisk(doc: IRisk, userId?: string): IRiskDocument;
  updateRisk(doc: IRiskDocument, userId?: string): IRiskDocument;
  fillSearchText(doc: IRisk): string;
}

export const loadRiskClass = (models: IModels) => {
  class Risk {
    public static async getRisk(doc: any) {
      const risk = await models.Risks.findOne(doc);

      if (!risk) {
        throw new Error('risk not found');
      }

      return risk;
    }

    public static async createRisk(doc: IRisk, userId?: string) {
      return models.Risks.create({
        ...doc,
        lastModifiedBy: userId,
        searchText: models.Risks.fillSearchText(doc)
      });
    }

    public static async updateRisk(doc: IRiskDocument, userId?: string) {
      const risk = await models.Risks.getRisk({ _id: doc._id });

      const searchText = models.Risks.fillSearchText(Object.assign(risk, doc));

      const updatedDoc: any = {
        ...doc,
        searchText
      };

      if (userId) {
        updatedDoc.lastModifiedBy = userId;
      }

      await models.Risks.updateOne({ _id: doc._id }, { $set: updatedDoc });

      return models.Risks.findOne({ _id: doc._id });
    }

    public static fillSearchText(doc: IRisk) {
      return validSearchText([doc.code || '', doc.name || '']);
    }
  }

  riskSchema.loadClass(Risk);

  return riskSchema;
};
