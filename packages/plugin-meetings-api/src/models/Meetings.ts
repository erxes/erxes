import {
  IMeeting,
  IMeetingDocument,
  meetingSchema
} from './definitions/meeting';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IUser } from '@erxes/api-utils/src/types';

export interface IMeetingModel extends Model<IMeetingDocument> {
  meetingDetail(_id: String, userId: string): Promise<IMeetingDocument>;
  createMeeting(
    args: IMeeting,
    participantIds: String[],
    user: IUser
  ): Promise<IMeetingDocument>;
  updateMeeting(args: IMeeting, user: IUser): Promise<IMeetingDocument>;
  removeMeeting(_id: String, user: IUser): Promise<IMeetingDocument>;
}

export const loadMeetingClass = (model: IModels) => {
  class Meeting {
    public static async meetingDetail(_id: string, userId: string) {
      const meeting = await model.Meetings.findOne({
        _id,
        participantIds: { $in: [userId] }
      });

      if (!meeting) {
        return [];
      }

      return meeting;
    }

    // create
    public static async createMeeting(
      doc: IMeeting,
      participantIds: String[],
      user
    ) {
      return await model.Meetings.create({
        ...doc,
        participantIds,
        createdAt: new Date(),
        createdBy: user._id
      });
    }
    // update
    public static async updateMeeting(doc, user) {
      if (!user) {
        throw new Error('You are not logged in');
      }
      const result = await model.Meetings.findOne({
        _id: doc._id,
        createdBy: user._id,
        status: { $ne: 'completed' }
      });
      if (result) {
        await model.Meetings.updateOne(
          { _id: result._id },
          { $set: { ...doc, updatedBy: user._id } }
        );
        return result;
      }
      throw new Error('You cannot edit ');
    }
    // remove
    public static async removeMeeting(_id: string, user) {
      const result = await model.Meetings.findOne({
        _id,
        createdBy: user._id
      });
      if (result) {
        await model.Meetings.deleteOne({ _id });
        return await model.Topics.deleteMany({ meetingId: _id });
      }
      throw new Error('You cannot remove ');
    }
  }

  meetingSchema.loadClass(Meeting);

  return meetingSchema;
};
