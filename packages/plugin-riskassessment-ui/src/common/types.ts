export type commonRefetchType = {
  searchValue?: string;
  perPage?: number;
  sortDirection?: number;
  sortFromDate?: string;
  sortToDate?: string;
};

export type RiskCalculateLogicType = {
  _id: string;
  name: string;
  value: number;
  value2?: number;
  logic: string;
  color?: string;
  __typename?: string;
};

export type RiskAssessmentsType = {
  _id: string;
  categoryId: string;
  description: string;
  name: string;
  status: string;
  statusColor: string;
  createdAt?: string;
  category?: RiskAssessmentCategory;
  calculateMethod: string;
  calculateLogics: RiskCalculateLogicType[];
};

export type RiskAssessmentDetailQueryResponse = {
  riskAssessmentDetail: RiskAssessmentsType;
  loading: boolean;
  refetch: () => void;
};

export type RiskAssessmentsListQueryResponse = {
  loading: boolean;
  refetch: () => void;
  riskAssessments: {
    list: RiskAssessmentsType[];
    totalCount: number;
  };
};

export type RiskAssessmentCategory = {
  _id: string;
  name: string;
  formId: string;
  parentId: string;
  code?: string;
  order?: string;
  parent?: RiskAssessmentCategory;
  formName?: string;
};

export type RiskAssessmentsCategoriesQueryResponse = {
  loading: boolean;
  refetch: () => void;
  riskAssesmentCategories: [RiskAssessmentCategory];
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

export interface IDealRiskAssements {
  _id: string;
  cardId: string;
  riskAssessmentId: string;
  name?: string;
  statusColor?: string;
}

export type IDealRiskConfirmitiesQueryResponse = {
  riskConfirmities: IDealRiskAssements[];
  loading: boolean;
  refetch: () => void;
};

export type IRiskSubmissionsQueryResponse = {
  riskConfirmitySubmissions: any[];
  loading: boolean;
  refetch: () => void;
};

export type IDealRiskAssessmentsQueryResponse = {
  riskAssessments: {
    list: IDealRiskAssements[];
    totalCount: number;
  };
  loading: boolean;
  refetch: (params: { searchValue: string; perPage: number }) => void;
};
export type IDealRiskAssessmentDetailQueryResponse = {
  riskConfirmityDetails: IDealRiskAssements[];
  loading: boolean;
  refetch: () => void;
};

type IFormDetailType = {
  fields: any[];
  submissions: {
    [key: string]: string;
  };
  formId: string;
};
export type IRiskFormDetailQueryResponse = {
  riskConfirmityFormDetail: IFormDetailType;
  loading: boolean;
  refetch: () => void;
};
