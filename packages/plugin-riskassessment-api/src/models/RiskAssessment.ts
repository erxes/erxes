import { paginate } from '@erxes/api-utils/src';
import { escapeRegExp } from '@erxes/api-utils/src/core';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { sendFormsMessage } from '../messageBroker';
import { validRiskAssessment } from '../utils';
import { IRiskAssessmentField, PaginateField } from './definitions/common';
import {
  IRiskAssessmentDocument,
  riskAssessmentSchema
} from './definitions/riskassessment';

export interface IRiskAssessmentModel extends Model<IRiskAssessmentDocument> {
  riskAssessments(
    params: { categoryId: string } & IRiskAssessmentField & PaginateField
  ): Promise<IRiskAssessmentDocument>;
  riskAssessmentsTotalCount(
    params: { categoryId: string } & IRiskAssessmentField & PaginateField
  ): Promise<IRiskAssessmentDocument>;
  riskAssessmentDetail(params: {
    _id: string;
    fieldsSkip: any;
  }): Promise<IRiskAssessmentDocument>;
  riskAssesmentAdd(
    params: IRiskAssessmentField
  ): Promise<IRiskAssessmentDocument>;
  riskAssesmentRemove(_ids: string[]): void;
  riskAssessmentUpdate(params: {
    doc: IRiskAssessmentField;
  }): Promise<IRiskAssessmentDocument>;
  removeUnusedRiskAssessmentForm(
    ids: string[]
  ): Promise<IRiskAssessmentDocument>;
}

const statusColors = {
  Unacceptable: '#393c40',
  Error: '#ea475d',
  Warning: '#f7ce53',
  Danger: '#ff6600',
  Success: '#3ccc38',
  In_Progress: '#3B85F4',
  No_Result: '#888'
};

const generateFilter = (
  params: {
    _id?: string;
    categoryId?: string;
    ignoreIds?: string[];
  } & IRiskAssessmentField &
    PaginateField
) => {
  let filter: any = {};

  if (params._id) {
    filter._id = params._id;
  }

  if (params.categoryId) {
    filter.categoryId = params.categoryId;
  }

  if (params.sortFromDate) {
    if (parseInt(params.sortFromDate)) {
      params.sortFromDate = new Date(parseInt(params.sortFromDate)).toString();
    }
    filter.createdAt = { $gte: new Date(params.sortFromDate) };
  }

  if (params.sortToDate) {
    if (parseInt(params.sortToDate)) {
      params.sortToDate = new Date(parseInt(params.sortToDate)).toString();
    }
    filter.createdAt = {
      ...filter.createdAt,
      $lte: new Date(params.sortToDate)
    };
  }

  if (params.status) {
    filter.statusColor = statusColors[params.status];
  }
  if (params.searchValue) {
    filter.name = { $regex: new RegExp(escapeRegExp(params.searchValue), 'i') };
  }

  if (params.ignoreIds) {
    filter._id = { $nin: params.ignoreIds };
  }

  return filter;
};

const generateOrderFilters = (params: IRiskAssessmentField & PaginateField) => {
  const filter: any = {};

  filter.createdAt = -1;

  if (params.sortDirection) {
    filter.createdAt = params.sortDirection;
  }

  return filter;
};

export const loadRiskAssessment = (model: IModels, subdomain: string) => {
  class RiskAssessment {
    public static async riskAssessments(
      params: {
        categoryId: string;
        ignoreIds: string[];
      } & IRiskAssessmentField &
        PaginateField
    ) {
      const filter = generateFilter(params);
      const sort = generateOrderFilters(params);
      return paginate(model.RiskAssessment.find(filter).sort(sort), params);

      // const totalCount = model.RiskAssessment.find(filter).countDocuments();

      // return { list, totalCount };
    }
    public static async riskAssessmentsTotalCount(
      params: {
        categoryId: string;
        ignoreIds: string[];
      } & IRiskAssessmentField &
        PaginateField
    ) {
      const filter = generateFilter(params);
      return await model.RiskAssessment.find(filter).countDocuments();
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
      try {
        await model.RiskConformity.deleteMany({
          riskAssessmentId: { $in: _ids }
        });
        await model.RiksFormSubmissions.deleteMany({
          riskAssessmentId: { $in: _ids }
        });
        await model.RiskAssessment.deleteMany({ _id: { $in: _ids } });
        return true;
      } catch (e) {
        throw new Error(e.message);
      }
    }

    public static async riskAssessmentUpdate(params: {
      _id: string;
      doc: { _id: string } & IRiskAssessmentField;
    }) {
      const { doc } = params;

      if (!doc._id && !doc) {
        throw new Error('Not found risk assessment');
      }

      console.log({ doc });

      try {
        return await model.RiskAssessment.findByIdAndUpdate(doc._id, doc);
      } catch (e) {
        throw new Error('Something went wrong');
      }
    }

    public static async riskAssessmentDetail(params: {
      _id: string;
      fieldsSkip: any;
    }) {
      const filter = generateFilter(params);
      const { fieldsSkip } = params;
      if (!filter._id) {
        throw new Error('You must provide a _id parameter');
      }

      return await model.RiskAssessment.findOne(filter).select(fieldsSkip);
    }

    public static async removeUnusedRiskAssessmentForm(ids: string[]) {
      try {
        await sendFormsMessage({
          subdomain,
          action: 'removeForm',
          data: { $in: ids },
          isRPC: true,
          defaultValue: {}
        });
        return { status: 'removed' };
      } catch (error) {
        throw new Error(error.message);
      }
    }
  }
  riskAssessmentSchema.loadClass(RiskAssessment);
  return riskAssessmentSchema;
};
