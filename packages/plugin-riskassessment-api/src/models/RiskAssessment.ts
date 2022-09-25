import { paginate } from '@erxes/api-utils/src';
import { escapeRegExp } from '@erxes/api-utils/src/core';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { validRiskAssessment } from '../utils';
import { IRiskAssessmentField, PaginateField } from './definitions/common';
import { IRiskAssessmentDocument, riskAssessmentSchema } from './definitions/riskassessment';

export interface IRiskAssessmentModel extends Model<IRiskAssessmentDocument> {
  riskAssessments(
    params: { categoryId: string } & IRiskAssessmentField & PaginateField
  ): Promise<IRiskAssessmentDocument>;
  riskAssessmentDetail(params: { _id: string }): Promise<IRiskAssessmentDocument>;
  riskAssesmentAdd(params: IRiskAssessmentField): Promise<IRiskAssessmentDocument>;
  riskAssesmentRemove(_ids: string[]): void;
  riskAssessmentUpdate(params: {
    _id: string;
    doc: IRiskAssessmentField;
  }): Promise<IRiskAssessmentDocument>;
}

const statusColors = {
  Error: '#ea475d',
  Warning: '#f7ce53',
  Success: '#3ccc38',
  In_Progress: '#3B85F4'
};

const generateFilter = (
  params: { _id?: string; categoryId?: string } & IRiskAssessmentField & PaginateField
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
    filter.createdAt = { ...filter.createdAt, $lte: new Date(params.sortToDate) };
  }

  if (params.status) {
    filter.statusColor = statusColors[params.status];
  }
  if (params.searchValue) {
    filter.name = { $regex: new RegExp(escapeRegExp(params.searchValue), 'i') };
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
      params: { categoryId: string } & IRiskAssessmentField & PaginateField
    ) {
      const lookup = {
        $lookup: {
          from: 'risk_assessment_categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      };
      const filter = generateFilter(params);

      const match = { $match: filter };
      const sort = { $sort: generateOrderFilters(params) };
      const set = { $unwind: '$category' };
      const list = paginate(model.RiskAssessment.aggregate([match, lookup, set, sort]), params);

      const totalCount = model.RiskAssessment.find(filter).countDocuments();

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
      try {
        await model.RiskConfimity.deleteMany({ riskAssessmentId: { $in: _ids } });
        await model.RiksFormSubmissions.deleteMany({ riskAssessmentId: { $in: _ids } });
        await model.RiskAssessment.deleteMany({ _id: { $in: _ids } });
        return true;
      } catch (e) {
        throw new Error(e.message);
      }
    }

    public static async riskAssessmentUpdate(params: { _id: string; doc: IRiskAssessmentField }) {
      const { _id, doc } = params;

      if (!_id && !doc) {
        throw new Error('Not found risk assessment');
      }

      const result = await model.RiskAssessment.findByIdAndUpdate(_id, doc);
      if (!result) {
        throw new Error('Something went wrong');
      }
      return result;
    }

    public static async riskAssessmentDetail(params: { _id: string }) {
      const filter = generateFilter(params);
      if (!filter._id) {
        throw new Error('You must provide a _id parameter');
      }

      const match = { $match: filter };

      const lookup = {
        $lookup: {
          from: 'risk_assessment_categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      };
      const unwind = {
        $unwind: '$category'
      };

      const [first] = await model.RiskAssessment.aggregate([match, lookup, unwind]);
      return first;
    }
  }
  riskAssessmentSchema.loadClass(RiskAssessment);
  return riskAssessmentSchema;
};
