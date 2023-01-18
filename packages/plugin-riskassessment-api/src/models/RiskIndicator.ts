import { paginate } from '@erxes/api-utils/src';
import { escapeRegExp } from '@erxes/api-utils/src/core';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { sendFormsMessage } from '../messageBroker';
import { validRiskIndicators } from '../utils';
import { IRiskIndicatorsField, PaginateField } from './definitions/common';
import {
  IRiskIndicatorsDocument,
  riskIndicatorSchema
} from './definitions/indicator';

export interface IRiskIndicatorsModel extends Model<IRiskIndicatorsDocument> {
  riskIndicators(
    params: { categoryId: string } & IRiskIndicatorsField & PaginateField
  ): Promise<IRiskIndicatorsDocument>;
  riskIndicatorsTotalCount(
    params: { categoryId: string } & IRiskIndicatorsField & PaginateField
  ): Promise<IRiskIndicatorsDocument>;
  riskIndicatorDetail(params: {
    _id: string;
    fieldsSkip: any;
  }): Promise<IRiskIndicatorsDocument>;
  riskIndicatorAdd(
    params: IRiskIndicatorsField
  ): Promise<IRiskIndicatorsDocument>;
  riskIndicatorRemove(_ids: string[]): void;
  riskIndicatorUpdate(params: {
    doc: IRiskIndicatorsField;
  }): Promise<IRiskIndicatorsDocument>;
  removeUnusedRiskIndicatorForm(
    ids: string[]
  ): Promise<IRiskIndicatorsDocument>;
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
  } & IRiskIndicatorsField &
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

const generateOrderFilters = (params: IRiskIndicatorsField & PaginateField) => {
  const filter: any = {};

  filter.createdAt = -1;

  if (params.sortDirection) {
    filter.createdAt = params.sortDirection;
  }

  return filter;
};

export const loadRiskIndicators = (model: IModels, subdomain: string) => {
  class RiskIndicatorClass {
    public static async riskIndicators(
      params: {
        categoryId: string;
        ignoreIds: string[];
      } & IRiskIndicatorsField &
        PaginateField
    ) {
      const filter = generateFilter(params);
      const sort = generateOrderFilters(params);
      return paginate(model.RiskIndicators.find(filter).sort(sort), params);
    }
    public static async riskIndicatorsTotalCount(
      params: {
        categoryId: string;
        ignoreIds: string[];
      } & IRiskIndicatorsField &
        PaginateField
    ) {
      const filter = generateFilter(params);
      return await model.RiskIndicators.find(filter).countDocuments();
    }

    public static async riskIndicatorAdd(params: IRiskIndicatorsField) {
      try {
        await validRiskIndicators(params);
      } catch (e) {
        throw new Error(e.message);
      }

      return model.RiskIndicators.create({ ...params });
    }

    public static async riskIndicatorRemove(_ids: string[]) {
      if (!_ids) {
        throw new Error('Please select a list of risk assessment IDs');
      }
      try {
        await model.RiskConformity.deleteMany({
          riskIndicatorId: { $in: _ids }
        });
        await model.RiksFormSubmissions.deleteMany({
          riskIndicatorId: { $in: _ids }
        });
        await model.RiskIndicators.deleteMany({ _id: { $in: _ids } });
        return true;
      } catch (e) {
        throw new Error(e.message);
      }
    }

    public static async riskIndicatorUpdate(params: {
      _id: string;
      doc: { _id: string } & IRiskIndicatorsField;
    }) {
      const { doc } = params;

      if (!doc._id && !doc) {
        throw new Error('Not found risk assessment');
      }

      console.log({ doc });

      try {
        return await model.RiskIndicators.findByIdAndUpdate(doc._id, doc);
      } catch (e) {
        throw new Error('Something went wrong');
      }
    }

    public static async riskIndicatorDetail(params: {
      _id: string;
      fieldsSkip: any;
    }) {
      const filter = generateFilter(params);
      const { fieldsSkip } = params;
      if (!filter._id) {
        throw new Error('You must provide a _id parameter');
      }

      return await model.RiskIndicators.findOne(filter).select(fieldsSkip);
    }

    public static async removeUnusedRiskIndicatorsForm(ids: string[]) {
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
  riskIndicatorSchema.loadClass(RiskIndicatorClass);
  return riskIndicatorSchema;
};
