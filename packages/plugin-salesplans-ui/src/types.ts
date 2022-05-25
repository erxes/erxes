export type labelsQuery = {
  _id: string;
  type: string;
  color: string;
  title: string;
  status: string;
};

export type timeframeQuery = {
  _id: string;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
};

export type dayplanconfs = {
  _id: string;
  labelsId: string[];
  timeframeId: string;
};

export type monthplanconfs = {
  _id: string;
  labelsId: string[];
  timeframeId: string;
};

export type yearplanconfs = {
  _id: string;
  labelsId: string[];
  timeframeId: string;
};

export interface saveDayPlan {
  _id: string;
}

export type saveMonthPlan = {
  _id: string;
};

export type saveYearPlan = {
  _id: string;
};
