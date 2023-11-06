export interface IReport {
  _id: string;
  name?: string;
  createdAt?: Date;
  expiryDate?: Date;
  totalObjectCount?: number;
  checked?: boolean;
  typeId?: string;
  currentType?: IType;
  charts?: IChart[];
  visibility?: ReportVisibility;
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
  chartType?: string;
  filters?: any[];
  defaultFilter?: any;

  layout?: any;
}
export interface IType {
  _id: string;
  name: string;
}

// queries
export type ReportsListQueryResponse = {
  list: IReport[];
  totalCount: number;
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

// mutations
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
