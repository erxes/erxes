import { IContext } from '../../../messageBroker';

const meetingMutations = {
  // /**
  //  * Creates a new meetings
  //  */
  async meetingAdd(_root, doc, { models, user }: IContext) {
    const { participantIds } = doc;
    const allParticipantIds =
      participantIds && participantIds.includes(user._id)
        ? participantIds
        : (participantIds || []).concat(user._id);

    return await models.Meetings.createMeeting(doc, allParticipantIds, user);
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
  async meetingRemove(_root, { _id }, { models, user }: IContext) {
    await models.Meetings.removeMeeting(_id, user);
    return 'removed';
  }
};

export default meetingMutations;
