type labelsQuery = {
  _id: string;
  type: string;
  color: string;
  title: string;
  status: string;
};

export type labelsQueryResponse = {
  getLabels: labelsQuery[];
  loading: boolean;
  refetch: () => void;
};

type timeframe = {
  _id: string;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
};

export type timeframeQueryResponse = {
  getTimeframes: timeframe[];
  loading: boolean;
  refetch: () => void;
};

type dayplanconfs = {
  _id: string;
  labelsId: string[];
  timeframeId: string;
};

export type dayplanconfsResponse = {
  getDayPlanConfigs: dayplanconfs[];
  loading: boolean;
  refetch: () => void;
};

type monthplanconfs = {
  _id: string;
  labelsId: string[];
  timeframeId: string;
};

export type monthplanconfsResponse = {
  getMonthPlanConfigs: monthplanconfs[];
  loading: boolean;
  refetch: () => void;
};

type yearplanconfs = {
  _id: string;
  labelsId: string[];
  timeframeId: string;
};

export type yearplanconfsResponse = {
  getYearPlanConfigs: yearplanconfs[];
  loading: boolean;
  refetch: () => void;
};

interface saveDayPlan {
  _id: string;
}

export type saveDayPlanResponse = {
  saveDayPlanConfig: saveDayPlan[];
  loading: boolean;
  refetch: () => void;
};

type saveMonthPlan = {
  _id: string;
};

type saveYearPlan = {
  _id: string;
};
