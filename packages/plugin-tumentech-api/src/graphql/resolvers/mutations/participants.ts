import { IContext } from '../../../connectionResolver';
import { IParticipant } from './../../../models/definitions/participants';

interface IParticipantEdit extends IParticipant {
  _id: string;
}

const participantMutations = {
  participantsAdd: async (
    _root,
    doc: IParticipant,
    { models, docModifier }: IContext
  ) => {
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
    { dealId, tripId }: { dealId: string; tripId: string },
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
        tripId
      },
      { $set: { status: 'won' } }
    );

    await models.Trips.updateOne(
      { _id: tripId },
      { $push: { dealIds: dealId } }
    );

    return models.Participants.getParticipant({ dealId, tripId });
  }
};

//   requireLogin(participantQueries, 'tagDetail');
//   checkPermission(participantQueries, 'tags', 'showTags', []);

export default participantMutations;
