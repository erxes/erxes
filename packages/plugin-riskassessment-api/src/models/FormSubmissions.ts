import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { sendFormsMessage } from '../messageBroker';
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
  if (params.cardType) {
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

      const formId = await getFormId(model, cardId, cardType);
      const { riskAssessmentId } = await model.RiskConfimity.findOne({
        cardId,
        cardType
      }).lean();

      const { resultScore, calculateMethod } = await model.RiskAssessment.findOne({
        _id: riskAssessmentId
      }).lean();

      const newSubmission: any = [];
      let sumNumber = 0;

      if (calculateMethod === 'Multiply') {
        sumNumber = 1;
      }

      const fields = await sendFormsMessage({
        subdomain,
        action: 'fields.find',
        data: { query: { contentType: 'form', contentTypeId: formId } },
        isRPC: true,
        defaultValue: []
      });

      for (const [key, value] of Object.entries(formSubmissions)) {
        const { optionsValues } = fields.find(field => field._id === key);
        const optValues = optionsValues
          .split('\n')
          .map(item => {
            if (item.match(/=/g)) {
              const label = item?.substring(0, item.indexOf('='));
              const value = parseInt(item.substring(item?.indexOf('=') + 1, item.length));
              if (!Number.isNaN(value)) {
                return { label, value };
              }
            }
          }, [])
          .filter(item => item);
        const fieldValue = optValues.find(option => option.label === value);
        switch (calculateMethod) {
          case 'Multiply':
            sumNumber *= parseInt(fieldValue.value);
            break;
          case 'Addition':
            sumNumber += parseInt(fieldValue.value);
            break;
        }

        newSubmission.push({ ...filter, fieldId: key, value });
      }

      await model.RiskAssessment.findOneAndUpdate(
        { _id: riskAssessmentId },
        { $set: { resultScore: resultScore + sumNumber } },
        { new: true }
      );
      await model.RiksFormSubmissions.insertMany(newSubmission);
      if (await checkAllUsersSubmitted(subdomain, model, cardId, cardType)) {
        calculateRiskAssessment(model, cardId, cardType);
      }
      return {
        cardId,
        cardType,
        riskAssessmentId,
        resultScore: resultScore + sumNumber,
        score: sumNumber
      };
    }
  }

  riskConfirmityFormSubmissionSchema.loadClass(FormSubmissionsClass);
  return riskConfirmityFormSubmissionSchema;
};
