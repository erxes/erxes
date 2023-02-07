import { QueryResponse } from '@erxes/ui/src/types';

/**
 * Types of Risk Indicators
 */
export type RiskCalculateLogicType = {
  _id: string;
  name: string;
  value: number;
  value2?: number;
  logic: string;
  color?: string;
  __typename?: string;
};
export type CategoryTypes = {
  _id: string;
  name: string;
  formId: string;
  parentId: string;
  code?: string;
  order?: string;
  parent?: CategoryTypes;
  formName?: string;
  type: string;
};
export type RiskIndicatorsType = {
  _id: string;
  categoryId?: string;
  operationIds?: string[];
  branchIds?: string[];
  departmentIds?: string[];
  description?: string;
  name?: string;
  createdAt?: string;
  category?: CategoryTypes;
  calculateLogics?: [RiskCalculateLogicType];
  calculateMethod?: string;
  forms?: any[];
  customScoreField?: object;
};

/**
 * Queries Mutations Response types
 */

export type RiskIndicatortDetailQueryResponse = {
  riskIndicatorDetail: RiskIndicatorsType;
} & QueryResponse;

export type RiskIndicatorsListQueryResponse = {
  riskIndicators: RiskIndicatorsType[];
} & QueryResponse;
export type RiskIndicatorsTotalCountQueryResponse = {
  riskIndicatorsTotalCount: number;
} & QueryResponse;

export type RiskAssessmentsCategoriesQueryResponse = {
  riskAssesmentCategories: [CategoryTypes];
} & QueryResponse;
