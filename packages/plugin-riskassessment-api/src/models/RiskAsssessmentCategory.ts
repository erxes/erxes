import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { sendFormsMessage } from '../messageBroker';
import { IRiskAssessmentCategoryField } from './definitions/common';
import { IRiskAssessmentCategoryDocument, riskAssessmentCategorySchema } from './definitions/riskassessment';

export interface IRiskAssessmentCategoryModel extends Model<IRiskAssessmentCategoryDocument> {
  addAssessmentCategory(params: IRiskAssessmentCategoryField): Promise<IRiskAssessmentCategoryDocument>;
  removeAssessmentCategory(params: { _id: string }): Promise<IRiskAssessmentCategoryDocument>;
  editAssessmentCategory(params: IRiskAssessmentCategoryField): Promise<IRiskAssessmentCategoryDocument>;
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

      const order = await this.getOrder(parentId, code, name);

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

    public static removeAssessmentCategory = async (params: { _id: string }) => {
      if (!params._id) {
        throw new Error('Not found assessment category');
      }

      try {
        return await models.RiskAssessmentCategory.findByIdAndDelete(params._id);
      } catch (error) {
        throw new Error(error.message);
      }
    };

    public static editAssessmentCategory = async (params: IRiskAssessmentCategoryField) => {
      console.log(params);

      const { _id, name, code, parentId, formId } = params;

      const category = await models.RiskAssessmentCategory.findOne({ _id }).lean();

      if (!category) {
        throw new Error('Not found risk assessment category');
      }

      const order = await this.getOrder(parentId, code, name);

      return models.RiskAssessmentCategory.updateOne({ _id }, { $set: { ...category, ...params, order } });
    };

    static async getOrder(_id: string, code: string, name: string) {
      const parent = await models.RiskAssessmentCategory.findOne({ _id });
      return parent ? `${parent.order}/${code}` : `${name}${code}`;
    }
  }
  riskAssessmentCategorySchema.loadClass(AssessmentClass);
  return riskAssessmentCategorySchema;
};
