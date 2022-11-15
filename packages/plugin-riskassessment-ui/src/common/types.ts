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
  resultScore?: number;
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
  type: string
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

export interface ICardRiskAssements {
  _id: string;
  cardId: string;
  riskAssessmentId: string;
  riskAssessment: RiskAssessmentsType;
}

export type ICardRiskConfirmitiesQueryResponse = {
  riskConfirmities: ICardRiskAssements[];
  loading: boolean;
  refetch: () => void;
};

export type IRiskSubmissionsQueryResponse = {
  riskConfirmitySubmissions: any[];
  loading: boolean;
  refetch: () => void;
};

export type ICardRiskAssessmentsQueryResponse = {
  riskAssessments: {
    list: ICardRiskAssements[];
    totalCount: number;
  };
  loading: boolean;
  refetch: (params: { searchValue: string; perPage: number }) => void;
};
export type ICardRiskAssessmentDetailQueryResponse = {
  riskConfirmityDetails: ICardRiskAssements[];
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
