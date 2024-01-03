///////// year

import { IProduct } from '@erxes/ui-products/src/types';
import { IBranch, IDepartment } from '@erxes/ui/src/team/types';
import { ITimeframe } from '../settings/types';

export interface IPlanValues {
  [key: string]: number;
}

export interface IYearPlan {
  _id: string;
  year?: number;
  departmentId?: string;
  branchId?: string;
  productId?: string;
  uom?: string;
  values?: IPlanValues;
  confirmedData?: any;
  createdAt?: Date;
  createdBy?: string;
  modifiedAt?: Date;
  modifiedBy?: string;

  branch?: IBranch;
  department?: IDepartment;
  product?: IProduct;
}

export interface IYearPlanParams {
  year?: number;
  departmentId?: string;
  branchId?: string;
  productCategory?: string;
  productId?: string;
}

export type YearPlansQueryResponse = {
  yearPlans: IYearPlan[];
  loading: boolean;
  refetch: () => void;
};

export type YearPlansCountQueryResponse = {
  yearPlansCount: number;
  loading: boolean;
  refetch: () => void;
};

export type YearPlansSumQueryResponse = {
  yearPlansSum: any;
  loading: boolean;
  refetch: () => void;
};

export type YearPlansRemoveMutationResponse = {
  yearPlansRemove: (mutation: {
    variables: { _ids: string[] };
  }) => Promise<any>;
};

export type YearPlansEditMutationResponse = {
  yearPlanEdit: (mutation: { variables: IYearPlan }) => Promise<any>;
};

///////// day

export interface IPlanValue {
  _id: string;
  timeId: string;
  count: number;
}

export interface IPlanTime extends IPlanValue {
  time?: ITimeframe;
}
export interface IDayPlan {
  _id: string;
  date?: Date;
  status?: string;
  departmentId?: string;
  branchId?: string;
  productId?: string;
  uom?: string;
  planCount?: number;
  values?: IPlanValue[];
  confirmedData?: any;
  createdAt?: Date;
  createdBy?: string;
  modifiedAt?: Date;
  modifiedBy?: string;

  branch?: IBranch;
  department?: IDepartment;
  product?: IProduct;
}

export interface IDayPlanParams {
  date?: Date;
  departmentId?: string;
  branchId?: string;
  productCategory?: string;
  productId?: string;
}

export interface IDayPlanConfirmParams {
  date: Date;
  branchId: string;
  departmentId: string;
  productCategoryId?: string;
  productId?: string;
  ids?: any[];
}

export type DayPlansQueryResponse = {
  dayPlans: IDayPlan[];
  loading: boolean;
  refetch: () => void;
};

export type DayPlansCountQueryResponse = {
  dayPlansCount: number;
  loading: boolean;
  refetch: () => void;
};

export type DayPlansSumQueryResponse = {
  dayPlansSum: number;
  loading: boolean;
  refetch: () => void;
};

export type DayPlansEditMutationResponse = {
  dayPlanEdit: (mutation: { variables: IDayPlan }) => Promise<any>;
};

export type DayPlansRemoveMutationResponse = {
  dayPlansRemove: (mutation: { variables: { _ids: string[] } }) => Promise<any>;
};

export type DayPlansConfirmMutationResponse = {
  dayPlansConfirm: (mutation: {
    variables: IDayPlanConfirmParams;
  }) => Promise<any>;
};

export const colors = {
  new: '#01aecc',
  sent: '#D9E3F0',
  pending: '#F47373',
  confirmed: '#697689',
  '': '#4bbf6b'
  // '#0078bf',
  // '#89609d',
  // '#838c91',
  // '#cd5a91',
  // '#d29034',
  // '#63D2D6',
  // '#F7CE53',
  // '#FF6900',
  // '#EB144C'
};
