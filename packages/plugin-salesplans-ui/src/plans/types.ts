///////// year

import { IProduct, IUom } from '@erxes/ui-products/src/types';
import { IBranch, IDepartment } from '@erxes/ui/src/team/types';

export interface IPlanValue {
  [key: string]: number;
}

export interface IYearPlan {
  _id: string;
  year?: number;
  departmentId?: string;
  branchId?: string;
  productId?: string;
  uomId?: string;
  values?: IPlanValue;
  confirmedData?: any;
  createdAt?: Date;
  createdBy?: string;
  modifiedAt?: Date;
  modifiedBy?: string;

  branch?: IBranch;
  department?: IDepartment;
  product?: IProduct;
  uom?: IUom;
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

export type YearPlansRemoveMutationResponse = {
  yearPlansRemove: (mutation: {
    variables: { _ids: string[] };
  }) => Promise<any>;
};

export type YearPlansEditMutationResponse = {
  yearPlanEdit: (mutation: { variables: IYearPlan }) => Promise<any>;
};

///////// day

export interface IDayPlan {
  _id: string;
  date?: Date;
  departmentId?: string;
  branchId?: string;
  productId?: string;
  uomId?: string;
  values?: IPlanValue;
  confirmedData?: any;
  createdAt?: Date;
  createdBy?: string;
  modifiedAt?: Date;
  modifiedBy?: string;

  branch?: IBranch;
  department?: IDepartment;
  product?: IProduct;
  uom?: IUom;
}

export interface IDayPlanParams {
  date?: Date;
  departmentId?: string;
  branchId?: string;
  productCategory?: string;
  productId?: string;
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

export type DayPlansEditMutationResponse = {
  dayPlanEdit: (mutation: { variables: IDayPlan }) => Promise<any>;
};

export type DayPlansRemoveMutationResponse = {
  dayPlansRemove: (mutation: { variables: { _ids: string[] } }) => Promise<any>;
};
