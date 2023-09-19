import { IContext, sendCardsMessage } from '../../../messageBroker';
import { IMeeting } from '../../../models/definitions/meeting';

export default {
  async topics({ id }, {}, { models }: IContext) {
    const selector: any = {};

    if (!id) return null;

    return await models.Topics.find({ meetingId: id });
  },

  async participantUser(meeting) {
    if (!meeting.participantIds) return null;

    return meeting.participantIds.map(participantId => {
      return {
        __typename: 'User',
        _id: participantId
      };
    });
  },

  async createdUser(meeting: IMeeting) {
    return (
      meeting.createdBy && {
        __typename: 'User',
        _id: meeting.createdBy
      }
    );
  },

  async deals({ dealIds }: IMeeting, {}, { subdomain }: IContext) {
    if (!dealIds?.length) {
      return [];
    }
    let deals = await sendCardsMessage({
      subdomain,
      action: 'deals.find',
      data: { _id: { $in: dealIds } },
      isRPC: true,
      defaultValue: ''
    });
    for (const dealId of dealIds || []) {
      if (dealId) {
        const link = await sendCardsMessage({
          subdomain,
          action: 'getLink',
          data: { _id: dealId, type: 'deal' },
          isRPC: true,
          defaultValue: ''
        });

        if (link) {
          deals = deals.map(deal =>
            deal._id === dealId ? { ...deal, link } : deal
          );
        }
      }
    }
    return deals;
  }
};
