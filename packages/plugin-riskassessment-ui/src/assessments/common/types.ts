import { QueryResponse } from '@erxes/ui/src/types';

export type RiskAssessmentQueryResponse = {
  riskAssessment: any;
} & QueryResponse;

export type RiskAssessmentAssignedMembersQueryResponse = {
  riskAssessmentAssignedMembers: any[];
} & QueryResponse;
