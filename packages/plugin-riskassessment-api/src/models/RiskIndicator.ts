import { paginate } from '@erxes/api-utils/src';
import { escapeRegExp } from '@erxes/api-utils/src/core';
import { Model } from 'mongoose';
import { IModels, models } from '../connectionResolver';
import { sendFormsMessage } from '../messageBroker';
import { validateCalculateMethods, validRiskIndicators } from '../utils';
import { IRiskIndicatorsField, PaginateField } from './definitions/common';
import {
  IIndicatorsGroupsDocument,
  IRiskIndicatorsDocument,
  riskIndicatorGroupSchema,
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
  riskIndicatorUpdate(
    _id?: string,
    doc?: IRiskIndicatorsField
  ): Promise<IRiskIndicatorsDocument>;
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

  if (params?.branchIds?.length) {
    filter.branchIds = { $in: params.branchIds };
  }
  if (params?.departmentIds?.length) {
    filter.departmentIds = { $in: params.departmentIds };
  }
  if (params?.operationIds?.length) {
    filter.operationIds = { $in: params.operationIds };
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
        return await model.RiskIndicators.deleteMany({ _id: { $in: _ids } });
      } catch (e) {
        throw new Error(e.message);
      }
    }

    public static async riskIndicatorUpdate(
      _id: string,
      doc: IRiskIndicatorsField
    ) {
      if (!_id && !doc) {
        throw new Error('Not found risk assessment');
      }

      try {
        return await model.RiskIndicators.findByIdAndUpdate(_id, doc);
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

export interface IIndicatorsGroupsModel
  extends Model<IIndicatorsGroupsDocument> {
  addGroup(doc: any): Promise<any>;
  updateGroup(_id: string, doc: any): Promise<any>;
  removeGroups(ids: string[]): Promise<any>;
}

export const loadIndicatorsGroups = (models: IModels, subdomain: string) => {
  class IndicatorsGroupsClass {
    public static async addGroup(doc) {
      await this.validateIndicatorsGroups(doc);

      return await models.IndicatorsGroups.create({ ...doc });
    }
    public static async updateGroup(_id: string, doc: any) {
      const group = await models.IndicatorsGroups.findOne({ _id });
      if (!group) {
        throw new Error('Indicators groups not found');
      }
      await validateCalculateMethods(doc);
      return await models.IndicatorsGroups.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date() } }
      );
    }
    public static async removeGroups(ids: string[]) {
      return await models.IndicatorsGroups.deleteMany(ids);
    }
    static async validateIndicatorsGroups(params) {
      if ((params.groups || []).length > 1) {
        for (const group of params.groups) {
          if (!group.percentWeight) {
            throw new Error('Group must provide a percent weight');
          }
        }
        await validateCalculateMethods(params);
      }
      for (const group of params.groups || []) {
        if (!(group.indicatorIds || []).length) {
          throw new Error('You should select some indicator each group');
        }
        await validateCalculateMethods(group);
      }
    }
  }

  riskIndicatorGroupSchema.loadClass(IndicatorsGroupsClass);
  return riskIndicatorGroupSchema;
};
