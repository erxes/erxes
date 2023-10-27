import { IContext, sendCommonMessage } from '../../../messageBroker';

const meetingMutations = {
  // /**
  //  * Creates a new meetings
  //  */
  async meetingAdd(_root, doc, { models, subdomain, user }: IContext) {
    const { participantIds, companyId, title } = doc;

    if (!title && companyId) {
      const company = await sendCommonMessage({
        subdomain,
        serviceName: 'contacts',
        action: 'companies.findOne',
        data: {
          _id: companyId
        },
        isRPC: true
      });

      if (company) {
        doc.title = company.primaryName;
      } else {
        throw new Error('Company not found');
      }
    }
    const allParticipantIds =
      participantIds && participantIds.includes(user._id)
        ? participantIds
        : (participantIds || []).concat(user._id);

    return await models.Meetings.createMeeting(doc, allParticipantIds, user);
  },
  // /**
  //  * Edits a meetings
  //  */
  async meetingEdit(_root, doc, { models, subdomain, user }: IContext) {
    const { companyId, title } = doc;
    if (!title && companyId) {
      const company = await sendCommonMessage({
        subdomain,
        serviceName: 'contacts',
        action: 'companies.findOne',
        data: {
          _id: companyId
        },
        isRPC: true
      });

      if (company) {
        doc.title = company.primaryName;
      } else {
        throw new Error('Company not found');
      }
    }
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
