///////// year

import { IProduct, IUom } from '@erxes/ui-products/src/types';
import { IBranch, IDepartment } from '@erxes/ui/src/team/types';

export interface IPlanValue {
  [key: string]: number;
}

export interface IYearPlan {
  _id: string;
  year: number;
  departmentId: string;
  branchId: string;
  productId: string;
  uomId: string;
  values: any;
  confirmedData: any;
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;

  branch: IBranch;
  department: IDepartment;
  product: IProduct;
  uom: IUom;
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

export type YearPlansTotalCountQueryResponse = {
  yearPlansCount: number;
  loading: boolean;
  refetch: () => void;
};

export type YearPlansRemoveMutationResponse = {
  yearPlansRemove: (mutation: {
    variables: { _ids: string[] };
  }) => Promise<any>;
};

///////// day

export interface IDayPlan {
  _id?: string;
  title?: string;
  description?: string;
  effect?: string;
  color?: string;
  status?: string;
  multiplier?: number;
}

export type DayPlansQueryResponse = {
  dayPlans: IDayPlan[];
  loading: boolean;
  refetch: () => void;
};

export type DayPlansTotalCountQueryResponse = {
  dayPlansCount: number;
  loading: boolean;
  refetch: () => void;
};

export type DayPlansRemoveMutationResponse = {
  dayPlansRemove: (mutation: { variables: { _ids: string[] } }) => Promise<any>;
};
