import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { sendFormsMessage } from '../messageBroker';
import { IRiskAssessmentCategoryField } from './definitions/common';
import { IRiskAssessmentCategoryDocument, riskAssessmentCategorySchema } from './definitions/riskassessment';

export interface IRiskAssessmentCategoryModel extends Model<IRiskAssessmentCategoryDocument> {
  addAssessmentCategory(params: IRiskAssessmentCategoryField): Promise<IRiskAssessmentCategoryDocument>;
  removeAssessmentCategory(params: { _id: string }): Promise<IRiskAssessmentCategoryDocument>;
  getAssessmentCategories(): Promise<IRiskAssessmentCategoryDocument>;
  getAssessmentCategory(_id: string): Promise<IRiskAssessmentCategoryDocument>;
}

export const loadAssessmentCategory = (models: IModels, subdomain: string) => {
  class AssessmentClass {
    public static addAssessmentCategory = async (params: IRiskAssessmentCategoryField) => {
      const { name, code, parentId } = params;
      if (!params) {
        throw new Error('please type the assessment category fields');
      }

      if (await models.RiskAssessmentCategory.findOne({ code })) {
        throw new Error('Code must be unique');
      }

      const parent = await models.RiskAssessmentCategory.findOne({ _id: parentId });

      const order = parent ? `${parent.order}/${code}` : `${name}${code}`;

      const result = models.RiskAssessmentCategory.create({ ...params, order });
      return result;
    };

    public static getAssessmentCategories = () => {
      return models.RiskAssessmentCategory.find();
    };

    public static getAssessmentCategory = async (_id: string) => {
      const category = await models.RiskAssessmentCategory.findOne({ _id }).lean();

      const parent = await models.RiskAssessmentCategory.findOne({ _id: category.parentId });

      if (parent) {
        category.parent = parent;
      }

      const form = await sendFormsMessage({
        subdomain,
        action: 'findOne',
        data: {
          _id: category.formId,
        },
        isRPC: true,
        defaultValue: {},
      });

      if (form) {
        const formfields = await sendFormsMessage({
          subdomain,
          action: 'fields.find',
          data: {
            contentId: form._id,
            contentType: 'form',
          },
          isRPC: true,
          defaultValue: [],
        });
        category.formName = form.title;
      }

      if (!category) {
        throw new Error('Not found assessment category');
      }

      return category;
    };

    public static removeAssessmentCategory = (params: { _id: string }) => {
      if (!params._id) {
        throw new Error('Not found assessment category');
      }

      try {
        models.RiskAssessmentCategory.deleteOne(params);
        return 'ok';
      } catch (error) {
        throw new Error(error.message);
      }
    };
  }
  riskAssessmentCategorySchema.loadClass(AssessmentClass);
  return riskAssessmentCategorySchema;
};
