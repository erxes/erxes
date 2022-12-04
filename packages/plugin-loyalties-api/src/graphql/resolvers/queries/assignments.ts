import { checkPermission } from '@erxes/api-utils/src/permissions';
import { ICommonParams } from '../../../models/definitions/common';
import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src/core';

const generateFilter = (params: ICommonParams) => {
  const filter: any = {};

  if (params.campaignId) {
    filter.campaignId = params.campaignId;
  }

  if (params.status) {
    filter.status = params.status;
  }

  return filter;
};

const assignmentQueries = {
  assignments(_root, params: ICommonParams, { models }: IContext) {
    const filter: any = generateFilter(params);
    return paginate(models.Assignments.find(filter), params);
  },

  async assignmentsMain(_root, params: ICommonParams, { models }: IContext) {
    const filter: any = generateFilter(params);

    const list = await paginate(models.Assignments.find(filter), params);

    const totalCount = await models.Assignments.find(filter).countDocuments();

    return {
      list,
      totalCount
    };
  }
};

checkPermission(assignmentQueries, 'assignmentsMain', 'showLoyalties', {
  list: [],
  totalCount: 0
});

export default assignmentQueries;
