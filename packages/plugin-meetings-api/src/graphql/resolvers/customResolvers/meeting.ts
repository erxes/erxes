import { IContext } from '../../../messageBroker';
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
  }
};
