import { IContext } from '../../../messageBroker';

const meetingQueries = {
  async meetings(_root, { userId }, { models }: IContext) {
    if (!userId) {
      throw new Error('User id requered');
    }

    return await models.Meetings.getMeetings();
  },
  async meetingDetail(_root, { id }, { models }: IContext) {
    if (!id) {
      throw new Error('Meeting id requered');
    }

    return await models.Meetings.meetingDetail(id);
  }
};

export default meetingQueries;
