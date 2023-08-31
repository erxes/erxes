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
  createMeeting(args: IMeeting, user: IUser): Promise<IMeetingDocument>;
  updateMeeting(args: IMeeting, user: IUser): Promise<IMeetingDocument>;
  removeMeeting(_id: String): Promise<IMeetingDocument>;
}

export const loadMeetingClass = (model: IModels) => {
  class Meeting {
    public static async meetingDetail(_id: string, userId: string) {
      const meeting = await model.Meetings.findOne({ _id, createdBy: userId });

      if (!meeting) {
        return [];
      }

      return meeting;
    }

    // create
    public static async createMeeting(doc, user) {
      return await model.Meetings.create({
        ...doc,
        createdAt: new Date(),
        createdBy: user._id
      });
    }
    // update
    public static async updateMeeting(doc, user) {
      if (!user) {
        throw new Error('You are not logged in');
      }
      await model.Meetings.updateOne(
        { _id: doc._id },
        { $set: { ...doc, updatedBy: user._id } }
      );
      return model.Meetings.findOne({ _id: doc._id });
    }
    // remove
    public static async removeMeeting(_id: string) {
      return model.Meetings.deleteOne({ _id });
    }
  }

  meetingSchema.loadClass(Meeting);

  return meetingSchema;
};
