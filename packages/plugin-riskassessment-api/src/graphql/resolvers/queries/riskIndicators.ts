import { checkPermission, paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
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

  if (!!params?.ids?.length) {
    filter._id = { $in: params.ids };
  }

  if (params.searchValue) {
    filter.name = { $regex: new RegExp(params.searchValue, 'i') };
  }

  if (params.tagIds) {
    filter.tagIds = { $in: params.tagIds };
  }

  return filter;
};

const RiskIndicatorQueries = {
  /**
   * Indicator Queries
   */
  async riskIndicators(
    _root,
    params: { tagIds: string[] } & IRiskIndicatorsField & PaginateField,
    { models }: IContext
  ) {
    return await models.RiskIndicators.riskIndicators(params);
  },

  async riskIndicatorsTotalCount(
    _root,
    params: { tagIds: string[] } & IRiskIndicatorsField & PaginateField,
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

  async riskIndicatorsGroup(_root, { _id }, { models }: IContext) {
    if (!_id) {
      throw new Error('Please provide _id');
    }
    return await models.IndicatorsGroups.findOne({ _id }).lean();
  },

  /**
   * Config Queries
   */

  async riskAssessmentsConfigs(_root, params, { models }: IContext) {
    const filter = generateConfigFilter(params);

    return await paginate(
      models.RiskAssessmentsConfigs.find(filter).sort({
        [params.sortField]: params.sortDirection
      }),
      params
    );
  },
  async riskAssessmentsConfigsTotalCount(_root, params, { models }: IContext) {
    const filter = generateConfigFilter(params);

    return await models.RiskAssessmentsConfigs.find(filter).countDocuments();
  }
};

checkPermission(RiskIndicatorQueries, 'riskIndicators', 'manageRiskAssessment');
checkPermission(
  RiskIndicatorQueries,
  'riskIndicatorDetail',
  'manageRiskAssessment'
);
checkPermission(
  RiskIndicatorQueries,
  'riskIndicatorsTotalCount',
  'manageRiskAssessment'
);
checkPermission(
  RiskIndicatorQueries,
  'riskIndicatorsGroups',
  'manageRiskAssessment'
);
checkPermission(
  RiskIndicatorQueries,
  'riskIndicatorsGroupsTotalCount',
  'manageRiskAssessment'
);
checkPermission(
  RiskIndicatorQueries,
  'riskIndicatorConfigs',
  'manageRiskAssessment'
);
checkPermission(
  RiskIndicatorQueries,
  'riskIndicatorConfigsTotalCount',
  'manageRiskAssessment'
);

export default RiskIndicatorQueries;
