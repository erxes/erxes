import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { validRiskAssessment } from '../utils';
import { IRiskAssessmentField } from './definitions/common';
import { IRiskAssessmentDocument } from './definitions/riskassessment';
import { riskAssessmentSchema } from './definitions/riskassessment';

export interface IRiskAssessmentModel extends Model<IRiskAssessmentDocument> {
  riskAssesments(): Promise<IRiskAssessmentDocument>;
  riskAssesmentAdd(params: IRiskAssessmentField): Promise<IRiskAssessmentDocument>;
  riskAssesmentRemove(_ids: string[]): void;
  riskAssessmentUpdate(params: {
    _id: string;
    doc: IRiskAssessmentField;
  }): Promise<IRiskAssessmentDocument>;
}

export const loadRiskAssessment = (model: IModels, subdomain: string) => {
  class RiskAssessment {
    public static async riskAssesments() {
      const list = model.RiskAssessment.find();
      const totalCount = model.RiskAssessment.find().countDocuments();
      return { list, totalCount };
    }

    public static async riskAssesmentAdd(params: IRiskAssessmentField) {
      try {
        await validRiskAssessment(params);
      } catch (e) {
        throw new Error(e.message);
      }
      return model.RiskAssessment.create({ ...params });
    }

    public static async riskAssesmentRemove(_ids: string[]) {
      if (!_ids) {
        throw new Error('Please select a list of risk assessment IDs');
      }
      await model.RiskAssessment.deleteMany({ _id: { $in: _ids } });
      return;
    }

    public static async riskAssessmentUpdate(params: { _id: string; doc: IRiskAssessmentField }) {
      const { _id, doc } = params;

      console.log(params);

      if (!_id && !doc) {
        throw new Error('Not found risk assessment');
      }

      const result = await model.RiskAssessment.findByIdAndUpdate(_id, doc);
      if (!result) {
        throw new Error('Something went wrong');
      }
      return result;
    }
  }
  riskAssessmentSchema.loadClass(RiskAssessment);
  return riskAssessmentSchema;
};
