import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface ITimeClock {
  userId?: string;
  solved?: boolean;
  status?: string;
  shiftStart: Date;
  shiftEnd?: Date;
  shiftActive?: boolean;
  longitude?: number;
  latitude?: number;
}

export interface ITimeClockDocument extends ITimeClock, Document {
  _id: string;
}

export interface IAbsence {
  holidayName?: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  reason?: string;
  explanation?: string;
  status: string;
  solved?: boolean;
}
export interface IAbsenceType {
  name: string;
  explRequired: boolean;
  attachRequired: boolean;
}

export interface IAbsenceDocument extends IAbsence, Document {
  _id: string;
}

export interface IAbsenceTypeDocument extends IAbsenceType, Document {
  _id: string;
}

export interface ISchedule {
  userId?: string;
  status?: string;
  solved?: boolean;
}

export interface IScheduleDocument extends ISchedule, Document {
  _id: string;
}

export interface IShift {
  scheduleId?: string;
  solved?: boolean;
  status?: string;
  shiftStart?: Date;
  shiftEnd?: Date;
  absentWholeShift?: boolean;
  absenceStart?: Date;
  absenceEnd?: Date;
}

export interface IShiftDocument extends IShift, Document {
  _id: string;
}

export interface IPayDate {
  payDates: number[];
}
export interface IPayDateDocument extends IPayDate, Document {
  _id: string;
}

export const attachmentSchema = new Schema(
  {
    name: field({ type: String }),
    url: field({ type: String }),
    type: field({ type: String }),
    size: field({ type: Number, optional: true }),
    duration: field({ type: Number, optional: true })
  },
  { _id: false }
);

export const timeSchema = new Schema({
  _id: field({ pkey: true }),
  userId: field({ type: String, label: 'User' }),
  shiftStart: field({ type: Date, label: 'Shift starting time' }),
  shiftEnd: field({ type: Date, label: 'Shift ending time' }),
  shiftActive: field({
    type: Boolean,
    label: 'Is shift started and active',
    default: false
  })
});

export const absenceTypeSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Absence type' }),
  explRequired: field({
    type: Boolean,
    label: 'whether absence type requires explanation'
  }),
  attachRequired: field({
    type: Boolean,
    label: 'whether absence type requires attachment'
  })
});

export const absenceSchema = new Schema({
  _id: field({ pkey: true }),
  userId: field({ type: String, label: 'User' }),
  startTime: field({ type: Date, label: 'Absence starting time' }),
  endTime: field({ type: Date, label: 'Absence ending time' }),
  holidayName: field({ type: String, label: 'Name of a holiday' }),
  reason: field({ type: String, label: 'reason for absence' }),
  explanation: field({ type: String, label: 'explanation by a team member' }),
  solved: field({
    type: Boolean,
    default: false,
    label: 'whether absence request is solved or pending'
  }),
  attachment: field({ type: attachmentSchema, label: 'Attachment' }),
  status: field({
    type: String,
    label: 'Status of absence request, whether approved or rejected'
  })
});

export const scheduleSchema = new Schema({
  _id: field({ pkey: true }),
  userId: field({ type: String, label: 'User' }),
  solved: field({
    type: Boolean,
    default: false,
    label: 'whether schedule request is solved or pending'
  }),
  status: field({
    type: String,
    label: 'Status of schedule request, whether approved or rejected'
  })
});

export const scheduleShiftSchema = new Schema({
  _id: field({ pkey: true }),
  scheduleId: field({ type: String, label: 'id of an according schedule' }),
  solved: field({
    type: Boolean,
    default: false,
    label: 'whether shift is solved or pending'
  }),
  status: field({
    type: String,
    label: 'Status of shift request, whether approved or rejected'
  }),
  shiftStart: field({
    type: Date,
    label: 'starting date and time of the shift'
  }),
  shiftEnd: field({ type: Date, label: 'ending date and time of the shift' })
});

export const payDateSchema = new Schema({
  _id: field({ pkey: true }),
  payDates: field({ type: [Number], label: 'pay dates' })
});

// common types
export interface IScheduleReport {
  date?: string;
  scheduleStart?: Date;
  scheduleEnd?: Date;
  recordedStart?: Date;
  recordedEnd?: Date;
  minsLate?: number;
  minsWorked?: number;
  include?: boolean;
}

export interface IUserReport {
  userId?: string;
  scheduleReport: IScheduleReport[];
  totalMinsWorkedToday?: number;
  totalMinsScheduledToday?: number;
  totalMinsWorkedThisMonth?: number;
  totalMinsScheduledThisMonth?: number;
  totalMinsLateToday?: number;
  totalMinsLateThisMonth?: number;
  totalMinsAbsenceThisMonth?: number;
}

export interface IGroup {
  userIds: string[];
  title: string;
}

export interface IReport {
  groupTitle: string;
  groupReport: IUserReport[];
  groupTotalMinsWorked?: number;
  groupTotalMinsLate?: number;
  groupTotalAbsenceMins?: number;
  groupTotalMinsScheduled?: number;
}

export interface IUserReport {
  userId?: string;
  scheduleReport: IScheduleReport[];
  totalMinsWorked?: number;
  totalMinsLate?: number;
  totalAbsenceMins?: number;
  totalMinsScheduled?: number;
}
