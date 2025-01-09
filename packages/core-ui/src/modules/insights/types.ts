import { ITag } from '@erxes/ui-tags/src/types';
import { IUser } from '@erxes/ui/src/auth/types';

// Goal

export interface ISpecificPeriodGoal {
  progress: string;
  _id: string;
  current: string;
  addMonthly: string;
  addTarget: number;
}

export interface IGoalTypeDoc {
  createdAt?: Date;
  entity: string;
  stageId: any;
  stageName: string;
  pipelineId: any;
  boardId: any;
  contributionType: string;
  metric: string;
  goalTypeChoose: string;
  contribution: [string];
  department: string[];
  unit: string[];
  branch: string[];
  specificPeriodGoals: ISpecificPeriodGoal[];
  progress: {
    current: string;
    progress: string;
    amountData: string;
    target: number;
    _id: string;
  };
  chooseStage: string;
  startDate: Date;
  endDate: Date;
  target: number;
  segmentIds: string[];
  stageRadio: boolean;
  segmentRadio: boolean;
  periodGoal: string;
  teamGoalType: string;
  segmentCount: number;
  sectionId?: string;
}

export interface IGoalType extends IGoalTypeDoc {
  length: number;
  _id: string;
  map(arg0: (item: any, index: any) => void): import('react').ReactNode;
  forEach(arg0: (goal: any) => void): unknown;
}

// mutation types

export type EditMutationResponse = {
  goalTypesEdit: (params: { variables: IGoalType }) => Promise<any>;
};

export type RemoveMutationVariables = {
  goalTypeIds: string[];
};

export type RemoveMutationResponse = {
  goalTypesRemove: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

export type MergeMutationVariables = {
  goalTypeIds: string[];
  goalTypeFields: any;
};

export type MergeMutationResponse = {
  goalTypesMerge: (params: {
    variables: MergeMutationVariables;
  }) => Promise<any>;
};

export type AddMutationResponse = {
  goalTypesAdd: (params: { variables: IGoalTypeDoc }) => Promise<any>;
};

// query types

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  ids?: string[];
  searchValue?: string;
  sortField?: string;
  sortDirection?: number;
};

export type MainQueryResponse = {
  goalTypesMain: { list: IGoalType[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type GoalTypesQueryResponse = {
  goalTypes: IGoalType[];
  loading: boolean;
  refetch: () => void;
};

export type DetailQueryResponse = {
  goalTypeDetail: IGoalType;
  loading: boolean;
};

// Report

export interface IReport {
  _id: string;
  name?: string;
  sectionId?: string;

  createdAt?: Date;
  createdBy?: IUser;
  updatedAt?: Date;
  updatedBy?: IUser;
  expiryDate?: Date;
  totalObjectCount?: number;
  checked?: boolean;
  typeId?: string;
  currentType?: IType;
  charts?: IChart[];
  chartsCount?: number;

  serviceName?: string;
  serviceType?: string;

  assignedUserIds?: string[];
  assignedDepartmentIds?: string[];

  tags?: ITag[];
  members?: IUser[];
  visibility?: ReportVisibility;
}

export interface IReportItem {
  _id: string;
  name?: string;
  contentType?: string;
  template?: string;
  order?: number;
  chartType: string;
  filters?: any[];
  defaultFilter?: any;

  data?: number[];
  layout?: any;
  vizState?: any;
}

enum ReportVisibility {
  public = 'public',
  private = 'private',
}

export interface IReportTemplate {
  title: string;
  description: string;
  charts: string[];
  img: string;
  serviceName: string;
  serviceType: string;
}

// queries
export type ReportsListQueryResponse = {
  reportList: {
    list: IReport[];
    totalCount: number;
  };
  refetch: () => void;
  loading: boolean;
};

export type ReportDetailQueryResponse = {
  reportDetail: IReport;
  refetch: () => void;
  loading: boolean;
};

export type InsightTemplatesListQueryResponse = {
  insightTemplatesList: InsightTemplate[];
  refetch: () => void;
  loading: boolean;
};

export type InsightServicesListQueryResponse = {
  insightServicesList: string[];
  refetch: () => void;
  loading: boolean;
};

export type ReportFormMutationResponse = {
  reportAddMutation: (params: {
    variables: ReportFormMutationVariables;
  }) => Promise<any>;
};

type InsightTemplate = {
  title: string;
  description: string;
  charts: string[];
  img: string;
  serviceName: string;
  serviceType: string;
};

export type TypeQueryResponse = {
  reportsTypes: IType[];
  refetch: () => void;
  loading: boolean;
};

export type CountByTagsQueryResponse = {
  reportsCountByTags: { [key: string]: number };
  loading: boolean;
};

// mutations

export type ReportFormMutationVariables = {
  name: string;
  sectionId: string;
  visibility: ReportVisibility;
  assignedUserIds: string[];
  assignedDepartmentIds: string[];
  reportTemplateType: string;
  serviceName?: string;
  charts?: string[];
};

export type ReportMutationVariables = {
  _id?: string;
  name: string;
  createdAt?: Date;
  expiryDate?: Date;
  checked?: boolean;
  type?: string;
};

export type ReportMutationResponse = {
  reporzRemoveManyMutation: (params: {
    variables: { ids: string[] };
  }) => Promise<any>;

  reportEditMutation: (params: {
    variables: ReportMutationVariables;
  }) => Promise<any>;
};

export type ReportAddMutationResponse = {
  addMutation: (params: { variables: ReportMutationVariables }) => Promise<any>;
};

export type ReportEditMutationResponse = {
  editMutation: (params: {
    variables: ReportMutationVariables;
  }) => Promise<any>;
};

export type ReportRemoveMutationResponse = {
  removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
};

export type EditTypeMutationResponse = {
  typesEdit: (params: { variables: ReportMutationVariables }) => Promise<any>;
};

export type RemoveTypeMutationResponse = {
  typesRemove: (params: { variables: { _id: string } }) => Promise<any>;
};

// Charts

export interface IChart {
  _id: string;
  name?: string;
  contentId: string;
  contentType?: string;
  template?: string;
  order?: number;
  chartType: string;
  defaultFilter?: any;

  serviceName?: string;
  templateType?: string;
  filter?: any;
  dimension?: any;

  data?: number[];
  layout?: any;
  vizState?: any;
}

export interface IChartGetResultVariables {
  serviceName?: string;
  templateType?: string;
  filter?: any;
}
export interface IType {
  _id: string;
  name: string;
}

export interface IFieldLogic {
  logicFieldName: string;
  logicFieldValue: any;
  logicFieldVariable?: string;
  logicFieldExtraVariable?: string;
  logicFieldOperator?: string;
}

//queries

export type ChartGetResultQueryResponse = {
  chartGetResult: any;
  refetch: () => void;
  loading: boolean;
};

export type InsightChartTemplatesListQueryResponse = {
  insightChartTemplatesList: any[];
  refetch: () => void;
  loading: boolean;
};

// mutations

export type ChartFormMutationVariables = {
  _id?: string;
  name: string;
  contentId: string;
  chartType: string;
  filters: any[];
  order: string;
};

export type ChartFormMutationResponse = {
  chartsAddMutation: (params: {
    variables: ChartFormMutationVariables;
  }) => Promise<any>;
  chartsEditMutation: (params: {
    variables: ChartFormMutationVariables;
  }) => Promise<any>;
  chartsRemoveMutation: (_id: string) => Promise<void>;
};

// Dashboard

export interface IDashboard {
  _id: string;
  name?: string;
  sectionId?: string;
  createdAt?: Date;
  createdBy?: IUser;
  updatedAt?: Date;
  updatedBy?: IUser;
  expiryDate?: Date;
  totalObjectCount?: number;
  checked?: boolean;
  typeId?: string;
  currentType?: IType;
  charts?: IChart[];
  chartsCount?: number;

  serviceNames?: string[];
  serviceTypes?: string[];

  assignedUserIds?: string[];
  assignedDepartmentIds?: string[];

  members?: IUser[];
  visibility?: DashboardVisibility;
}

export interface IDashboardItem {
  _id: string;
  name?: string;
  contentType?: string;
  template?: string;
  order?: number;
  chartType: string;
  filters?: any[];
  defaultFilter?: any;

  data?: number[];
  layout?: any;
  vizState?: any;
}

enum DashboardVisibility {
  public = 'public',
  private = 'private',
}

// queries

export type DashboardsListQueryResponse = {
  dashboardList: {
    list: IDashboard[];
    totalCount: number;
  };
  refetch: () => void;
  loading: boolean;
};
export type DashboardDetailQueryResponse = {
  dashboardDetail: IDashboard;
  refetch: () => void;
  loading: boolean;
};

// mutations

export type DashboardFormMutationVariables = {
  name: string;
  sectionId: string;
  visibility: DashboardVisibility;
  assignedUserIds: string[];
  assignedDepartmentIds: string[];
  serviceNames?: string[];
  serviceTypes?: string[];
  charts?: string[];
};

export type DashboardMutationVariables = {
  _id?: string;
};

export type DashboardAddMutationResponse = {
  dashboardAddTo: (params: {
    variables: DashboardMutationVariables;
  }) => Promise<any>;
};

export type DashboardEditMutationResponse = {
  editMutation: (params: {
    variables: DashboardMutationVariables;
  }) => Promise<any>;
};

export type DashboardRemoveMutationResponse = {
  removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
};

// Sections

export interface ISection {
  _id: string;
  name?: string;
  type: string;
  list: IDashboard[] | IReport[] | IGoalType[];
  listCount: number;
}

// queries

export type SectionsListQueryResponse = {
  sections: ISection[];

  refetch: () => void;
  loading: boolean;
};

export type SectionMutationVariables = {
  _id?: string;
  name: string;
  type?: string;
};

export type SectionFormMutationVariables = {
  name: string;
  type: string;
};

export type SectionAddMutationResponse = {
  addMutation: (params: {
    variables: SectionMutationVariables;
  }) => Promise<any>;
};

export type SectionRemoveMutationResponse = {
  removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
};
