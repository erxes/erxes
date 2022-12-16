import { IUser } from '@erxes/ui/src/auth/types';
import { IBranch, IDepartment } from '@erxes/ui/src/team/types';
import { IAttachment } from '@erxes/ui/src/types';

export interface ITimeclock {
  _id: string;
  shiftStart: Date;
  shiftActive: boolean;
  user: IUser;
  shiftEnd: Date;
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
  totalMinsLate?: number;
  totalAbsenceMins?: number;
  totalMinsWorked?: number;
}

export interface IScheduleReport {
  date?: string;
  scheduleStart?: Date;
  scheduleEnd?: Date;
  recordedStart?: Date;
  recordedEnd?: Date;
  minsLate?: number;
  minsWorked?: number;
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

export interface ISchedule {
  [key: string]: {
    display?: boolean;
    shiftStart?: Date;
    shiftEnd?: Date;
  };
}

export type TimeClockQueryResponse = {
  timeclocks: ITimeclock[];
  refetch: () => void;
  loading: boolean;
};

export type AbsenceQueryResponse = {
  absences: IAbsence[];
  refetch: () => void;
  loading: boolean;
};

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
export type ScheduleQueryResponse = {
  schedules: IShiftSchedule[];
  refetch: () => void;
  loading: boolean;
};

export type BranchesQueryResponse = {
  branches: IBranch[];
  refetch: () => void;
  loading: boolean;
};

export type ReportsQueryResponse = {
  timeclockReports: IReport[];
  refetch: () => void;
  loading: boolean;
};

export type MutationVariables = {
  _id?: string;
  userId: string;
  longitude: number;
  latitude: number;
};
export type AbsenceMutationVariables = {
  _id?: string;
  startTime: Date;
  endTime: Date;
  userId: string;
  reason: string;
  explanation?: string;
  attachment?: IAttachment;
};

export type ScheduleMutationVariables = {
  _id?: string;
  userId: string;
  shifts: IShift[];
};

export type TimeClockMutationResponse = {
  startTimeMutation: (params: { variables: MutationVariables }) => Promise<any>;
  stopTimeMutation: (params: { variables: MutationVariables }) => Promise<any>;
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
};

export type ScheduleMutationResponse = {
  sendScheduleReqMutation: (params: {
    variables: ScheduleMutationVariables;
  }) => Promise<any>;

  submitShiftMutation: (params: {
    variables: { userIds: string[]; shifts: IShift[] };
  }) => Promise<any>;

  solveScheduleMutation: (params: {
    variables: { _id: string; status: string };
  }) => Promise<any>;

  solveShiftMutation: (params: {
    variables: { _id: string; status: string };
  }) => Promise<any>;
};
