import { ITag } from '@erxes/ui-tags/src/types';
import { IUser } from '@erxes/ui/src/auth/types';

export interface IReport {
  _id: string;
  name?: string;
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
  private = 'private'
}

export interface IReportTemplate {
  title: string;
  description: string;
  charts: string[];
  img: string;
  serviceName: string;
}
export interface IChart {
  _id: string;
  name?: string;
  contentType?: string;
  template?: string;
  order?: number;
  chartType: string;
  defaultFilter?: any;

  serviceName?: string;
  templateType?: string;
  filter?: any;

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

// queries
export type ReportsListQueryResponse = {
  reportsList: {
    list: IReport[];
    totalCount: number;
  };
  refetch: () => void;
  loading: boolean;
};

export type ReportsMutationResponse = {
  reportsRemoveManyMutation: (params: {
    variables: { ids: string[] };
  }) => Promise<any>;

  reportsEditMutation: (params: {
    variables: MutationVariables;
  }) => Promise<any>;

  reportChartsEditMutation: (params: { variables: any }) => Promise<any>;

  reportChartsRemoveMutation: (params: {
    variables: { _id: string };
  }) => Promise<any>;
};

export type ReportDetailQueryResponse = {
  reportDetail: IReport;
  refetch: () => void;
  loading: boolean;
};

export type ReportChartGetResultQueryResponse = {
  reportChartGetResult: any;
  refetch: () => void;
  loading: boolean;
};

export type ReportTemplatesListQueryResponse = {
  reportTemplatesList: ReportTemplate[];
  refetch: () => void;
  loading: boolean;
};

export type ReportChartTemplatesListQueryResponse = {
  reportChartTemplatesList: any[];
  refetch: () => void;
  loading: boolean;
};

export type reportServicesListQueryResponse = {
  reportServicesList: string[];
  refetch: () => void;
  loading: boolean;
};

export type ReportChartFormMutationResponse = {
  reportChartsAddMutation: (params: {
    variables: ReportChartFormMutationVariables;
  }) => Promise<any>;
  reportChartsEditMutation: (params: {
    variables: ReportChartFormMutationVariables;
  }) => Promise<any>;
  reportChartsRemoveMutation: (_id: string) => Promise<void>;
};

export type ReportFormMutationResponse = {
  reportsAddMutation: (params: {
    variables: ReportFormMutationVariables;
  }) => Promise<any>;
};

type ReportTemplate = {
  title: string;
  description: string;
  charts: string[];
  img: string;
  serviceName: string;
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
  visibility: ReportVisibility;
  assignedUserIds: string[];
  assignedDepartmentIds: string[];
  reportTemplateType: string;
  serviceName?: string;
  charts?: string[];
};

export type ReportChartFormMutationVariables = {
  _id?: string;
  name: string;
  reportId: string;
  chartType: string;
  filters: any[];
  order: string;
};

export type MutationVariables = {
  _id?: string;
  name: string;
  createdAt?: Date;
  expiryDate?: Date;
  checked?: boolean;
  type?: string;
};
export type AddMutationResponse = {
  addMutation: (params: { variables: MutationVariables }) => Promise<any>;
};

export type EditMutationResponse = {
  editMutation: (params: { variables: MutationVariables }) => Promise<any>;
};

export type RemoveMutationResponse = {
  removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
};

export type EditTypeMutationResponse = {
  typesEdit: (params: { variables: MutationVariables }) => Promise<any>;
};

export type RemoveTypeMutationResponse = {
  typesRemove: (params: { variables: { _id: string } }) => Promise<any>;
};
