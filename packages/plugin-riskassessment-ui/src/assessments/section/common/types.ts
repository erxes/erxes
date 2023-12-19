import { QueryResponse } from '@erxes/ui/src/types';

type RiskAssessmentGroups = {
  assessmentId: string;
  groupId: string;
  assignedUserIds: string[];
  createdAt: string;
  status: string;
  statusColor: string;
  resultScore: number;
};

export type GroupsQueryResponse = {
  riskAssessmentGroups: RiskAssessmentGroups[];
} & QueryResponse;

export type AssessmentFilters = {
  cardId: string;
  cardType: string;
  userId: string;
  riskAssessmentId: string;
  indicatorId?: string;
  branchId?: string;
  departmentId?: string;
  operationId?: string;
};
