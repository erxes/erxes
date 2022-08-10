import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import { PARTICIPATION_STATUSES } from '../constants';
import {
  IParticipant,
  IParticipantDocument,
  participantSchema
} from './definitions/participants';

export interface IParticipantModel extends Model<IParticipantDocument> {
  getParticipant(doc: any): IParticipantDocument;
  setWinner(dealId: string, tripId: string): IParticipantDocument;
  createParticipant(doc: IParticipant): IParticipantDocument;
  updateParticipant(_id: string, fields: IParticipant): IParticipantDocument;
  removeParticipant(_id: string): IParticipantDocument;
}

export const loadParticipantClass = (models: IModels) => {
  class Participant {
    /*
     * Get a Participant
     */
    public static async getParticipant(doc: any) {
      const participant = await models.Participants.findOne(doc);

      if (!participant) {
        throw new Error('Participant not found');
      }

      return participant;
    }

    public static async createParticipant(doc: IParticipant) {
      if (!doc.tripId || !doc.dealId) {
        throw new Error('deal and trip are required!');
      }

      const participant = await models.Participants.findOne({
        dealId: doc.dealId,
        tripId: doc.tripId
      }).lean();

      if (participant) {
        return participant;
      }

      return models.Participants.create({
        ...doc,
        createdAt: new Date()
      });
    }

    public static async updateParticipant(_id: string, doc: IParticipant) {
      const participant = await models.Participants.findOne({ _id });

      if (!participant) {
        throw new Error(`Participant not found with id ${_id}`);
      }

      await models.Participants.updateOne({ _id }, { $set: { ...doc } });
      return models.Participants.findOne({ _id });
    }

    public static async removeParticipant(_id) {
      const participant = await models.Participants.findOne({ _id });

      if (!participant) {
        throw new Error(`Participant not found with id ${_id}`);
      }

      return participant.remove();
    }

    public static async setWinner(dealId: string, tripId: string) {
      const qry = {
        dealId,
        tripId,
        status: PARTICIPATION_STATUSES.PARTICIPATING
      };
      const participant = await models.Participants.findOne(qry);

      if (!participant) {
        throw new Error(`Participant not found with tripId ${tripId}`);
      }

      const winner = await models.Participants.updateOne(qry, {
        $set: { status: PARTICIPATION_STATUSES.WON }
      });

      await models.Participants.updateMany(
        { dealId, status: PARTICIPATION_STATUSES.PARTICIPATING },
        { $set: { status: PARTICIPATION_STATUSES.LOSE } }
      );

      return winner;
    }
  }

  participantSchema.loadClass(Participant);

  return participantSchema;
};
