import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { scheduleSchema } from '@/schedule/db/definitions/schedule';
import {
  IMastraSchedule,
  IMastraScheduleDocument,
  MastraScheduleRunStatus,
} from '@/schedule/@types/schedule';
import { validateCron, validateTimezone } from '@/schedule/cron';

export interface IMastraScheduleModel extends Model<IMastraScheduleDocument> {
  getSchedule(_id: string): Promise<IMastraScheduleDocument>;
  getSchedules(): Promise<IMastraScheduleDocument[]>;
  createSchedule(doc: IMastraSchedule): Promise<IMastraScheduleDocument>;
  updateSchedule(
    _id: string,
    doc: Partial<IMastraSchedule>,
  ): Promise<IMastraScheduleDocument>;
  setEnabled(_id: string, isEnabled: boolean): Promise<IMastraScheduleDocument>;
  removeSchedule(_id: string): Promise<{ ok?: number }>;
  recordRun(
    _id: string,
    outcome: {
      status: MastraScheduleRunStatus;
      error?: string;
      reply?: string;
      durationMs?: number;
    },
  ): Promise<void>;
}

export const loadScheduleClass = (_models: IModels) => {
  class MastraSchedule {
    public static async getSchedule(_id: string) {
      const schedule = await _models.MastraSchedule.findOne({ _id });
      if (!schedule) throw new Error('Schedule not found');
      return schedule;
    }

    public static async getSchedules() {
      return _models.MastraSchedule.find().sort({ createdAt: -1 });
    }

    public static async createSchedule(doc: IMastraSchedule) {
      return _models.MastraSchedule.create({
        ...doc,
        cron: validateCron(doc.cron),
        timezone: validateTimezone(doc.timezone),
      });
    }

    public static async updateSchedule(
      _id: string,
      doc: Partial<IMastraSchedule>,
    ) {
      const patch: Partial<IMastraSchedule> = { ...doc };
      if (doc.cron !== undefined) patch.cron = validateCron(doc.cron);
      if (doc.timezone !== undefined) {
        patch.timezone = validateTimezone(doc.timezone);
      }
      const updated = await _models.MastraSchedule.findOneAndUpdate(
        { _id },
        { $set: patch },
        { new: true },
      );
      if (!updated) throw new Error('Schedule not found');
      return updated;
    }

    public static async setEnabled(_id: string, isEnabled: boolean) {
      const updated = await _models.MastraSchedule.findOneAndUpdate(
        { _id },
        { $set: { isEnabled } },
        { new: true },
      );
      if (!updated) throw new Error('Schedule not found');
      return updated;
    }

    public static async removeSchedule(_id: string) {
      // The schedule's output thread (and its messages) goes with it.
      const threadId = `schedule-${_id}`;
      await _models.MastraMessage.deleteMany({ threadId });
      await _models.MastraThread.deleteOne({ threadId });
      return _models.MastraSchedule.deleteOne({ _id });
    }

    public static async recordRun(
      _id: string,
      outcome: {
        status: MastraScheduleRunStatus;
        error?: string;
        reply?: string;
        durationMs?: number;
      },
    ) {
      await _models.MastraSchedule.updateOne(
        { _id },
        {
          $set: {
            lastRunAt: new Date(),
            lastStatus: outcome.status,
            lastError: outcome.error ?? '',
            lastReply: (outcome.reply ?? '').slice(0, 2000),
            lastDurationMs: outcome.durationMs,
          },
          $inc: { runCount: 1 },
        },
      );
    }
  }

  scheduleSchema.loadClass(MastraSchedule);
  return scheduleSchema;
};
