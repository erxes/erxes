import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { statusColors } from '../../../constants';
import { riskAssessment } from '../../../permissions';

const generateFilter = async (params, models) => {
  let filter: any = {};

  if (params.searchValue) {
    filter.name = { $regex: new RegExp(params.searchValue, 'i') };
  }

  if (params.operationIds) {
    filter.operationIds = { $in: params.operationIds };
  }

  if (params.branchIds) {
    filter.branchIds = { $in: params.branchIds };
  }

  if (params.departmentIds) {
    filter.departmentIds = { $in: params.departmentId };
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

const RiskAssessmentQueries = {
  async riskAssessments(_root, params, { models }: IContext) {
    const filter = await generateFilter(params, models);

    return paginate(
      models.RiskAssessments.find(filter).sort({ createdAt: -1 }),
      params
    );
  },

  async riskAssessmentsTotalCount(_root, params, { models }: IContext) {
    const filter = await generateFilter(params, models);
    return await models.RiskAssessments.countDocuments(filter);
  },
  async riskAssessmentDetail(_root, { id }, { models }: IContext) {
    return models.RiskAssessments.riskAssessmentDetail(id);
  },
  async riskAssessment(_root, { cardId, cardType }, { models }: IContext) {
    return await models.RiskAssessments.findOne({
      cardId,
      cardType
    });
  },
  async riskAssessmentAssignedMembers(
    _root,
    { cardId, cardType, riskAssessmentId },
    { models }: IContext
  ) {
    return models.RiskAssessments.riskAssessmentAssignedMembers(
      cardId,
      cardType,
      riskAssessmentId
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

export default RiskAssessmentQueries;
