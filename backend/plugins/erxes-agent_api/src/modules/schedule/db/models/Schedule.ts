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

/** Bind the MastraSchedule statics onto the schedule schema (mongoose loadClass). */
export const loadScheduleClass = (_models: IModels) => {
  /** Static lifecycle helpers for scheduled agent runs. */
  // skipcq: JS-0327 — the mongoose loadClass pattern requires a class of statics
  class MastraSchedule {
    /** Fetch one schedule; throws when it does not exist. */
    public static async getSchedule(_id: string) {
      const schedule = await _models.MastraSchedule.findOne({ _id });
      if (!schedule) throw new Error('Schedule not found');
      return schedule;
    }

    /** All schedules, newest first. */
    public static getSchedules() {
      return _models.MastraSchedule.find().sort({ createdAt: -1 });
    }

    /** Create a schedule after validating its cron and timezone. */
    public static createSchedule(doc: IMastraSchedule) {
      return _models.MastraSchedule.create({
        ...doc,
        cron: validateCron(doc.cron),
        timezone: validateTimezone(doc.timezone),
      });
    }

    /** Patch a schedule, re-validating cron/timezone when they change. */
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
        { new: true, runValidators: true },
      );
      if (!updated) throw new Error('Schedule not found');
      return updated;
    }

    /** Flip the cron gate; Run-now stays available regardless. */
    public static async setEnabled(_id: string, isEnabled: boolean) {
      const updated = await _models.MastraSchedule.findOneAndUpdate(
        { _id },
        { $set: { isEnabled } },
        { new: true },
      );
      if (!updated) throw new Error('Schedule not found');
      return updated;
    }

    /** Delete a schedule along with its output thread and messages. */
    public static async removeSchedule(_id: string) {
      // The schedule goes first: if the thread cleanup below fails, the
      // leftovers are orphaned chat data, not a live schedule whose history
      // already vanished. (No multi-document transaction — erxes must run on
      // standalone Mongo, where transactions are unavailable.)
      const result = await _models.MastraSchedule.deleteOne({ _id });
      const threadId = `schedule-${_id}`;
      await _models.MastraMessage.deleteMany({ threadId });
      await _models.MastraThread.deleteOne({ threadId });
      return result;
    }

    /** Stamp last-run bookkeeping (status, error, reply, duration) on the doc. */
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
