export type commonRefetchType = {
  searchValue?: string;
  perPage?: number;
  sortDirection?: number;
  sortFromDate?: string;
  sortToDate?: string;
};

export type RiskAssesmentsType = {
  _id: string;
  categoryId?: string;
  description?: string;
  name?: string;
  status?: string;
  createdAt?: string;
  category?: RiskAssessmentCategory
};

export type RiskAssessmentDetailQueryResponse = {
  loading: boolean;
  refetch: () => void;
  riskAssessmentDetail: RiskAssesmentsType;
};

export type RiskAssesmentsListQueryResponse = {
  loading: boolean;
  refetch: () => void;
  riskAssesments: {
    list: RiskAssesmentsType[];
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

export type RiskAssesmentsCategoriesQueryResponse = {
  loading: boolean;
  refetch: () => void;
  getRiskAssesmentCategories: [RiskAssessmentCategory];
};

export type AddRiskAssesmentCategoryMutationResponse = ({
  variables: RiskAssessmentCategory,
}) => Promise<any>;

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
}

export type IDealRiskConfirmitiesQueryResponse = {
  riskConfirmities: IDealRiskAssements[];
  loading: boolean;
  refetch: () => void;
};

export type IDealRiskAssessmentsQueryResponse = {
  riskAssesments: {
    list: IDealRiskAssements[];
    totalCount: number;
  };
  loading: boolean;
  refetch: (params:{searchValue: string,perPage: number}) => void;
};
export type IDealRiskAssessmentDetailQueryResponse = {
  riskConfirmityDetails: IDealRiskAssements[];
  loading: boolean;
  refetch: () => void;
};