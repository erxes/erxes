import { IContext } from '../../../messageBroker';

const meetingMutations = {
  // /**
  //  * Creates a new meetings
  //  */
  async meetingAdd(_root, doc, { models, user }: IContext) {
    return await models.Meetings.createMeeting(doc, user);
  },
  // /**
  //  * Edits a meetings
  //  */
  async meetingEdit(_root, doc, { models, user }: IContext) {
    return models.Meetings.updateMeeting(doc, user);
  },
  /**
   * Removes a single meetings
   */
  async meetingRemove(_root, { _id }, { models }: IContext) {
    await models.Meetings.removeMeeting(_id);
    return 'removed';
  }
};

export default meetingMutations;
