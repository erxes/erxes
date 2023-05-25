export interface PaginateField {
  perPage?: number;
  searchValue?: string;
  sortDirection?: number;
  sortFromDate?: string;
  sortToDate?: string;
}
type IRiskIndicatorCalculateLogicsField = {
  key: string;
  name: string;
  value: number;
  value2: number;
  logic: string;
};
export interface IRiskIndicatorsField {
  _id?: string;
  name?: string;
  description?: string;
  createdAt?: string;
  modifiedAt?: string;
  tagIDs?: string[];
  status?: string;
  calculateMethod?: string;
  calculateLogics?: IRiskIndicatorCalculateLogicsField[];
  branchIds?: string[];
  departmentIds?: string[];
  operationIds?: string[];
}

export interface IRiskConformityField {
  _id: string;
  cardId: string;
  boardId: string;
  pipelineId: string;
  cardType: string;
  indicatorIds: string[];
  groupId: string;
}

export interface IRiskConformityParams {
  cardId: string;
  cardType: string;
  indicatorId?: string;
  groupId?: string;
}

export interface IRiskFormSubmissionParams {
  riskAssessmentId?: string;
  branchId?: string;
  departmentId?: string;
  operationId?: string;
  cardId: string;
  cardType: string;
  userId: string;
  indicatorId: string;
  formSubmissions: {
    [key: string]: { value: number; description: string };
  };
}

export type IRiskFormSubmissionsField = {
  _id: string;
  cardId: string;
  userId: string;
  formId: string;
  fieldId: string;
  value: number;
};
