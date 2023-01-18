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

export type RiskIndicatorsType = {
  _id: string;
  categoryIds: string[];
  branchIds?: string[];
  departmentIds?: string[];
  description: string;
  name: string;
  createdAt?: string;
  category?: RiskAssessmentCategory;
  calculateLogics: [RiskCalculateLogicType];
  calculateMethod: string;
  forms: any[];
  customScoreField?: object;
};

export type RiskIndicatortDetailQueryResponse = {
  riskIndicatorDetail: RiskIndicatorsType;
  loading: boolean;
  refetch: () => void;
};

export type RiskIndicatorsListQueryResponse = {
  loading: boolean;
  refetch: () => void;
  riskIndicators: RiskIndicatorsType[];
};
export type RiskIndicatorsTotalCountQueryResponse = {
  loading: boolean;
  refetch: () => void;
  riskIndicatorsTotalCount: number;
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
  type: string;
};

export type OperationTypes = {
  _id: string;
  name: string;
  parentId: string;
  code?: string;
  order: string;
  parent?: RiskAssessmentCategory;
  createdAt?: string;
  modifiedAt?: string;
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
  loading: boolean;
}

export type CustomFormGroupProps = {
  children?: React.ReactChild;
  label: string;
  required?: boolean;
  row?: boolean;
  spaceBetween?: boolean;
};

interface RiskAssessmentIndicatorType {
  _id: string;
  status: string;
  statusColor: string;
  resultScore: number;
  detail: RiskIndicatorsType;
}

export interface ICardRiskAssements {
  _id: string;
  cardType: string;
  cardId: string;
  riskIndicatorIds: string;
  riskIndicators: RiskAssessmentIndicatorType[];
}

export type ICardRiskConformitiesQueryResponse = {
  riskConformity: ICardRiskAssements;
  loading: boolean;
  refetch: () => void;
};

export type IRiskSubmissionsQueryResponse = {
  riskConformitySubmissions: any[];
  loading: boolean;
  refetch: () => void;
};

export type ICardRiskAssessmentsQueryResponse = {
  riskIndicators: ICardRiskAssements[];
  loading: boolean;
  refetch: (params: { searchValue: string; perPage: number }) => void;
};
export type ICardRiskAssessmentDetailQueryResponse = {
  riskConformityDetail: ICardRiskAssements;
  loading: boolean;
  refetch: () => void;
};

type IFormDetailType = {
  forms: any[];
  submissions: {
    [key: string]: string;
  };
  formId: string;
};
export type IRiskFormDetailQueryResponse = {
  riskConformityFormDetail: IFormDetailType;
  loading: boolean;
  refetch: () => void;
};
