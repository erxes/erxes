import { IUser } from '@erxes/ui/src/auth/types';
import { IBranch } from '@erxes/ui/src/team/types';
import { IAttachment, QueryResponse } from '@erxes/ui/src/types';

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
  branchName?: string;
}
export interface ITimelog {
  _id: string;
  timelog: Date;
  user: IUser;
  deviceSerialNo?: string;
  deviceName?: string;
}
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
}
export interface IAbsenceType {
  _id: string;
  name: string;
  explRequired: boolean;
  attachRequired: boolean;
  shiftRequest: boolean;

  requestType: string;
  requestTimeType: string;
  requestHoursPerDay?: number;
}

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
  absenceInfo?: IUserAbsenceInfo;
}

export interface IUserAbsenceInfo {
  totalHoursWorkedAbroad?: number;
  totalHoursPaidAbsence?: number;
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
export interface IPayDates {
  _id: string;
  payDates: number[];
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
}
export interface IShift {
  user?: IUser;
  date?: Date;
  shiftStart: Date;
  shiftEnd: Date;
}

export interface IShiftSchedule {
  shifts: IShift[];
  user: IUser;
}

export interface IScheduleConfig {
  _id: string;
  scheduleName?: string;
  shiftStart: string;
  shiftEnd: string;
  configDays: IScheduleConfigDays[];
}

export interface IScheduleConfigDays {
  configName: string;
  configShiftStart?: string;
  configShiftEnd?: string;
  overnightShift?: boolean;
}
export interface IScheduleForm {
  [key: string]: {
    overnightShift?: boolean;
    shiftDate?: Date;
    shiftStart: Date;
    shiftEnd: Date;
  };
}

export interface IDeviceConfig {
  _id: string;
  deviceName: string;
  serialNo: string;
  extractRequired: boolean;
}
export type TimeClockMainQueryResponse = {
  timeclocksMain: { list: ITimeclock[]; totalCount: number };
} & QueryResponse;

export type TimeClockQueryResponse = {
  timeclocks: ITimeclock[];
} & QueryResponse;

export type TimeLogsQueryResponse = {
  timelogsMain: { list: ITimelog[]; totalCount: number };
} & QueryResponse;

export type TimeLogsPerUserQueryResponse = {
  timeLogsPerUser: ITimelog[];
} & QueryResponse;

export type AbsenceQueryResponse = {
  requestsMain: { list: IAbsence[]; totalCount: number };
} & QueryResponse;

export type AbsenceTypeQueryResponse = {
  absenceTypes: IAbsenceType[];
} & QueryResponse;

export type PayDatesQueryResponse = {
  payDates: IPayDates[];
  refetch: () => void;
  loading: boolean;
};
export type HolidaysQueryResponse = {
  holidays: IAbsence[];
} & QueryResponse;

export type ScheduleConfigQueryResponse = {
  scheduleConfigs: IScheduleConfig[];
} & QueryResponse;

export type DeviceConfigsQueryResponse = {
  deviceConfigs: { list: IDeviceConfig[]; totalCount: number };
} & QueryResponse;

export type ScheduleQueryResponse = {
  schedulesMain: { list: IShiftSchedule[]; totalCount: number };
} & QueryResponse;

export type BranchesQueryResponse = {
  branches: IBranch[];
} & QueryResponse;

export type ReportsQueryResponse = {
  timeclockReports: { list: IReport[]; totalCount: number };
} & QueryResponse;

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
export type AbsenceMutationVariables = {
  _id?: string;
  startTime: Date;
  endTime: Date;
  userId: string;
  reason: string;
  explanation?: string;
  attachment?: IAttachment;
  absenceTypeId?: string;
};

export type ScheduleMutationVariables = {
  _id?: string;
  userId?: string;
  shifts: IShift[];
  branchIds?: string[];
  departmentIds?: string[];
  userIds?: string[];
  scheduleConfigId?: string;
};

export type TimeLogMutationResponse = {
  extractTimeLogsFromMsSQLMutation: (params: {
    variables: { startDate: string; endDate: string };
  }) => Promise<any>;

  createTimeClockFromLogMutation: (params: {
    variables: { userId: string; timelog: Date };
  }) => Promise<any>;
};

export type TimeClockMutationResponse = {
  startTimeMutation: (params: { variables: MutationVariables }) => Promise<any>;
  stopTimeMutation: (params: { variables: MutationVariables }) => Promise<any>;
  timeclockRemove: (params: { variables: { _id: string } }) => Promise<any>;
  timeclockEditMutation: (params: {
    variables: MutationVariables;
  }) => Promise<any>;
  extractAllMsSqlDataMutation: (params: {
    variables: { startDate: string; endDate: string };
  }) => Promise<any>;
};

export type AbsenceMutationResponse = {
  sendAbsenceReqMutation: (params: {
    variables: AbsenceMutationVariables;
  }) => Promise<any>;

  solveAbsenceMutation: (params: {
    variables: { _id: string; status: string };
  }) => Promise<any>;

  submitCheckInOutRequestMutation: (params: {
    variables: {
      checkType: string;
      userId: string;
      checkTime: Date;
    };
  }) => Promise<any>;
};

export type ConfigMutationResponse = {
  addAbsenceType: (params: {
    variables: {
      name: string;
      explRequired: boolean;
      attachRequired: boolean;
    };
  }) => Promise<any>;
  editAbsenceType: (params: {
    variables: {
      _id: string;
      name: string;
      explRequired: boolean;
      attachRequired: boolean;
    };
  }) => Promise<any>;
  removeAbsenceTypeMutation: (params: {
    variables: {
      _id: string;
    };
  }) => Promise<any>;
  addPayDateMutation: (params: {
    variables: {
      dateNums: number[];
    };
  }) => Promise<any>;
  editPayDateMutation: (params: {
    variables: {
      _id: string;
      dateNums: number[];
    };
  }) => Promise<any>;
  removePayDateMutation: (params: {
    variables: {
      _id: string;
    };
  }) => Promise<any>;
  addHolidayMutation: (params: {
    variables: {
      name: string;
      startDate: string;
      endDate: string;
    };
  }) => Promise<any>;

  editHolidayMutation: (params: {
    variables: {
      _id: string;
      name: string;
      startDate: string;
      endDate: string;
    };
  }) => Promise<any>;
  removeHolidayMutation: (params: {
    variables: {
      _id: string;
    };
  }) => Promise<any>;

  removeScheduleConfigMutation: (params: {
    variables: {
      _id: string;
    };
  }) => Promise<any>;

  removeDeviceConfigMutation: (params: {
    variables: {
      _id: string;
    };
  }) => Promise<any>;
};

export type ScheduleMutationResponse = {
  sendScheduleReqMutation: (params: {
    variables: ScheduleMutationVariables;
  }) => Promise<any>;

  submitScheduleMutation: (params: {
    variables: ScheduleMutationVariables;
  }) => Promise<any>;

  solveScheduleMutation: (params: {
    variables: { _id: string; status: string };
  }) => Promise<any>;

  solveShiftMutation: (params: {
    variables: { _id: string; status: string };
  }) => Promise<any>;

  removeScheduleMutation: (params: {
    variables: { _id: string };
  }) => Promise<any>;

  removeScheduleShiftMutation: (params: {
    variables: { _id: string };
  }) => Promise<any>;
};
