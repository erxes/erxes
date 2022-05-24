import {
  IActivityLog,
  IActivityLogForMonth
} from '@erxes/ui-logs/src/activityLogs/types';
import { IUser } from '@erxes/ui/src/auth/types';
import { IAttachment } from '@erxes/ui/src/types';

export interface ICarCategoryDoc {
  _id?: string;
  name: string;
  description?: string;
  parentId?: string;
}

export interface ICarDoc {
  createdAt?: Date;
  modifiedAt?: Date;

  scopeBrandIds?: string[];
  ownerId?: string;
  mergedIds?: string[];
  status?: string;
  description?: string;

  plateNumber?: string;
  vinNumber?: string;
  colorCode?: string;
  categoryId?: string;

  bodyType?: string;
  fuelType?: string;
  gearBox?: string;

  vintageYear?: number;
  importYear?: number;

  attachment?: IAttachment;
}

export interface ICarCategory {
  _id: string;
  name: string;
  order: string;
  code: string;
  description?: string;
  parentId?: string;
  createdAt: Date;
  carCount: number;
  isRoot: boolean;
}

export type CarCategoriesQueryResponse = {
  carCategories: ICarCategory[];
  loading: boolean;
  refetch: () => void;
};

export type CarCategoriesCountQueryResponse = {
  carCategoriesTotalCount: number;
  loading: boolean;
  refetch: () => void;
};

export type CarCategoryRemoveMutationResponse = {
  carCategoryRemove: (mutation: { variables: { _id: string } }) => Promise<any>;
};

export type CategoryDetailQueryResponse = {
  carCategoryDetail: ICarCategory;
  loading: boolean;
};

export interface IActivityLogYearMonthDoc {
  year: number;
  month: number;
}

export interface ICarActivityLog {
  date: IActivityLogYearMonthDoc;
  list: IActivityLog[];
}

export interface ICar extends ICarDoc {
  _id: string;
  owner: IUser;
  category?: ICarCategory;
}

// mutation types

export type EditMutationResponse = {
  carsEdit: (params: { variables: ICar }) => Promise<any>;
};

export type RemoveMutationVariables = {
  carIds: string[];
};

export type RemoveMutationResponse = {
  carsRemove: (params: { variables: RemoveMutationVariables }) => Promise<any>;
};

export type MergeMutationVariables = {
  carIds: string[];
  carFields: any;
};

export type MergeMutationResponse = {
  carsMerge: (params: { variables: MergeMutationVariables }) => Promise<any>;
};

export type AddMutationResponse = {
  carsAdd: (params: { variables: ICarDoc }) => Promise<any>;
};

// query types

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  segment?: string;
  tag?: string;
  brand?: string;
  ids?: string[];
  searchValue?: string;
  sortField?: string;
  sortDirection?: number;
};

type ListConfig = {
  name: string;
  label: string;
  order: number;
};

export type MainQueryResponse = {
  carsMain: { list: ICar[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type CarsQueryResponse = {
  cars: ICar[];
  loading: boolean;
  refetch: () => void;
};

export type ListConfigQueryResponse = {
  fieldsDefaultColumnsConfig: ListConfig[];
  loading: boolean;
};

export type DetailQueryResponse = {
  carDetail: ICar;
  loading: boolean;
};

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};

type Count = {
  [key: string]: number;
};

type CarCounts = {
  bySegment: Count;
  byTag: Count;
  byBrand: Count;
  byLeadStatus: Count;
  byCategory: Count;
};

export type CountQueryResponse = {
  carCounts: CarCounts;
  loading: boolean;
  refetch: () => void;
};
