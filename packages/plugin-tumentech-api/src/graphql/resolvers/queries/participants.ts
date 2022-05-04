// import {
//     checkPermission,
//     requireLogin
//   } from '@erxes/api-utils/src/permissions';
import { IContext } from "../../../connectionResolver";

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
  participants: async (
    _root,
    { page, perPage, customerId, dealId, status },
    { models }: IContext
  ) => {
    const qry = await generateFilterQuery({ customerId, dealId, status });
    
    return models.Participants.find(qry).lean();
  },

  participantsTotalCount: async (_root, {}, { models }: IContext) => {
    return 0;
  },

  participantDetail: async (_root, {}, { models }: IContext) => {
    return null;
  }
};

//   requireLogin(participantQueries, 'tagDetail');
//   checkPermission(participantQueries, 'tags', 'showTags', []);

export default participantQueries;
