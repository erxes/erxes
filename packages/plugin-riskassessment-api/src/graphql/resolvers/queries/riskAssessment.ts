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

const RiskIndicatorQueries = {
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

// checkPermission(RiskIndicatorQueries, 'riskIndicators', 'showRiskIndicator');
// checkPermission(
//   RiskIndicatorQueries,
//   'riskIndicatorDetail',
//   'showRiskIndicator'
// );

export default RiskIndicatorQueries;
