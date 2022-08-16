export interface IRiskAssessmentField {
  name: string;
  description: string;
  createdAt: string;
  categoryId: string;
  status: string;
}

export interface IRiskAssessmentCategoryField {
  _id?: string;
  name: string;
  formId: string;
  parentId: string;
  code: string;
}

export interface IRiskAnswerField {
  name: string;
  value: number;
  categoryId: string;
}
export interface IRiskConfirmityField {
  _id: string;
  cardId: string;
  riskAssessmentId: string;
}
