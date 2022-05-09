import { IParticipant } from "./../../../models/definitions/participants";
// import {
//     checkPermission,
//     requireLogin
//   } from '@erxes/api-utils/src/permissions';
import { IContext } from "../../../connectionResolver";

interface IParticipantEdit extends IParticipant {
  _id: string;
}

const participantMutations = {
  participantsAdd: async (
    _root,
    doc: IParticipant,
    { models, docModifier }: IContext
  ) => {
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
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return models.Participants.removeParticipant(_id);
  }
};

//   requireLogin(participantQueries, 'tagDetail');
//   checkPermission(participantQueries, 'tags', 'showTags', []);

export default participantMutations;
