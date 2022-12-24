import { checkPermission, paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import {
  IRiskAssessmentField,
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

const RiskAssessmentQueries = {
  async riskAssessments(
    _root,
    params: { categoryId: string } & IRiskAssessmentField & PaginateField,
    { models }: IContext
  ) {
    return await models.RiskAssessment.riskAssessments(params);
  },

  async riskAssessmentDetail(
    _root,
    params: { _id: string; fieldsSkip: any },
    { models }: IContext
  ) {
    return await models.RiskAssessment.riskAssessmentDetail(params);
  },

  async riskAssessmentConfigs(_root, params, { models }: IContext) {
    const filter = generateConfigFilter(params);

    return await paginate(
      models.RiskAssessmentConfigs.find(filter).sort({
        [params.sortField]: params.sortDirection
      }),
      params
    );
  },
  async riskAssessmentConfigsTotalCount(_root, params, { models }: IContext) {
    const filter = generateConfigFilter(params);

    return await models.RiskAssessmentConfigs.find(filter).countDocuments();
  }
};

// checkPermission(RiskAssessmentQueries, 'riskAssessments', 'showRiskAssessment');
// checkPermission(
//   RiskAssessmentQueries,
//   'riskAssessmentDetail',
//   'showRiskAssessment'
// );

export default RiskAssessmentQueries;
