import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface ITimeClock {
  userId: string;
  shiftStart: Date;
  shiftEnd?: Date;
  shiftActive?: boolean;
  branchName?: string;
  deviceName?: string;
  deviceType?: string;
  inDevice?: string;
  outDevice?: string;
  inDeviceType?: string;
  outDeviceType?: string;
}

export interface ITimeClockDocument extends ITimeClock, Document {
  _id: string;
}

export interface ITimeLog {
  userId: string;
  timelog: Date;
  deviceSerialNo?: string;
}

export interface ITimeLogDocument extends ITimeLog, Document {
  _id: string;
}

export interface IAbsence {
  holidayName?: string;
  userId?: string;

  startTime: Date;
  endTime?: Date;
  checkTime?: Date;
  checkInOutRequest?: boolean;

  reason: string;
  explanation?: string;
  status?: string;
  solved?: boolean;
  absenceTypeId?: string;
  absenceTimeType?: string;
  totalHoursOfAbsence?: string;

  requestDates?: string[];
}
export interface IAbsenceType {
  name: string;

  requestType?: string;
  requestTimeType?: string;
  requestHoursPerDay: number;

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
  scheduleChecked?: boolean;
  submittedByAdmin?: boolean;
  totalBreakInMins?: number;
  createdByRequest?: boolean;
  shiftIds?: string[];
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
  lunchBreakInMins?: number;
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
  lunchBreakInMins: number;
  shiftStart?: string;
  shiftEnd?: string;
}

export interface IScheduleConfigDocument extends IScheduleConfig, Document {
  _id: string;
}

export interface IDeviceConfig {
  deviceName?: string;
  serialNo: string;
  extractRequired?: boolean;
}

export interface IDeviceConfigDocument extends IDeviceConfig, Document {
  _id: string;
}

export interface IReportCheck {
  userId: string;
  startDate: string;
  endDate: string;
}
export interface IReportCheckDocument extends IReportCheck, Document {
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

export const timeLogSchema = new Schema({
  _id: field({ pkey: true }),
  userId: field({ type: String, label: 'User', index: true }),
  deviceSerialNo: field({
    type: String,
    label: 'Terminal device serial number',
    optional: true
  }),
  timelog: field({ type: Date, label: 'Shift starting time', index: true })
});

timeLogSchema.index({ userId: 1, timelog: 1, deviceSerialNo: 1 });

export const timeclockSchema = new Schema({
  _id: field({ pkey: true }),
  userId: field({ type: String, label: 'User', index: true }),
  shiftStart: field({ type: Date, label: 'Shift starting time', index: true }),
  shiftEnd: field({ type: Date, label: 'Shift ending time', index: true }),
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
  deviceType: field({
    type: String,
    label: 'Which device used for clock in/out'
  }),
  inDevice: field({
    type: String,
    label: 'check in device name',
    optional: true
  }),
  outDevice: field({
    type: String,
    label: 'check out device name',
    optional: true
  }),
  inDeviceType: field({
    type: String,
    label: 'check in device type',
    optional: true
  }),
  outDeviceType: field({
    type: String,
    label: 'check out device type',
    optional: true
  })
});

timeclockSchema.index({
  userId: 1,
  shiftStart: 1,
  shiftEnd: 1,
  shiftActive: 1
});

export const absenceTypeSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Absence type', index: true }),
  requestType: field({ type: String, label: 'Type of a request' }),
  requestTimeType: field({ type: String, label: 'Either by day or by hours' }),
  requestHoursPerDay: field({
    type: Number,
    label: 'Hours per day if requestTimeType is by day'
  }),
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

absenceTypeSchema.index({ name: 1, requestType: 1 });

export const absenceSchema = new Schema({
  _id: field({ pkey: true }),
  userId: field({ type: String, label: 'User', index: true }),
  startTime: field({ type: Date, label: 'Absence starting time', index: true }),
  endTime: field({ type: Date, label: 'Absence ending time', index: true }),

  requestDates: field({
    type: [String],
    label: 'Requested dates in string format'
  }),

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
  checkInOutRequest: field({
    type: Boolean,
    label: 'Whether request is check in/out request'
  }),

  absenceTypeId: field({
    type: String,
    label: 'id of an absence type'
  }),

  absenceTimeType: field({
    type: String,
    default: 'by hour',
    label: 'absence time type either by day or by hour'
  }),

  totalHoursOfAbsence: field({
    type: String,
    label: 'total hours of absence request'
  })
});

absenceSchema.index({ userId: 1, startTime: 1, endTime: 1 });

export const scheduleSchema = new Schema({
  _id: field({ pkey: true }),
  userId: field({ type: String, label: 'User', index: true }),
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
  }),
  scheduleChecked: field({
    type: Boolean,
    label: 'Whether schedule is checked by employee',
    default: false
  }),
  submittedByAdmin: field({
    type: Boolean,
    label: 'Whether schedule was submitted/assigned directly by an admin',
    default: false
  }),
  totalBreakInMins: field({
    type: Number,
    label: 'Total break time in mins'
  }),
  createdByRequest: field({
    type: Boolean,
    label: 'Whether schedule was created by shift request',
    default: false,
    optional: true
  })
});

scheduleSchema.index({ userId: 1, solved: 1, status: 1 });

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
  lunchBreakInMins: field({
    type: Number,
    label: 'lunch break of the shift'
  }),
  chosenScheduleConfigId: field({
    type: String,
    label: '_id of a chosen schedule config when creating schedule'
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
  scheduleName: field({
    type: String,
    label: 'Name of the schedule',
    index: true
  }),
  lunchBreakInMins: field({
    type: Number,
    label: 'Lunch break in mins',
    default: 30
  }),
  shiftStart: field({
    type: String,
    label: 'starting time of shift'
  }),
  shiftEnd: field({
    type: String,
    label: 'ending time of shift'
  })
});

export const deviceConfigSchema = new Schema({
  _id: field({ pkey: true }),
  deviceName: field({ type: String, label: 'Name of the device' }),
  serialNo: field({
    type: String,
    label: 'Serial number of the device',
    index: true
  }),
  extractRequired: field({
    type: Boolean,
    label: 'whether extract from the device'
  })
});

deviceConfigSchema.index({ serialNo: 1 });

export const reportCheckSchema = new Schema({
  _id: field({ pkey: true }),
  userId: field({ type: String, label: 'User of the report', index: true }),
  startDate: field({ type: String, label: 'Start date of report' }),
  endDate: field({
    type: String,
    label: 'End date of report'
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

  lunchBreakInHrs?: string;

  totalMinsLate?: string;
  totalHoursOvertime?: string;
  totalHoursOvernight?: string;
  shiftDuration?: number;
  checked?: boolean;
}

export interface IUserReport {
  userId?: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  position?: string;

  scheduleReport: IScheduleReport[];

  totalMinsWorked?: number;

  totalMinsScheduled?: number;

  totalMinsLate?: number;
  totalAbsenceMins?: number;

  totalHoursWorkedSelectedDay?: number;
  totalHoursScheduledSelectedDay?: number;
  totalHoursAbsentSelectedDay?: number;
  totalMinsLateSelectedDay?: number;

  totalHoursWorkedSelectedMonth?: number;
  totalHoursScheduledSelectedMonth: number;
  totalHoursAbsentSelectedMonth?: number;
  totalMinsLateSelectedMonth?: number;

  totalDaysScheduledSelectedMonth?: number;
  totalDaysWorkedSelectedMonth?: number;
}

export interface IUserExportReport {
  firstName?: string;
  lastName?: string;
  branchName?: string;
  employeeId?: string;

  position?: string;
  totalDaysWorked?: number;
  totalHoursWorked?: string;
  totalRegularHoursWorked?: string;

  totalDaysScheduled?: number;
  totalHoursScheduled?: string;

  totalHoursOvertime?: string;
  totalHoursOvernight?: string;

  totalHoursBreakScheduled?: string;
  totalHoursBreakTaken?: string;

  absenceInfo?: IUserAbsenceInfo;

  totalMinsLate?: number | string;
  totalAbsenceMins?: number;

  totalHoursWorkedSelectedDay?: number;
  totalHoursScheduledSelectedDay?: number;
  totalHoursAbsentSelectedDay?: number;
  totalMinsLateSelectedDay?: number;

  totalHoursWorkedSelectedMonth?: number;
  totalHoursScheduledSelectedMonth?: number;
  totalHoursAbsentSelectedMonth?: number;
  totalMinsLateSelectedMonth?: number;

  totalDaysScheduledSelectedMonth?: number;
  totalDaysWorkedSelectedMonth?: number;

  scheduleReport?: IScheduleReport[];
}

export interface IUserAbsenceInfo {
  totalHoursShiftRequest?: number;
  totalHoursWorkedAbroad?: number;
  totalHoursPaidAbsence?: number;
  totalHoursUnpaidAbsence?: number;
  totalHoursSick?: number;
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
