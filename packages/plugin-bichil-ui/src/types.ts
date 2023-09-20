import { IUser } from '@erxes/ui/src/auth/types';
import { QueryResponse } from '@erxes/ui/src/types';

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

export interface IReport {
  groupTitle: string;
  groupReport: IUserReport[];
  groupTotalMinsLate: number;
  groupTotalAbsenceMins?: number;
  groupTotalMinsWorked?: number;
}

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
