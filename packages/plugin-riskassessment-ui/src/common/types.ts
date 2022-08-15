type RiskAssesmentsListType = {
  _id: string;
  categoryId?: string;
  description?: string;
  name?: string;
  status?: string;
};

export type RiskAssesmentsListQueryResponse = {
  loading: boolean;
  refetch: () => void;
  riskAssesments: {
    list: RiskAssesmentsListType[];
    totalCount: number;
  };
};

export type RiskAssessmentCategory = {
  _id: string;
  name: string;
  formId: string;
  parentName: string;
};

export type RiskAssesmentsCategoriesListQueryResponse = {
  loading: boolean;
  refetch: () => void;
  getRiskAssesmentCategory: [RiskAssessmentCategory];
};

export interface ICommonListProps {
  objects: any;
  history: any;
  remove: (_ids: string[]) => void;
  save: () => void;
  refetch: () => void;
  totalCount: number;
  loading: boolean;
}

export type CustomFormGroupProps = {
  children?: React.ReactChild;
  label: string;
  required?: boolean;
  row?: boolean;
  spaceBetween?: boolean;
};
