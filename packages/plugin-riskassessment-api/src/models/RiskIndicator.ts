import { paginate } from '@erxes/api-utils/src';
import { escapeRegExp } from '@erxes/api-utils/src/core';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  sendCommonMessage,
  sendFormsMessage,
  sendTagsMessage
} from '../messageBroker';
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
    params: { tagIds: string[] } & IRiskIndicatorsField & PaginateField
  ): Promise<IRiskIndicatorsDocument>;
  riskIndicatorsTotalCount(
    params: { tagIds: string[] } & IRiskIndicatorsField & PaginateField
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
  removeRiskIndicatorUnusedForms(
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

const generateIds = async ({
  subdomain,
  useSendMessage,
  params,
  serviceName,
  action
}) => {
  if (useSendMessage) {
    const items = await sendCommonMessage({
      serviceName,
      subdomain,
      action,
      data: params,
      isRPC: true,
      defaultValue: []
    });

    return { $in: items.map(item => item._id) };
  }

  return params;
};

const generateFilter = async (
  subdomain,
  params: {
    _id?: string;
    ids?: string[];
    ignoreIds?: string[];
    branchId?: string;
    departmentId?: string;
    operationId?: string;
    withChilds?: boolean;
  } & IRiskIndicatorsField &
    PaginateField
) => {
  let filter: any = {};

  if (params._id) {
    filter._id = params._id;
  }

  if (!!params?.ids?.length) {
    filter._id = { $in: params.ids };
  }

  if (!!params?.tagIds?.length) {
    let filterParams: any = { $in: params.tagIds };

    if (params.withChilds) {
      const tags = await sendTagsMessage({
        subdomain,
        action: 'find',
        data: {
          _id: params.tagIds
        },
        isRPC: true,
        defaultValue: []
      });
      const orderQuery = tags.map(tag => ({
        order: { $regex: `^${tag.order}`, $options: 'i' }
      }));

      filterParams = { $or: orderQuery };
    }

    filter.tagIds = await generateIds({
      subdomain,
      serviceName: 'tags',
      action: 'find',
      useSendMessage: params.withChilds,
      params: filterParams
    });
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

  if (params?.branchId) {
    filter.branchIds = { $in: [params.branchId] };
  }
  if (params?.departmentId) {
    filter.departmentIds = { $in: [params.departmentId] };
  }
  if (params?.operationId) {
    filter.operationIds = { $in: [params.operationId] };
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
        tagId: string;
        ignoreIds: string[];
      } & IRiskIndicatorsField &
        PaginateField
    ) {
      const filter = await generateFilter(subdomain, params);
      const sort = generateOrderFilters(params);
      return paginate(model.RiskIndicators.find(filter).sort(sort), params);
    }
    public static async riskIndicatorsTotalCount(
      params: {
        tagId: string;
        ignoreIds: string[];
      } & IRiskIndicatorsField &
        PaginateField
    ) {
      const filter = await generateFilter(subdomain, params);
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
        return await model.RiskIndicators.findByIdAndUpdate(_id, {
          ...doc,
          modifiedAt: new Date()
        });
      } catch (e) {
        throw new Error('Something went wrong');
      }
    }

    public static async riskIndicatorDetail(params: {
      _id: string;
      fieldsSkip: any;
    }) {
      const filter = await generateFilter(subdomain, params);
      const { fieldsSkip } = params;
      if (!filter._id) {
        throw new Error('You must provide a _id parameter');
      }

      return await model.RiskIndicators.findOne(filter).select(fieldsSkip);
    }

    public static async removeRiskIndicatorUnusedForms(ids: string[]) {
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
      await this.validateIndicatorsGroups(doc);
      return await models.IndicatorsGroups.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date() } }
      );
    }
    public static async removeGroups(ids: string[]) {
      return await models.IndicatorsGroups.deleteMany({ _id: { $in: ids } });
    }
    static async validateIndicatorsGroups(params) {
      let totalPercentWeight = 0;

      if ((params.groups || []).length > 1) {
        for (const group of params.groups) {
          if (!group.percentWeight) {
            throw new Error('Group must provide a percent weight');
          }
          totalPercentWeight += group.percentWeight;
        }
        await validateCalculateMethods(params);
      }

      if (totalPercentWeight > 100) {
        throw new Error('Total percent weight must be lower than 100');
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
