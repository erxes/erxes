import { checkPermission, paginate } from '@erxes/api-utils/src';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { IContext, IModels } from '../../../connectionResolver';
import { statusColors } from '../../../constants';
import { sendCommonMessage, sendCoreMessage } from '../../../messageBroker';
import { generateSort } from '../../../utils';
import { RiskAssessmentGroupParams } from '../types';
import { generateCardIds } from './utils';

export const generateFilter = async (
  params,
  models: IModels,
  subdomain: string,
  user: IUserDocument
) => {
  let filter: any = {
    $or: [
      { 'permittedUserIds.0': { $exists: false } },
      { permittedUserIds: { $in: [user?._id] } },
    ],
  };

  if (params.cardType) {
    filter.cardType = params.cardType;
  }

  if (params.groupIds) {
    filter.groupId = { $in: params.groupIds };
  }

  if (params.operationIds) {
    filter.operationId = { $in: params.operationIds };
  }

  if (params?.branchIds?.length) {
    const branchIds = await sendCoreMessage({
      subdomain,
      action: 'branches.findWithChild',
      data: {
        query: {
          _id: { $in: params.branchIds },
        },
        fields: { _id: 1 },
      },
      isRPC: true,
      defaultValue: [],
    }).then(branches => branches.map(({ _id }) => _id));

    filter.branchId = { $in: branchIds };
  }

  if (params?.departmentIds?.length) {
    const departmentIds = await sendCoreMessage({
      subdomain,
      action: 'departments.findWithChild',
      data: {
        query: { _id: { $in: params.departmentIds } },
        fields: { _id: 1 },
      },
      isRPC: true,
      defaultValue: [],
    }).then(departments => departments.map(({ _id }) => _id));

    filter.departmentId = { $in: departmentIds };
  }
  if (params.riskIndicatorIds) {
    const groupIds = (
      await models.IndicatorsGroups.aggregate([
        { $match: { 'groups.indicatorIds': { $in: params.riskIndicatorIds } } },
      ])
    ).map(group => group._id);

    filter.indicatorId = { $in: params.riskIndicatorIds };

    if (!!groupIds.length) {
      delete filter.indicatorId;

      filter.$or = [
        { groupId: { $in: groupIds } },
        { indicatorId: { $in: params.riskIndicatorIds } },
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
      { indicatorId: { $in: indicatorIds } },
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

  if (!!params?.customFieldsValues?.length) {
    const cardTypes = filter.cardType ? [filter.cardType] : ['ticket', 'task'];
    let cardIds: string[] = [];

    for (const cardType of cardTypes) {
      await sendCommonMessage({
        serviceName: `${cardType}s`,
        subdomain,
        action: `${cardType}s.find`,
        data: {
          'customFieldsData.value': { $in: params.customFieldsValues },
        },
        isRPC: true,
        defaultValue: [],
      }).then(data => {
        cardIds = [...cardIds, ...data.map(item => item._id)];
      });
    }

    filter.cardId = { $in: cardIds };
  }

  if (params?.cardFilter && filter.cardType) {
    filter.cardId = {
      $in: await generateCardIds(subdomain, filter.cardType, [
        params?.cardFilter,
      ]),
    };
  }

  if (params?.cardFilters && filter.cardType) {
    filter.cardId = {
      $in: await generateCardIds(
        subdomain,
        filter.cardType,
        params?.cardFilters
      ),
    };
  }

  if (params.cardIds) {
    filter.cardId = {
      $in: [...(filter?.cardId?.$in || []), ...params.cardIds],
    };
  }

  return filter;
};

const RiskAssessmentQueries = {
  async riskAssessments(_root, params, { models, subdomain, user }: IContext) {
    const filter = await generateFilter(params, models, subdomain, user);

    const { sortField, sortDirection } = params;
    const sort = generateSort(sortField, sortDirection);

    return paginate(models.RiskAssessments.find(filter).sort(sort), params);
  },

  async riskAssessmentsTotalCount(
    _root,
    params,
    { models, subdomain, user }: IContext
  ) {
    const filter = await generateFilter(params, models, subdomain, user);
    return await models.RiskAssessments.countDocuments(filter);
  },
  async riskAssessmentDetail(
    _root,
    { id, ...params },
    { models, user }: IContext
  ) {
    return models.RiskAssessments.riskAssessmentDetail(id, params, user);
  },
  async riskAssessment(
    _root,
    { cardId, cardType },
    { models, user }: IContext
  ) {
    const riskAssessments = await models.RiskAssessments.find({
      cardId,
      cardType,
    }).lean();

    const result: any[] = [];

    for (let riskAssessment of riskAssessments) {
      if (
        !!riskAssessment?.permittedUserIds?.length &&
        !riskAssessment.permittedUserIds.includes(user._id)
      ) {
        result.push({
          _id: riskAssessment._id,
          permittedUserIds: riskAssessment?.permittedUserIds,
          status: 'You does not have permit on risk assessment',
        });
      } else {
        result.push(riskAssessment);
      }
    }

    return result;
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
      groupId: { $in: groupIds },
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
  },

  async riskAssessmentStatistics(
    _root,
    args,
    { models, user, subdomain }: IContext
  ) {
    const filter = await generateFilter(args, models, subdomain, user);

    return models.RiskAssessments.getStatistic(filter);
  },
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
