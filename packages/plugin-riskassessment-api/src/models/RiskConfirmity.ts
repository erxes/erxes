import { Model } from 'mongoose'
import { IModels } from '../connectionResolver'
import { IRiskConfirmityField, IRiskConfirmityParams } from './definitions/common'
import { IRiskConfirmityDocument, riskConfirmitySchema } from './definitions/riskConfimity'

export interface IRiskConfirmityModel extends Model<IRiskConfirmityDocument> {
  riskConfirmities(params: IRiskConfirmityParams): Promise<IRiskConfirmityDocument>;
  riskConfirmityDetails(params: IRiskConfirmityParams): Promise<IRiskConfirmityDocument>;
  riskConfirmityAdd(params: IRiskConfirmityField): Promise<IRiskConfirmityDocument>;
  riskConfirmityUpdate(params: IRiskConfirmityParams): Promise<IRiskConfirmityDocument>;
  riskConfirmityRemove(cardId: string): Promise<IRiskConfirmityDocument>;
}

const generateFilter = (params: IRiskConfirmityParams) => {
  let filter: any = {};

  if (params.cardId) {
    filter.cardId = params.cardId;
  }

  if (params.riskAssessmentId) {
    filter.riskAssessmentId = params.riskAssessmentId;
  }

  return filter;
};

export const loadRiskConfirmity = (model: IModels, subdomain: string) => {
  class RiskConfimity {
    public static async riskConfirmityAdd(params: IRiskConfirmityField) {
      return model.RiskConfimity.create({ ...params });
    }
    public static async riskConfirmities(params: IRiskConfirmityParams) {
      const filter = generateFilter(params);

      const confirmities = await model.RiskConfimity.find(filter).lean();

      for (const confirmity of confirmities) {
        const riskAssesments = await model.RiskAssessment.findOne({
          _id: confirmity.riskAssessmentId,
        });
        confirmity.name = riskAssesments?.name;
      }

      return confirmities;
    }
    public static async riskConfirmityDetails(params: IRiskConfirmityParams) {
      const filter = generateFilter(params);

      const confirmities = await model.RiskConfimity.find(filter).lean();

      const result: any = [];

      for (const confirmity of confirmities) {
        const riskAssesment = await model.RiskAssessment.findOne({
          _id: confirmity.riskAssessmentId,
        });
        result.push(riskAssesment);
      }

      return result;
    }

    public static async riskConfirmityUpdate(params: IRiskConfirmityParams) {
      const { cardId, riskAssessmentId } = params;

      if (!riskAssessmentId) {
        throw new Error('riskAssessmentId is required');
      }
      if (!cardId) {
        throw new Error('cardId is required');
      }

      const confimity = await model.RiskConfimity.findOne({ cardId }).lean();

      if (!confimity) {
        throw new Error('Confimity not found');
      }

      return await model.RiskConfimity.findOneAndUpdate(
        confimity._id,
        { ...confimity, riskAssessmentId },
        { new: true }
      );
    }

    public static async riskConfirmityRemove(cardId: string) {
      if (!cardId) {
        throw new Error('cardId is required');
      }

      await model.RiskConfimity.deleteOne({ cardId });
      return 'success';
    }
  }
  riskConfirmitySchema.loadClass(RiskConfimity);
  return riskConfirmitySchema;
};
