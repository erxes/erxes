import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { calculateRiskAssessment, checkAllUsersSubmitted, getFormId } from '../utils';
import { IRiskFormSubmissionParams } from './definitions/common';
import {
  IRiskFormSubmissionDocument,
  riskConfirmityFormSubmissionSchema
} from './definitions/confimity';

export interface IRiskFormSubmissionModel extends Model<IRiskFormSubmissionDocument> {
  formSaveSubmission(params: IRiskFormSubmissionParams): Promise<IRiskFormSubmissionDocument>;
}

const generateFields = params => {
  const filter: any = {};
  if (params.formId) {
    filter.formId = params.formId;
  }
  if (params.userId) {
    filter.userId = params.userId;
  }
  if (params.cardId) {
    filter.cardId = params.cardId;
  }
  if(params.cardType) {
    filter.cardType = params.cardType;
  }
  if (params.riskAssessmentId) {
    filter.riskAssessmentId = params.riskAssessmentId;
  }
  return filter;
};

export const loadRiskFormSubmissions = (model: IModels, subdomain: string) => {
  class FormSubmissionsClass {
    public static async formSaveSubmission(params: IRiskFormSubmissionParams) {
      const { formSubmissions, cardId, cardType } = params;

      const filter = generateFields(params);

      const newSubmission: any = [];

      for (const [key, value] of Object.entries(formSubmissions)) {
        newSubmission.push({ ...filter, fieldId: key, value });
      }

      const result = model.RiksFormSubmissions.insertMany(newSubmission);
      if (await checkAllUsersSubmitted(subdomain, model, cardId, cardType)) {
        const formId = await getFormId(model, cardId,cardType);
        calculateRiskAssessment(model, subdomain, cardId, cardType, formId);
      }
      return result;
    }
  }

  riskConfirmityFormSubmissionSchema.loadClass(FormSubmissionsClass);
  return riskConfirmityFormSubmissionSchema;
};
