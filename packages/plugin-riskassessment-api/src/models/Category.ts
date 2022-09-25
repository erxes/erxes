import { paginate } from '@erxes/api-utils/src';
import { escapeRegExp } from '@erxes/api-utils/src/core';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { sendFormsMessage } from '../messageBroker';
import { IRiskAssessmentCategoryField, PaginateField } from './definitions/common';
import {
  IRiskAssessmentCategoryDocument,
  riskAssessmentCategorySchema
} from './definitions/riskassessment';

export interface IRiskAssessmentCategoryModel extends Model<IRiskAssessmentCategoryDocument> {
  addAssessmentCategory(
    params: IRiskAssessmentCategoryField
  ): Promise<IRiskAssessmentCategoryDocument>;
  removeAssessmentCategory(params: { _id: string }): Promise<IRiskAssessmentCategoryDocument>;
  editAssessmentCategory(
    params: IRiskAssessmentCategoryField
  ): Promise<IRiskAssessmentCategoryDocument>;
  getAssessmentCategories(
    params: IRiskAssessmentCategoryField
  ): Promise<IRiskAssessmentCategoryDocument>;
  getAssessmentCategory(_id: string): Promise<IRiskAssessmentCategoryDocument>;
  getFormDetail(_id: string): Promise<IRiskAssessmentCategoryDocument>;
  removeUnsavedRiskAssessmentCategoryForm(formId: string): Boolean;
}

const generateFilter = (params: IRiskAssessmentCategoryField & PaginateField) => {
  let filter: any = {};

  if (params.formId) {
    filter.formId = params.formId;
  }

  if (params.code) {
    filter.code = params.code;
  }
  if (params.searchValue) {
    filter.name = { $regex: new RegExp(escapeRegExp(params.searchValue), 'i') };
  }

  return filter;
};

export const loadAssessmentCategory = (models: IModels, subdomain: string) => {
  class AssessmentClass {
    public static addAssessmentCategory = async (params: IRiskAssessmentCategoryField) => {
      const { name, code, parentId } = params;
      if (!params) {
        throw new Error('please type the assessment category fields');
      }

      const isParamsHasError = await this.checkParams(params, true);

      if (isParamsHasError) {
        throw new Error(isParamsHasError);
      }

      const order = await this.getOrder(parentId, code, name);

      const result = models.RiskAssessmentCategory.create({ ...params, order });
      return result;
    };

    public static getAssessmentCategories = (params: IRiskAssessmentCategoryField) => {
      const filter = generateFilter(params);

      return paginate(models.RiskAssessmentCategory.find(filter), params);
    };

    public static getAssessmentCategory = async (_id: string) => {
      const category = await models.RiskAssessmentCategory.findOne({ _id }).lean();

      if (!category) {
        throw new Error('Not found assessment category');
      }

      const parent = await models.RiskAssessmentCategory.findOne({ _id: category.parentId });

      if (parent) {
        category.parent = parent;
      }

      const form = await sendFormsMessage({
        subdomain,
        action: 'findOne',
        data: {
          _id: category.formId
        },
        isRPC: true,
        defaultValue: {}
      });

      if (form) {
        const formfields = await sendFormsMessage({
          subdomain,
          action: 'fields.find',
          data: {
            contentId: form._id,
            contentType: 'form'
          },
          isRPC: true,
          defaultValue: []
        });
        category.formName = form.title;
      }

      return category;
    };

    public static removeAssessmentCategory = async (params: { _id: string }) => {
      if (!params._id) {
        throw new Error('Not found risk assessment category');
      }

      const { _id, formId } = await models.RiskAssessmentCategory.findOne({
        _id: params._id
      }).lean();

      try {
        const riskAssessments = await models.RiskAssessment.find({ categoryId: { $in: _id } });
        const riskAssessmentIds = riskAssessments.map(p => p._id);
        await models.RiskAssessment.deleteMany({ categoryId: _id });
        await models.RiskConfimity.deleteMany({ riskAssessmentId: { $in: riskAssessmentIds } });
        await sendFormsMessage({
          subdomain,
          action: 'removeForm',
          data: {
            formId
          },
          isRPC: true,
          defaultValue: []
        });
        return await models.RiskAssessmentCategory.findByIdAndDelete(params._id);
      } catch (error) {
        throw new Error(error.message);
      }
    };

    public static editAssessmentCategory = async (params: IRiskAssessmentCategoryField) => {
      const { _id, name, code, parentId, formId } = params;

      const category = await models.RiskAssessmentCategory.findOne({ _id }).lean();

      if (!category) {
        throw new Error('Not found risk assessment category');
      }

      const isParamsHasError = await this.checkParams(params);

      if (isParamsHasError) {
        throw new Error(isParamsHasError);
      }

      const order = await this.getOrder(parentId, code, name);

      return models.RiskAssessmentCategory.updateOne(
        { _id },
        { $set: { ...category, ...params, order } }
      );
    };

    public static async getFormDetail(_id) {
      const form = await sendFormsMessage({
        subdomain,
        action: 'findOne',
        data: { _id },
        isRPC: true,
        defaultValue: {}
      });

      return form;
    }

    public static async removeUnsavedRiskAssessmentCategoryForm(formId) {
      try {
        const form = await sendFormsMessage({
          subdomain,
          action: 'removeForm',
          data: { formId },
          isRPC: true,
          defaultValue: {}
        });
        return true;
      } catch (error) {
        throw new Error(error.message);
      }
    }

    static async getOrder(_id: string, code: string, name: string) {
      const parent = await models.RiskAssessmentCategory.findOne({ _id });
      return parent ? `${parent.order}/${code}` : `${name}${code}`;
    }

    static async checkParams(params: IRiskAssessmentCategoryField, checkCode?: boolean) {
      if (!params.formId) {
        return 'You must a build form';
      }

      if (!params.name) {
        return 'You must a provide category name';
      }

      if (!params.code) {
        return 'You must provide code';
      }

      if (checkCode && (await models.RiskAssessmentCategory.findOne({ code: params.code }))) {
        return 'Code must be unique';
      }
    }
  }
  riskAssessmentCategorySchema.loadClass(AssessmentClass);
  return riskAssessmentCategorySchema;
};
