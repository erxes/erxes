export interface PaginateField {
  perPage?: number;
  searchValue?: string;
  sortDirection?: number;
  sortFromDate?: string;
  sortToDate?: string;
}
type IRiskAssessmentCalculateLogicsField = {
  key: string;
  name: string;
  value: number;
  value2: number;
  logic: string;
};
export interface IRiskAssessmentField {
  name?: string;
  description?: string;
  createdAt?: string;
  categoryId?: string;
  status?: string;
  calculateMethod?: string;
  calculateLogics?: IRiskAssessmentCalculateLogicsField[];
}

export interface IRiskAssessmentCategoryField extends PaginateField {
  _id?: string;
  name: string;
  formId: string;
  parentId: string;
  code: string;
}

export interface IRiskConfirmityField {
  _id: string;
  cardId: string;
  cardType: string;
  riskAssessmentId: string;
}

export interface IRiskConfirmityParams {
  cardId: string;
  cardType: string;
  riskAssessmentId?: string;
}

export interface IRiskFormSubmissionParams {
  cardId: string;
  cardType: string;
  userId: string;
  formId: string;
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
