export interface ILabelRule {
  id: string;
  productCategoryId?: string;
  multiplier?: number;
}
export interface ISPLabel {
  _id?: string;
  title?: string;
  description?: string;
  effect?: string;
  color?: string;
  status?: string;
  rules?: ILabelRule[];
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

export type ITimeframe = {
  _id?: string;
  name?: string;
  description?: string;
  percent?: number;
  startTime?: number;
  endTime?: number;
};

export type TimeframeQueryResponse = {
  timeframes: ITimeframe[];
  loading: boolean;
  refetch: () => void;
};
