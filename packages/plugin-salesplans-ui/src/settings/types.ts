import { IProductCategory } from '@erxes/ui-products/src/types';
import { IBranch, IDepartment } from '@erxes/ui/src/team/types';

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

//////// time proportions

export interface IPercentValue {
  _id: string;
  timeId: string;
  percent: number;
}

export interface IPercentTime extends IPercentValue {
  time?: ITimeframe;
}
export interface ITimeProportion {
  _id: string;
  departmentId?: string;
  branchId?: string;
  productCategoryId?: string;
  percents?: IPercentValue[];
  createdAt?: Date;
  createdBy?: string;
  modifiedAt?: Date;
  modifiedBy?: string;

  branch?: IBranch;
  department?: IDepartment;
  productCategory?: IProductCategory;
}

export interface ITimeProportionParams {
  departmentIds?: string[];
  branchIds?: string[];
  productCategory?: string;
  percents?: IPercentValue[];
}

export type TimeProportionsQueryResponse = {
  timeProportions: ITimeProportion[];
  loading: boolean;
  refetch: () => void;
};

export type TimeProportionsCountQueryResponse = {
  timeProportionsCount: number;
  loading: boolean;
  refetch: () => void;
};

export type TimeProportionsEditMutationResponse = {
  timeProportionEdit: (mutation: {
    variables: ITimeProportion;
  }) => Promise<any>;
};

export type TimeProportionsRemoveMutationResponse = {
  timeProportionsRemove: (mutation: {
    variables: { _ids: string[] };
  }) => Promise<any>;
};
