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
