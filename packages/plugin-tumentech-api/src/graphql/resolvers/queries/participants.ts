// import {
//     checkPermission,
//     requireLogin
//   } from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';

const generateFilterQuery = async ({ driverId, dealId, status }) => {
  const query: any = {};

  if (driverId) {
    query.driverId = driverId;
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

    return models.Participants.find(qry).lean();
  },

  participantsTotalCount: async (
    _root,
    params,
    { models, cpUser }: IContext
  ) => {
    const { dealIds } = params;

    if (!dealIds) {
      return models.Participants.find().count();
    }

    return dealIds.map(async (dealId: any) => {
      const qry = await generateFilterQuery({ ...params, dealId });

      let revealedPhoneCount = 0;

      const invitedParticipants = await models.Participants.find({
        ...qry,
        'detail.invited': true
      }).count();

      const history = await models.PurchaseHistories.findOne({
        dealId,
        cpUserId: cpUser.userId
      }).count();

      if (invitedParticipants > 0) {
        revealedPhoneCount = invitedParticipants;
      } else {
        revealedPhoneCount = history;
      }

      return {
        dealId,
        count: models.Participants.find(qry).count(),
        revealedPhoneCount
      };
    });
  },

  participantDetail: async (_root, { _id }, { models }: IContext) => {
    return models.Participants.getParticipant({ _id });
  }
};

//   requireLogin(participantQueries, 'tagDetail');
//   checkPermission(participantQueries, 'tags', 'showTags', []);

export default participantQueries;
