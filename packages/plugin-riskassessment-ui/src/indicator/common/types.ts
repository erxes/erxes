import { ITag } from '@erxes/ui-tags/src/types';
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
export type RiskIndicatorsType = {
  _id: string;
  operationIds?: string[];
  branchIds?: string[];
  departmentIds?: string[];
  description?: string;
  name?: string;
  createdAt?: string;
  calculateLogics?: [RiskCalculateLogicType];
  calculateMethod?: string;
  forms?: any[];
  tagIds: string[];
  tags: ITag[];
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
