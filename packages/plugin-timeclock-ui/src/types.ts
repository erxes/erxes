import { IUser } from '@erxes/ui/src/auth/types';
import { IBranch } from '@erxes/ui/src/team/types';
import { IAttachment, QueryResponse } from '@erxes/ui/src/types';

export interface ITimeclock {
  _id: string;
  shiftStart: Date;
  shiftActive: boolean;
  user: IUser;
  shiftEnd: Date;
  employeeUserName: string;
  employeeId: number;
  deviceName: string;
  deviceType: string;
  branchName: string;
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
export interface ISchedule {
  [key: string]: {
    overnightShift?: boolean;
    shiftDate?: Date;
    shiftStart?: Date;
    shiftEnd?: Date;
  };
}
export type TimeClockMainQueryResponse = {
  timeclocksMain: { list: ITimeclock[]; totalCount: number };
} & QueryResponse;

export type TimeClockQueryResponse = {
  timeclocks: ITimeclock[];
  refetch: () => void;
  loading: boolean;
};

export type AbsenceQueryResponse = {
  requestsMain: { list: IAbsence[]; totalCount: number };
} & QueryResponse;

export type AbsenceTypeQueryResponse = {
  absenceTypes: IAbsenceType[];
  refetch: () => void;
  loading: boolean;
};

export type PayDatesQueryResponse = {
  payDates: IPayDates[];
  refetch: () => void;
  loading: boolean;
};
export type HolidaysQueryResponse = {
  holidays: IAbsence[];
  refetch: () => void;
  loading: boolean;
};

export type ScheduleConfigQueryResponse = {
  scheduleConfigs: IScheduleConfig[];
  refetch: () => void;
  loading: boolean;
};

export type ScheduleQueryResponse = {
  schedulesMain: { list: IShiftSchedule[]; totalCount: number };
} & QueryResponse;

export type BranchesQueryResponse = {
  branches: IBranch[];
  refetch: () => void;
  loading: boolean;
};

export type ReportsQueryResponse = {
  timeclockReports: { list: IReport[]; totalCount: number };
  refetch: () => void;
  loading: boolean;
};

export type MutationVariables = {
  _id?: string;
  userId: string;
  longitude: number;
  latitude: number;
  deviceType?: string;
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

export type TimeClockMutationResponse = {
  startTimeMutation: (params: { variables: MutationVariables }) => Promise<any>;
  stopTimeMutation: (params: { variables: MutationVariables }) => Promise<any>;
  extractAllMySqlDataMutation: (params: {
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
