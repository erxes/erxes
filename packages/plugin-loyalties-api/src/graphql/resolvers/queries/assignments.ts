import { checkPermission } from '@erxes/api-utils/src/permissions';
import { ICommonParams } from '../../../models/definitions/common';
import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src/core';
import { isInSegment } from '../../../utils';

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
  },
  async checkAssignments(
    _root,
    params: { customerId: string; segmentIds: string[] },
    { models, subdomain }: IContext
  ) {
    const { segmentIds } = params;
    for (const segmentId in segmentIds) {
      const data = await isInSegment(subdomain, segmentId, segmentId);

      if (data.status !== 'success') {
        // not all
      }
    }
    // add voucher
  }
};

checkPermission(assignmentQueries, 'assignmentsMain', 'showLoyalties', {
  list: [],
  totalCount: 0
});

export default assignmentQueries;
