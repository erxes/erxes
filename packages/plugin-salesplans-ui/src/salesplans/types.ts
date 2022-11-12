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
