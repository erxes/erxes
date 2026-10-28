export enum WorkDay {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
  Sunday = 'Sunday',
}

export interface IWorkDay {
  inactive: boolean;
  startFrom: string;
  endTo: string;
  lunchStartFrom: string;
  lunchEndTo: string;
}

export interface IHoliday {
  _id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  inactive: boolean;
  startFrom?: string;
  endTo?: string;
}

export type IWorkhoursForm = Partial<Record<WorkDay, IWorkDay>> & {
  holidays?: IHoliday[];
};
