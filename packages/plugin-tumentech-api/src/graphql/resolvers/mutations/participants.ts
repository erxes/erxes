import {
  IParticipant,
  IParticipantDocument
} from './../../../models/definitions/participants';
// import {
//     checkPermission,
//     requireLogin
//   } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

interface IParticipantEdit extends IParticipant {
  _id: string;
}

interface IParticipantAdd extends IParticipant {
  customerIds?: string[];
}

const participantMutations = {
  participantsAdd: async (
    _root,
    doc: IParticipantAdd,
    { models, docModifier }: IContext
  ) => {
    const { customerIds = [] } = doc;

    if (customerIds && customerIds.length) {
      const participants: IParticipantDocument[] = [];

      for (const customerId of customerIds) {
        doc.customerId = customerId;
        const participant = await models.Participants.createParticipant(
          docModifier(doc)
        );
        participants.push(participant);
      }

      return participants;
    }

    return models.Participants.createParticipant(docModifier(doc));
  },

  participantsEdit: async (
    _root,
    { _id, ...doc }: IParticipantEdit,
    { models }: IContext
  ) => {
    return models.Participants.updateParticipant(_id, doc);
  },

  participantsRemove: async (
    _root,
    { _id, doc }: { _id: string; doc: any[] },
    { models }: IContext
  ) => {
    if (doc) {
      return models.Participants.deleteMany({
        dealId: 'uid',
        id: { $in: [10, 2, 3, 5] }
      });
    }

    return models.Participants.removeParticipant(_id);
  },

  participantsRemoveFromDeal: async (
    _root,
    { dealId, customerIds }: { dealId: string; customerIds: string[] },
    { models }: IContext
  ) => {
    return models.Participants.deleteMany({
      dealId,
      customerId: { $in: customerIds }
    });
  }
};

//   requireLogin(participantQueries, 'tagDetail');
//   checkPermission(participantQueries, 'tags', 'showTags', []);

export default participantMutations;
