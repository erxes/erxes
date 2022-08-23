import { IUser } from '@erxes/ui/src/auth/types';
import { MutationVariables, Counts } from '@erxes/ui/src/types';

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  ids?: string[];
  searchValue?: string;
  sortField?: string;
  sortDirection?: number;
};

export interface IDashboard {
  _id: string;
  name: string;
  visibility: string;
  selectedMemberIds?: string[];
  description?: string;
  parentId?: string;
  order?: string;
  updatedAt?: Date;
  createdAt?: Date;
  updatedBy?: string;
  createdBy?: string;
  updatedUser?: IUser;
  createdUser?: IUser;
  itemsCount?: number;
  members?: IUser[];
}

export interface IDashboardDoc {
  name: string;
  visibility: string;
  selectedMemberIds?: string[];
  updatedAt?: Date;
  createdAt?: Date;
  updatedBy?: string;
  createdBy?: string;
  updatedUser?: IUser;
  createdUser?: IUser;
}

export type AddDashboardMutationResponse = {
  addDashboardMutation: (params: { variables: IDashboardDoc }) => Promise<any>;
};

export type EditDashboardMutationResponse = {
  editDashboardMutation: (params: { variables: IDashboard }) => Promise<any>;
};

export type DashboardsQueryResponse = {
  dashboards: IDashboard[];
  loading: boolean;
  refetch: () => void;
};

export type DashboardsMainQueryResponse = {
  dashboardsMain: { list: IDashboard[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export interface IDashboardItem {
  _id: string;
  dashboardId: string;
  layout: any;
  vizState: any;
  name: string;
}

export type DashboardItemsQueryResponse = {
  dashboardItems: IDashboardItem[];
  loading: boolean;
  refetch: () => void;
};

export type DashboardGetTypesQueryResponse = {
  dashboardGetTypes: string[];
  loading: boolean;
  refetch: () => void;
};

export type DashboardItemDetailsQueryResponse = {
  dashboardItem: IDashboardItem;
  loading: boolean;
};

export type DashboardsTotalCountQueryResponse = {
  dashboardsTotalCount: number;
  loading: boolean;
};

export type DashboardsCount = {
  total: number;
  byStatus: Counts;
};

export type DashboardDetailsQueryResponse = {
  dashboardDetails: IDashboard;
  loading: boolean;
};

export type EditDashboardItemMutationVariables = {
  _id: string;
  layout: string;
  vizState?: string;
  name?: string;
  dashboardId?: string;
};

export type AddDashboardItemMutationVariables = {
  layout: string;
  vizState: string;
  name: string;
  dashboardId: string;
};

export type AddDashboardItemMutationResponse = {
  addDashboardItemMutation: (params: {
    variables: AddDashboardItemMutationVariables;
  }) => Promise<void>;
};

export type EditDashboardItemMutationResponse = {
  editDashboardItemMutation: (params: {
    variables: EditDashboardItemMutationVariables;
  }) => Promise<void>;
};

export type RemoveMutationVariables = {
  dashboardIds: string[];
};

export type RemoveMutationResponse = {
  dashboardsRemove: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

export type RemoveDashboardItemMutationResponse = {
  removeDashboardItemMutation: (params: {
    variables: RemoveDashboardItemMutationVariables;
  }) => Promise<void>;
};

export type RemoveDashboardItemMutationVariables = {
  _id: string;
};
