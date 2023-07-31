import { IContext } from '../../../messageBroker';

const meetingQueries = {
  async meetings(_root, { userId }, { models }: IContext) {
    // if (!userId) {
    //   throw new Error('User id requered');
    // }

    return await models.Meetings.getMeetings();
  },
  async meetingDetail(_root, { _id }, { models }: IContext) {
    if (!_id) {
      return [];
    }

    return await models.Meetings.meetingDetail(_id);
  }
};

export default meetingQueries;
