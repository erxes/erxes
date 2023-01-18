import { Model } from 'mongoose';
import { IModels, models } from '../connectionResolver';
import {
  sendCardsMessage,
  sendCoreMessage,
  sendFormsMessage
} from '../messageBroker';
import {
  calculateFormResponses,
  calculateRiskAssessment,
  checkAllUsersSubmitted,
  getFieldsGroupByForm,
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

      const conformity = await model.RiskConformity.findOne({
        cardId,
        cardType
      }).lean();

      if (!conformity) {
        throw new Error(`Not selected some risk assessment on ${cardType}`);
      }

      const { riskAssessmentId, resultScore } = conformity;

      const { calculateMethod, forms } = await model.RiskIndicators.findOne({
        _id: riskAssessmentId
      }).lean();

      const formIds = forms.map(form => form._id);

      if (forms.length === 1 && !calculateMethod) {
        const fields = await getFieldsGroupByForm({
          subdomain,
          formId: forms[0].formId
        });

        const { submissions, sumNumber } = await calculateFormResponses({
          responses: formSubmissions,
          fields,
          calculateMethod: forms[0].calculateMethod,
          filter
        });
        await model.RiskConformity.findOneAndUpdate(
          { riskAssessmentId, cardId, cardType },
          { $set: { resultScore: resultScore + sumNumber } },
          { new: true }
        );
        await model.RiksFormSubmissions.insertMany(submissions);
      }

      if (forms.length > 1) {
        const newSubmissions: any = [];
        let totalScore = 0;
        let totalPercent = 0;

        if (calculateMethod === 'Multiply') {
          totalScore = 1;
        }

        const fieldsGroupByForm = await getFieldsGroupByForm({
          subdomain,
          formIds: forms.map(form => form.formId)
        });

        for (const form of forms) {
          const fieldsForm = fieldsGroupByForm.find(
            field => field.formId === form.formId
          );
          if (fieldsForm) {
            const { submissions, sumNumber } = await calculateFormResponses({
              responses: formSubmissions,
              fields: fieldsForm.fields,
              calculateMethod: form.calculateMethod,
              filter
            });
            newSubmissions.push(...submissions);
            totalPercent += form.percentWeight;
            const score = sumNumber * (form.percentWeight / 100);
            switch (calculateMethod) {
              case 'Multiply':
                totalScore *= score;
                break;
              case 'Addition':
                totalScore += score;
                break;
            }
            // await models?.RiskAssessmentIndicatorForms.updateOne(
            //   {
            //     conformityId: conformity._id,
            //     formId: form.formId
            //   },
            //   { $inc: { resultScore: sumNumber } }
            // );
          }
        }

        const score = totalScore / (!!totalPercent ? totalPercent / 100 : 1);

        await model.RiskConformity.findOneAndUpdate(
          { riskAssessmentId, cardId, cardType },
          {
            $inc: {
              resultScore: score
            }
          },
          { new: true }
        );
        await model.RiksFormSubmissions.insertMany(newSubmissions);
      }
      if (
        await checkAllUsersSubmitted(
          subdomain,
          model,
          cardId,
          cardType,
          formIds
        )
      ) {
        calculateRiskAssessment(model, cardId, cardType);
      }
      return {
        formFields: []
        // cardId,
        // cardType,
        // riskAssessmentId,
        // resultScore: resultScore + sumNumber,
        // score: sumNumber
        // resultScore: 0,
        // score: 0
      };
    }
    public static async formSubmitHistory(
      cardId: string,
      cardType: string,
      riskAssessmentId: string
    ) {
      // const conformity = await models?.RiskConformity.findOne({
      //   cardId,
      //   cardType,
      //   riskAssessmentId
      // });
      // if (!conformity) {
      //   throw new Error('Cannot find risk assessment');
      // }
      // if (conformity?.status === 'In Progress') {
      //   throw new Error('This risk assessment in progress');
      // }

      // const card = await sendCardsMessage({
      //   subdomain,
      //   action: `${cardType}s.findOne`,
      //   data: { _id: cardId },
      //   isRPC: true,
      //   defaultValue: {}
      // });

      // const formIds = conformity.forms.map(form => form.formId);

      // const submissions = await model.RiksFormSubmissions.aggregate([
      //   {
      //     $match: {
      //       cardId,
      //       cardType,
      //       formId: { $in: formIds },
      //       riskAssessmentId
      //     }
      //   },
      //   {
      //     $group: {
      //       _id: '$userId',
      //       fields: { $push: { fieldId: '$fieldId', value: '$value' } }
      //     }
      //   }
      // ]);
      // for (const submission of submissions) {
      //   const fields: any[] = [];

      //   for (const field of submission.fields) {
      //     const fieldData = await sendFormsMessage({
      //       subdomain,
      //       action: 'fields.find',
      //       data: {
      //         query: {
      //           contentType: 'form',
      //           contentTypeId: { $in: formIds },
      //           _id: field.fieldId
      //         }
      //       },
      //       isRPC: true,
      //       defaultValue: {}
      //     });

      //     let fieldOptionsValues: any[] = [];

      //     const { optionsValues, options } = fieldData[0];

      //     fieldOptionsValues = optionsValues?.split('\n');

      //     if (!optionsValues) {
      //       fieldOptionsValues = options.map(option => `${option}=NaN`);
      //     }

      //     fields.push({
      //       ...field,
      //       optionsValues: fieldOptionsValues,
      //       text: fieldData[0]?.text,
      //       description: fieldData[0]?.description
      //     });
      //   }
      //   submission.fields = fields;
      // }

      // return { cardId, card, cardType, riskAssessmentId, users: submissions };
      return { shit: '' };
    }
  }

  riskConformityFormSubmissionSchema.loadClass(FormSubmissionsClass);
  return riskConformityFormSubmissionSchema;
};
