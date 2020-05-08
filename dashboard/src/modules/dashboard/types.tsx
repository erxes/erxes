export interface IDashboard {
  _id: string;
  name: string;
}

export type DashboardsQueryResponse = {
  dashboards: IDashboard[];
  loading: boolean;
  refetch: () => void;
};

export interface IDashboardItem {
  _id: string;
  dashboardId: string;
  layout: string;
  vizState: string;
  name: string;
  type: string;
}

export type DashboardItemsQueryResponse = {
  dashboardItems: IDashboardItem[];
  loading: boolean;
  refetch: () => void;
};

export type DashboardItemDetailsQueryResponse = {
  dashboardItemDetail: IDashboardItem;
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

export type RemoveDashboardItemMutationVariables = {
  _id: string;
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

export type RemoveDashboardItemMutationResponse = {
  removeDashboardItemMutation: (params: {
    variables: RemoveDashboardItemMutationVariables;
  }) => Promise<void>;
};
