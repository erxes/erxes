import { checkPermission, paginate } from '@erxes/api-utils/src';
import { IContext, models } from '../../../connectionResolver';
import {
  IRiskIndicatorsField,
  PaginateField
} from '../../../models/definitions/common';

const generateConfigFilter = params => {
  let filter: any = {};

  if (params.cardType) {
    filter.cardType = params.cardType;
  }

  if (params.boardId) {
    filter.boardId = params.boardId;
  }
  if (params.pipelineId) {
    filter.pipelineId = params.pipelineId;
  }
  if (params.stageId) {
    filter.stageId = params.stageId;
  }
  if (params.customFieldId) {
    filter.customFieldId = params.customFieldId;
  }

  return filter;
};

const generateGroupsFilter = params => {
  let filter: any = {};

  if (params.searchValue) {
    filter.name = { $regex: new RegExp(params.searchValue, 'i') };
  }

  return filter;
};

const RiskIndicatorQueries = {
  /**
   * Indicator Queries
   */
  async riskIndicators(
    _root,
    params: { categoryId: string } & IRiskIndicatorsField & PaginateField,
    { models }: IContext
  ) {
    return await models.RiskIndicators.riskIndicators(params);
  },

  async riskIndicatorsTotalCount(
    _root,
    params: { categoryId: string } & IRiskIndicatorsField & PaginateField,
    { models }: IContext
  ) {
    return await models.RiskIndicators.riskIndicatorsTotalCount(params);
  },

  async riskIndicatorDetail(
    _root,
    params: { _id: string; fieldsSkip: any },
    { models }: IContext
  ) {
    return await models.RiskIndicators.riskIndicatorDetail(params);
  },

  /**
   * Groups Queries
   */

  async riskIndicatorsGroups(_root, params, { models }: IContext) {
    const filter = generateGroupsFilter(params);

    return paginate(
      models.IndicatorsGroups.find(filter).sort({ createdAt: -1 }),
      params
    );
  },
  async riskIndicatorsGroupsTotalCount(_root, params, { models }: IContext) {
    const filter = generateGroupsFilter(params);
    return await models.IndicatorsGroups.countDocuments(filter);
  },

  /**
   * Config Queries
   */

  async riskIndicatorConfigs(_root, params, { models }: IContext) {
    const filter = generateConfigFilter(params);

    return await paginate(
      models.RiskIndicatorConfigs.find(filter).sort({
        [params.sortField]: params.sortDirection
      }),
      params
    );
  },
  async riskIndicatorConfigsTotalCount(_root, params, { models }: IContext) {
    const filter = generateConfigFilter(params);

    return await models.RiskIndicatorConfigs.find(filter).countDocuments();
  }
};

checkPermission(RiskIndicatorQueries, 'riskIndicators', 'showRiskIndicator');
checkPermission(
  RiskIndicatorQueries,
  'riskIndicatorDetail',
  'showRiskIndicator'
);

export default RiskIndicatorQueries;
