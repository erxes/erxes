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
    const { customerIds = [], customerId, dealId } = doc;

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

    if (!customerId && customerIds && !customerIds.length) {
      return models.Participants.remove({ dealId });
    }

    return [models.Participants.createParticipant(docModifier(doc))];
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
    { _id }: { _id: string },
    { models }: IContext
  ) => {
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
  },

  selectWinner: async (
    _root,
    { dealId, customerId }: { dealId: string; customerId: string },
    { models }: IContext
  ) => {
    await models.Participants.updateMany(
      {
        dealId
      },
      { $set: { status: 'lose' } }
    );

    await models.Participants.updateOne(
      {
        dealId,
        customerId
      },
      { $set: { status: 'won' } }
    );

    return models.Participants.getParticipant({ dealId, customerId });
  }
};

//   requireLogin(participantQueries, 'tagDetail');
//   checkPermission(participantQueries, 'tags', 'showTags', []);

export default participantMutations;
