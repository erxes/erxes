import { QueryResponse } from '@erxes/ui/src/types';
import { RiskIndicatorsType } from '../../indicator/common/types';

interface RiskAssessmentIndicatorType {
  _id: string;
  status: string;
  statusColor: string;
  resultScore: number;
  detail: RiskIndicatorsType;
}
export interface IConformityDetail {
  _id: string;
  cardType: string;
  cardId: string;
  riskIndicatorIds: string;
  riskIndicators: RiskAssessmentIndicatorType[];
  riskAssessment?: any;
  riskAssessmentId: string;
  operationIds: string[];
  branchIds: string[];
  departmentIds: string[];
}

export type ICardRiskConformitiesQueryResponse = {
  riskConformity: IConformityDetail;
} & QueryResponse;

export type ICardRiskAssessmentsQueryResponse = {
  riskIndicators: IConformityDetail[];
  loading: boolean;
  refetch: (params: { searchValue: string; perPage: number }) => void;
};
export type ICardRiskAssessmentDetailQueryResponse = {
  riskConformityDetail: IConformityDetail;
} & QueryResponse;
export type IRiskSubmissionsQueryResponse = {
  riskConformitySubmissions: any[];
} & QueryResponse;
