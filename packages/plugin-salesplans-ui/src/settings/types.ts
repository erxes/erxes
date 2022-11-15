export interface ISPLabel {
  _id: string;
  title?: string;
  description?: string;
  effect?: string;
  color?: string;
  status?: string;
  multiplier?: number;
}

export type SPLabelsQueryResponse = {
  spLabels: ISPLabel[];
  loading: boolean;
  refetch: () => void;
};

export type SPLabelsTotalCountQueryResponse = {
  spLabelsCount: number;
  loading: boolean;
  refetch: () => void;
};

export type SPLabelsRemoveMutationResponse = {
  spLabelsRemove: (mutation: { variables: { _ids: string[] } }) => Promise<any>;
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
