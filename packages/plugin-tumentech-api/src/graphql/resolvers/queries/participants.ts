// import {
//     checkPermission,
//     requireLogin
//   } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src';
const fs = require('fs');

const generateFilterQuery = async ({ customerId, dealId, status }) => {
  const query: any = {};

  if (customerId) {
    query.customerId = customerId;
  }

  if (dealId) {
    query.dealId = dealId;
  }

  if (status) {
    query.status = status;
  }

  return query;
};

const participantQueries = {
  participants: async (_root, params, { models }: IContext) => {
    const qry = await generateFilterQuery(params);

    return paginate(models.Participants.find(qry).lean(), {
      page: params.page || 1,
      perPage: params.perPage
    });
  },

  participantsTotalCount: async (_root, params, { models }: IContext) => {
    const qry = await generateFilterQuery(params);

    return models.Participants.find(qry).count();
  },

  participantDetail: async (_root, { _id }, { models }: IContext) => {
    return models.Participants.getParticipant({ _id });
  }
};

//   requireLogin(participantQueries, 'tagDetail');
//   checkPermission(participantQueries, 'tags', 'showTags', []);

export default participantQueries;
