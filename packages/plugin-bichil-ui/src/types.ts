import { IUser } from '@erxes/ui/src/auth/types';
import { IAttachment, QueryResponse } from '@erxes/ui/src/types';

export type MutationVariables = {
  _id?: string;
  userId?: string;
  longitude?: number;
  latitude?: number;
  deviceType?: string;
  shiftStart?: Date;
  shiftEnd?: Date;
  shiftActive?: boolean;
};
export interface IAbsence {
  _id: string;
  user: IUser;
  startTime: Date;
  endTime: Date;
  holidayName: string;
  reason: string;
  explanation: string;
  solved: boolean;
  status: string;
  attachment: IAttachment;

  absenceTimeType: string;
  requestDates: string[];
  totalHoursOfAbsence: string;

  note?: string;

  absenceType?: string;
}
export interface ISchedule {
  _id: string;
  user: IUser;
  shifts: IShift[];
  solved: boolean;
  status?: string;
  scheduleConfigId: string;
  scheduleChecked: boolean;
  submittedByAdmin: boolean;
  totalBreakInMins?: number;
}
export interface ITimeclock {
  _id: string;
  shiftStart: Date;
  shiftActive?: boolean;
  user: IUser;
  shiftEnd?: Date;
  employeeUserName?: string;
  employeeId?: number;
  deviceName?: string;
  deviceType?: string;
  inDevice?: string;
  outDevice?: string;
  inDeviceType?: string;
  outDeviceType?: string;
  branchName?: string;

  shiftNotClosed?: boolean;
}

export type ReportsQueryResponse = {
  bichilTimeclockReport: {
    list: IReport[];
    totalCount: number;
    totalHoursScheduled: number;
    totalHoursWorked: number;
    totalShiftNotClosedDeduction: number;
    totalLateMinsDeduction: number;
    totalDeductionPerGroup: number;
  };
} & QueryResponse;

export type ReportByUsersQueryResponse = {
  bichilTimeclockReportByUsers: { list: [IUserReport]; totalCount: number };
} & QueryResponse;
export interface IReport {
  groupTitle: string;
  groupReport: IUserReport[];
  groupTotalMinsLate: number;
  groupTotalAbsenceMins?: number;
  groupTotalMinsWorked?: number;
}

export type TimeclockMutationResponse = {
  timeclockEditMutation: (params: {
    variables: MutationVariables;
  }) => Promise<any>;
};

export interface IUserReport {
  user: IUser;
  scheduleReport: IScheduleReport[];

  branchTitles?: string[];
  departmentTitles?: string[];

  totalMinsWorked?: number;
  totalMinsWorkedToday?: number;
  totalMinsWorkedThisMonth?: number;
  totalHoursWorked?: number;
  totalDaysWorked?: number;
  totalRegularHoursWorked?: number;

  totalMinsScheduled?: number;
  totalHoursScheduled?: number;
  totalMinsScheduledToday?: number;
  totalMinsScheduledThisMonth?: number;
  totalDaysScheduled?: number;

  totalHoursOvertime?: number;
  totalHoursOvernight?: number;

  totalMinsLate?: number;
  totalMinsLateToday?: number;
  totalMinsLateThisMonth?: number;
  totalAbsenceMins?: number;
  totalMinsAbsenceThisMonth?: number;

  totalHoursShiftRequest?: number;
  totalDays?: number;
  totalWeekendDays?: number;

  shiftNotClosedDaysPerUser?: number;
  shiftNotClosedFee?: number;
  shiftNotClosedDeduction?: number;

  latenessFee?: number;
  totalMinsLateDeduction?: number;

  totalDeduction?: number;

  totalHoursVacation?: number;
  totalHoursUnpaidAbsence?: number;
  totalHoursSick?: number;

  index?: number;

  schedules?: ISchedule[];
  timeclocks?: ITimeclock[];
  requests?: IAbsence[];
}

export interface IScheduleReport {
  timeclockDate: string;
  timeclockStart: Date;
  timeclockEnd: Date;
  timeclockDuration: number;

  deviceName: string;
  deviceType: string;

  scheduledStart: Date;
  scheduledEnd: Date;
  scheduledDuration: number;

  totalMinsLate: number;
  totalHoursOvertime: number;
  totalHoursOvernight: number;
}

export interface IShift {
  _id?: string;
  user?: IUser;
  date?: Date;
  shiftStart: Date;
  shiftEnd: Date;
  scheduleConfigId: string;
  lunchBreakInMins?: number;
}
