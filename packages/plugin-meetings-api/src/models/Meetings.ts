import {
  IMeeting,
  IMeetingDocument,
  meetingSchema
} from './definitions/meeting';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface IMeetingModel extends Model<IMeetingDocument> {
  meetingDetail(companyId: String): Promise<IMeetingDocument>;
  getMeetings(): Promise<IMeetingDocument>;
  createMeeting(args: IMeeting): Promise<IMeetingDocument>;
  updateMeeting(_id: String, args: IMeeting): Promise<IMeetingDocument>;
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

    public static async meetingDetail(companyId: string) {
      const meeting = await model.Meetings.findOne({ companyId });

      if (!meeting) {
        throw new Error('Meeting not found');
      }

      return meeting;
    }

    // create
    public static async createMeeting(doc) {
      console.log('createMeeting:', doc);
      return await model.Meetings.create({
        ...doc,
        createdAt: new Date()
      });
    }
    // update
    public static async updateMeeting(_id: string, doc) {
      await model.Meetings.updateOne({ _id }, { $set: { ...doc } }).then(err =>
        console.error(err)
      );
    }
    // remove
    public static async removeMeeting(_id: string) {
      return model.Meetings.deleteOne({ _id });
    }
  }

  meetingSchema.loadClass(Meeting);

  return meetingSchema;
};
