import {
  IMeeting,
  IMeetingDocument,
  meetingSchema
} from './definitions/meeting';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IUser } from '@erxes/api-utils/src/types';
import { userInfo } from 'os';

export interface IMeetingModel extends Model<IMeetingDocument> {
  meetingDetail(_id: String): Promise<IMeetingDocument>;
  getMeetings(): Promise<IMeetingDocument>;
  createMeeting(args: IMeeting, user: IUser): Promise<IMeetingDocument>;
  updateMeeting(
    _id: String,
    args: IMeeting,
    user: IUser
  ): Promise<IMeetingDocument>;
  removeMeeting(args: IMeeting): Promise<IMeetingDocument>;
}

export const loadMeetingClass = (model: IModels) => {
  class Meeting {
    public static async getMeetings() {
      const meetings = await model.Meetings.find();

      if (!meetings) {
        throw new Error('Meetings not found');
      }

      return meetings;
    }

    public static async meetingDetail(_id: string) {
      const meeting = await model.Meetings.findOne({ _id });

      if (!meeting) {
        return [];
      }

      return meeting;
    }

    // create
    public static async createMeeting(doc, user) {
      console.log('createMeeting:', doc);
      return await model.Meetings.create({
        ...doc,
        createdAt: new Date(),
        createdBy: user._id
      });
    }
    // update
    public static async updateMeeting(_id: string, doc, user) {
      await model.Meetings.updateOne(
        { _id },
        { $set: { ...doc, updatedBy: user._id } }
      ).then(err => console.error(err));
    }
    // remove
    public static async removeMeeting(_id: string) {
      return model.Meetings.deleteOne({ _id });
    }
  }

  meetingSchema.loadClass(Meeting);

  return meetingSchema;
};
