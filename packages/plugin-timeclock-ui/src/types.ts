import { IUser } from '@erxes/ui/src/auth/types';

export interface ITimeclock {
  _id: string;
  shiftStart: Date;
  user: IUser;
  shiftEnd: Date;
}
export interface IAbsence {
  _id: string;
  user: IUser;
  startTime: Date;
  endTime: Date;
  reason: string;
  explanation: string;
  solved: boolean;
  status: string;
}

export interface IShift {
  user?: IUser;
  date?: Date;
  shiftStart: Date;
  shiftEnd: Date;
}

export interface ISchedule {
  [key: number]: {
    shiftStart: Date;
    shiftEnd: Date;
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

export type ScheduleQueryResponse = {
  shifts: IShift[];
  refetch: () => void;
  loading: boolean;
};

// mutations
export type MutationVariables = {
  _id?: string;
  time: Date;
  userId: string;
};
export type AbsenceMutationVariables = {
  _id?: string;
  startTime: Date;
  endTime: Date;
  userId: string;
  reason: string;
  explanation: string;
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

export type ScheduleMutationResponse = {
  sendScheduleReqMutation: (params: {
    variables: ScheduleMutationVariables;
  }) => Promise<any>;

  solveScheduleMutation: (params: {
    variables: { _id: string; status: string };
  }) => Promise<any>;
};
