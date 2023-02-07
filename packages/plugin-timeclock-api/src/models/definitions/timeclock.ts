import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface ITimeClock {
  userId?: string;
  employeeId?: number;
  employeeUserName?: string;
  shiftStart: Date;
  shiftEnd?: Date;
  shiftActive?: boolean;
  branchName?: string;
  deviceName?: string;
  deviceType?: string;
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
  absenceTypeId?: string;
}
export interface IAbsenceType {
  name: string;
  explRequired: boolean;
  attachRequired: boolean;
  shiftRequest: boolean;
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
  scheduleConfigId?: string;
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
  overnightShift?: boolean;
  weekDay?: boolean;
  configName?: string;
  configShiftStart?: string;
  configShiftEnd?: string;
  scheduleConfigId?: string;
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
export interface IScheduleConfig {
  scheduleName?: string;
  shiftStart?: string;
  shiftEnd?: string;
}

export interface IScheduleConfigDocument extends IScheduleConfig, Document {
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
  }),
  branchName: field({
    type: String,
    label: 'Name of branch where user clocked in / out'
  }),
  deviceName: field({
    type: String,
    label: 'Device name, which user used to clock in / out '
  }),
  employeeUserName: field({
    type: String,
    label: 'Employee user name, as saved on companys terminal'
  }),
  employeeId: field({
    type: String,
    label: 'Employee id, custom field'
  }),
  deviceType: field({
    type: String,
    label: 'Which device used for clock in/out'
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
  }),
  shiftRequest: field({
    type: Boolean,
    label: 'whether absence type is shift request'
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
  }),
  absenceTypeId: field({
    type: String,
    label: 'id of an absence type'
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
  }),
  scheduleConfigId: field({
    type: String,
    label: 'Schedule Config id used for reports'
  })
});

export const scheduleShiftSchema = new Schema({
  _id: field({ pkey: true }),
  scheduleId: field({ type: String, label: 'id of an according schedule' }),
  scheduleConfigId: field({
    type: String,
    label: 'id of an according schedule config'
  }),
  configName: field({
    type: String,
    label: 'name of schedule config'
  }),
  configShiftStart: field({
    type: String,
    label: 'starting time of config day shift'
  }),
  configShiftEnd: field({
    type: String,
    label: 'ending time of config day shift'
  }),
  overnightShift: field({
    type: Boolean,
    label: 'to be sure of whether shift occurs overnight'
  }),

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

export const scheduleConfigSchema = new Schema({
  _id: field({ pkey: true }),
  scheduleName: field({ type: String, label: 'Name of the schedule' }),
  shiftStart: field({
    type: String,
    label: 'starting time of shift'
  }),
  shiftEnd: field({
    type: String,
    label: 'ending time of shift'
  })
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

  timeclockDate?: string;
  timeclockStart?: Date;
  timeclockEnd?: Date;
  timeclockDuration?: string;
  deviceType?: string;
  deviceName?: string;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  scheduledDuration?: string;
  totalMinsLate?: string;
  totalHoursOvertime?: string;
  totalHoursOvernight?: string;
}

export interface IUserReport {
  userId?: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  scheduleReport: IScheduleReport[];
  totalMinsWorked?: number;
  totalMinsWorkedToday?: number;
  totalMinsWorkedThisMonth?: number;
  totalDaysWorkedThisMonth?: number;
  totalMinsScheduled?: number;
  totalMinsScheduledToday?: number;
  totalMinsScheduledThisMonth?: number;
  totalDaysScheduledThisMonth?: number;
  totalMinsLate?: number;
  totalMinsLateToday?: number;
  totalMinsLateThisMonth?: number;
  totalAbsenceMins?: number;
  totalMinsAbsenceThisMonth?: number;
}

export interface IUserExportReport {
  firstName?: string;
  lastName?: string;
  branchName?: string;
  position?: string;
  totalDaysWorked?: number;
  totalHoursWorked?: string;
  totalRegularHoursWorked?: string;

  totalDaysScheduled?: number;
  totalHoursScheduled?: string;

  totalHoursOvertime?: string;
  totalHoursOvernight?: string;
  totalMinsLate?: string;

  scheduleReport?: IScheduleReport[];
}

export interface IUsersReport {
  [userId: string]: IUserExportReport;
}

export interface IGroup {
  userIds: string[];
  title: string;
}

export interface IReport {
  groupTitle?: string;
  groupReport?: IUserReport[];
  groupTotalMinsWorked?: number;
  groupTotalMinsLate?: number;
  groupTotalAbsenceMins?: number;
  groupTotalMinsScheduled?: number;
}
