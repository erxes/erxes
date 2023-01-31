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
  categoryId?: string;
  status?: string;
  calculateMethod?: string;
  calculateLogics?: IRiskIndicatorCalculateLogicsField[];
  branchIds?: string[];
  departmentIds?: string[];
  operationIds?: string[];
}

export interface IRiskAssessmentCategoryField extends PaginateField {
  _id?: string;
  name: string;
  formId: string;
  parentId: string;
  code: string;
  type: string;
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
  cardId: string;
  cardType: string;
  userId: string;
  indicatorId: string;
  customScore: number;
  formSubmissions: {
    [key: string]: string;
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
