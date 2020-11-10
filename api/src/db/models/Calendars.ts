import { Model, model } from 'mongoose';
import {
  calendarGroupSchema,
  calendarSchema,
  ICalendar,
  ICalendarDocument,
  ICalendarGroup,
  ICalendarGroupDocument
} from './definitions/calendars';

export interface ICalendarModel extends Model<ICalendarDocument> {
  createCalendar(doc: ICalendar): Promise<ICalendarDocument>;
  updateCalendar(_id: string, doc: ICalendar): Promise<ICalendarDocument>;
  removeCalendar(_id: string): Promise<{ n: number; ok: number }>;
}

export const loadCalendarClass = () => {
  class Calendar {
    /**
     * Create a calendar
     */
    public static async createCalendar(doc: ICalendar) {
      const calendar = await Calendars.create(doc);

      return calendar;
    }

    /**
     * Update Calendar
     */
    public static async updateCalendar(_id: string, doc: ICalendar) {
      await Calendars.updateOne({ _id }, { $set: doc });

      return Calendars.findOne({ _id });
    }

    public static async removeCalendar(_id: string) {
      return Calendars.deleteMany({ _id });
    }
  } // end Calendar class

  calendarSchema.loadClass(Calendar);

  return calendarSchema;
};

export interface ICalendarGroupModel extends Model<ICalendarGroupDocument> {
  createCalendarGroup(doc: ICalendarGroup): Promise<ICalendarGroupDocument>;
  updateCalendarGroup(
    _id: string,
    doc: ICalendarGroup
  ): Promise<ICalendarGroupDocument>;
  removeCalendarGroup(_id: string): Promise<{ n: number; ok: number }>;
}

export const loadCalendarGroupClass = () => {
  class CalendarGroup {
    /**
     * Create a group
     */
    public static async createCalendarGroup(doc: ICalendarGroup) {
      const group = await CalendarGroups.create(doc);

      return group;
    }

    /**
     * Update Calendar
     */
    public static async updateCalendarGroup(_id: string, doc: ICalendarGroup) {
      await CalendarGroups.updateOne({ _id }, { $set: doc });

      return CalendarGroups.findOne({ _id });
    }

    public static async removeCalendarGroup(_id: string) {
      const count = await Calendars.countDocuments({ groupId: _id });

      if (count > 0) {
        throw new Error("Can't remove a calendar group");
      }

      return CalendarGroups.deleteOne({ _id });
    }
  } // end Calendar class

  calendarGroupSchema.loadClass(CalendarGroup);

  return calendarGroupSchema;
};

loadCalendarClass();
loadCalendarGroupClass();

// tslint:disable-next-line

const Calendars = model<ICalendarDocument, ICalendarModel>(
  'calendars',
  calendarSchema
);

const CalendarGroups = model<ICalendarGroupDocument, ICalendarGroupModel>(
  'calendar_groups',
  calendarGroupSchema
);

export { Calendars, CalendarGroups };
