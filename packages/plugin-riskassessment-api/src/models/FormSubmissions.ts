import { Model } from 'mongoose';
import { IModels, models } from '../connectionResolver';
import {
  sendCardsMessage,
  sendCoreMessage,
  sendFormsMessage
} from '../messageBroker';
import {
  calculateRiskAssessment,
  checkAllUsersSubmitted,
  getFormId
} from '../utils';
import { IRiskFormSubmissionParams } from './definitions/common';
import {
  IRiskFormSubmissionDocument,
  riskConformityFormSubmissionSchema
} from './definitions/confimity';

export interface IRiskFormSubmissionModel
  extends Model<IRiskFormSubmissionDocument> {
  formSaveSubmission(
    params: IRiskFormSubmissionParams
  ): Promise<IRiskFormSubmissionDocument>;
  formSubmitHistory(
    cardId: string,
    cardType: string,
    riskAssessmentId: string
  ): Promise<IRiskFormSubmissionDocument>;
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
      const conformity = await model.RiskConformity.findOne({
        cardId,
        cardType
      }).lean();

      if (!conformity) {
        throw new Error(`Not selected some risk assessment on ${cardType}`);
      }

      const { riskAssessmentId, resultScore } = conformity;

      const { calculateMethod } = await model.RiskAssessment.findOne({
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
        if (optionsValues) {
          const optValues = optionsValues
            .split('\n')
            .map(item => {
              if (item.match(/=/g)) {
                const label = item?.substring(0, item.indexOf('='));
                const value = parseInt(
                  item.substring(item?.indexOf('=') + 1, item.length)
                );
                if (!Number.isNaN(value)) {
                  return { label, value };
                }
              }
            }, [])
            .filter(item => item);
          const fieldValue = optValues.find(option => option.label === value);
          switch (calculateMethod) {
            case 'Multiply':
              sumNumber *= parseInt(fieldValue?.value || 0);
              break;
            case 'Addition':
              sumNumber += parseInt(fieldValue?.value || 0);
              break;
          }

          newSubmission.push({ ...filter, fieldId: key, value });
        } else {
          newSubmission.push({ ...filter, fieldId: key, value });
        }
      }

      await model.RiskConformity.findOneAndUpdate(
        { riskAssessmentId, cardId, cardType },
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
    public static async formSubmitHistory(
      cardId: string,
      cardType: string,
      riskAssessmentId: string
    ) {
      const conformity = await models?.RiskConformity.findOne({
        cardId,
        cardType,
        riskAssessmentId
      });
      if (!conformity) {
        throw new Error('Cannot find risk assessment');
      }
      if (conformity?.status === 'In Progress') {
        throw new Error('This risk assessment in progress');
      }

      const formId = await getFormId(model, cardId, cardType);

      if (!formId) {
        throw new Error('Cannot find form of risk assessment');
      }

      const card = await sendCardsMessage({
        subdomain,
        action: `${cardType}s.findOne`,
        data: { _id: cardId },
        isRPC: true,
        defaultValue: {}
      });

      const submissions = await model.RiksFormSubmissions.aggregate([
        { $match: { cardId, cardType, formId, riskAssessmentId } },
        {
          $group: {
            _id: '$userId',
            fields: { $push: { fieldId: '$fieldId', value: '$value' } }
          }
        }
      ]);
      for (const submission of submissions) {
        const fields: any[] = [];

        for (const field of submission.fields) {
          const fieldData = await sendFormsMessage({
            subdomain,
            action: 'fields.find',
            data: {
              query: {
                contentType: 'form',
                contentTypeId: formId,
                _id: field.fieldId
              }
            },
            isRPC: true,
            defaultValue: {}
          });

          let fieldOptionsValues: any[] = [];

          const { optionsValues, options } = fieldData[0];

          fieldOptionsValues = optionsValues?.split('\n');

          if (!optionsValues) {
            fieldOptionsValues = options.map(option => `${option}=NaN`);
          }

          fields.push({
            ...field,
            optionsValues: fieldOptionsValues,
            text: fieldData[0]?.text,
            description: fieldData[0]?.description
          });
        }
        submission.fields = fields;
      }

      return { cardId, card, cardType, riskAssessmentId, users: submissions };
    }
  }

  riskConformityFormSubmissionSchema.loadClass(FormSubmissionsClass);
  return riskConformityFormSubmissionSchema;
};
