import { IContext } from '../../../messageBroker';

const meetingMutations = {
  // /**
  //  * Creates a new meetings
  //  */
  async meetingAdd(_root, doc, { models }: IContext) {
    console.log('jjj', doc);
    return await models.Meetings.createMeeting(doc);
  },
  // /**
  //  * Edits a new meetings
  //  */
  async meetingEdit(_root, { _id, doc }, { models }: IContext) {
    return models.Meetings.updateMeeting(_id, doc);
  },
  /**
   * Removes a single meetings
   */
  async meetingRemove(_root, { _id }, { models }: IContext) {
    return models.Meetings.removeMeeting(_id);
  }
};

export default meetingMutations;
