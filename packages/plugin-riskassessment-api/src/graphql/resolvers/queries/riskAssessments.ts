import { checkPermission, paginate } from '@erxes/api-utils/src';
import { IContext, IModels } from '../../../connectionResolver';
import { statusColors } from '../../../constants';
import { RiskAssessmentGroupParams } from '../types';

const generateFilter = async (params, models: IModels) => {
  let filter: any = {};

  if (params.cardType) {
    filter.cardType = params.cardType;
  }

  if (params.groupIds) {
    filter.groupId = { $in: params.groupIds };
  }

  if (params.operationIds) {
    filter.operationId = { $in: params.operationIds };
  }

  if (params.branchIds) {
    filter.branchId = { $in: params.branchIds };
  }

  if (params.departmentIds) {
    filter.departmentId = { $in: params.departmentIds };
  }
  if (params.riskIndicatorIds) {
    const groupIds = (
      await models.IndicatorsGroups.aggregate([
        { $match: { 'groups.indicatorIds': { $in: params.riskIndicatorIds } } }
      ])
    ).map(group => group._id);

    filter.indicatorId = { $in: params.riskIndicatorIds };

    if (!!groupIds.length) {
      delete filter.indicatorId;

      filter.$or = [
        { groupId: { $in: groupIds } },
        { indicatorId: { $in: params.riskIndicatorIds } }
      ];
    }
  }

  if (params.tagIds) {
    const indicatorIds = (
      await models.RiskIndicators.find({ tagIds: { $in: params.tagIds } })
    ).map(indicator => indicator._id);

    const groupIds = (
      await models.IndicatorsGroups.find({ tagIds: { $in: params.tagIds } })
    ).map(group => group._id);

    filter.$or = [
      { groupId: { $in: groupIds } },
      { indicatorId: { $in: indicatorIds } }
    ];
  }

  if (params.createdAtFrom) {
    filter.createdAt = { $gte: params.createdAtFrom };
  }
  if (params.createdAtTo) {
    filter.createdAt = { ...filter.createdAt, $lte: params.createdAtTo };
  }
  if (params.closedAtFrom) {
    filter.closedAt = { $gte: params.closedAtFrom };
  }
  if (params.closedAtTo) {
    filter.closedAt = { ...filter.closedAt, $lte: params.closedAtTo };
  }

  if (params.status) {
    filter.statusColor = statusColors[params.status];
  }

  return filter;
};

const generateSort = (sortField, sortDirection) => {
  let sort: any = { createdAt: -1 };

  if (sortField && sortDirection) {
    sort = {};
    sort = { [sortField]: sortDirection };
  }
  return sort;
};

const RiskAssessmentQueries = {
  async riskAssessments(_root, params, { models }: IContext) {
    const filter = await generateFilter(params, models);

    const { sortField, sortDirection } = params;
    const sort = generateSort(sortField, sortDirection);

    return paginate(models.RiskAssessments.find(filter).sort(sort), params);
  },

  async riskAssessmentsTotalCount(_root, params, { models }: IContext) {
    const filter = await generateFilter(params, models);
    return await models.RiskAssessments.countDocuments(filter);
  },
  async riskAssessmentDetail(_root, { id, ...params }, { models }: IContext) {
    return models.RiskAssessments.riskAssessmentDetail(id, params);
  },
  async riskAssessment(_root, { cardId, cardType }, { models }: IContext) {
    return await models.RiskAssessments.find({
      cardId,
      cardType
    });
  },

  async riskAssessmentGroups(
    _root,
    { riskAssessmentId, groupIds }: RiskAssessmentGroupParams,
    { models }: IContext
  ) {
    if (!groupIds.length) {
      throw new Error('Please provide some group id');
    }

    return await models.RiskAssessmentGroups.find({
      assessmentId: riskAssessmentId,
      groupId: { $in: groupIds }
    });
  },

  async riskAssessmentAssignedMembers(
    _root,
    { cardId, cardType },
    { models }: IContext
  ) {
    return models.RiskAssessments.riskAssessmentAssignedMembers(
      cardId,
      cardType
    );
  },
  async riskAssessmentSubmitForm(
    _root,
    { cardId, cardType, riskAssessmentId, userId },
    { models }: IContext
  ) {
    return models.RiskAssessments.riskAssessmentSubmitForm(
      cardId,
      cardType,
      riskAssessmentId,
      userId
    );
  },
  async riskAssessmentIndicatorForm(
    _root,
    { riskAssessmentId, indicatorId, userId },
    { models }: IContext
  ) {
    return models.RiskAssessments.riskAssessmentIndicatorForm(
      riskAssessmentId,
      indicatorId,
      userId
    );
  }
};

checkPermission(RiskAssessmentQueries, 'riskAssessments', 'showRiskAssessment');
checkPermission(
  RiskAssessmentQueries,
  'riskAssessmentsTotalCount',
  'showRiskAssessment'
);
checkPermission(
  RiskAssessmentQueries,
  'riskAssessmentDetail',
  'showRiskAssessment'
);
checkPermission(RiskAssessmentQueries, 'riskAssessment', 'showRiskAssessment');
checkPermission(
  RiskAssessmentQueries,
  'riskAssessmentAssignedMembers',
  'showRiskAssessment'
);
checkPermission(
  RiskAssessmentQueries,
  'riskAssessmentSubmitForm',
  'showRiskAssessment'
);
checkPermission(
  RiskAssessmentQueries,
  'riskAssessmentIndicatorForm',
  'showRiskAssessment'
);

export default RiskAssessmentQueries;
