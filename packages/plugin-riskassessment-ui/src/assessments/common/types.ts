import { IUser } from '@erxes/ui/src/auth/types';
import { IField, QueryResponse } from '@erxes/ui/src/types';
import { IFormSubmissions } from '../../common/types';
import { RiskIndicatorsType } from '../../indicator/common/types';
import { IIndicatorsGroups } from '../../indicator/groups/common/types';

export type RiskAssessmentTypes = {
  _id: string;
  name: string;
  cardId: string;
  cardType: String;
  card: {
    _id: string;
    name: string;
  };
  indicatorId: string;
  indicator: RiskIndicatorsType;
  groupId: string;
  group: IIndicatorsGroups;
  branchId: string;
  branch: {
    _id: string;
    title: string;
  };
  departmentId: string;
  department: {
    _id: string;
    title: string;
  };
  operationId: string;
  operation: {
    _id: string;
    name: string;
  };
  status: string;
  statusColor: string;
  resultScore: string;
  totalScore: string;
  createdAt: string;
  closedAt: string;
};

export type IndicatorSubmissions = {
  _id: string;
  user: IUser;
  fields: IFormSubmissions[];
};

export type IndicatorAssessmentHistory = {
  _id: string;
  assessmentId: string;
  closedAt: string;
  createdAt: string;
  indicatorId: string;
  indicator: { _id: string; name: string };
  resultScore: string;
  status: string;
  statusColor: string;
  submissions: IndicatorSubmissions[];
};

export type RiskAssessmentAssignedMembers = {
  _id: string;
  submitStatus: string;
} & IUser;

export type RiskAssessmentQueryResponse = {
  riskAssessment: RiskAssessmentTypes[];
} & QueryResponse;

export type RiskAssessmentAssignedMembersQueryResponse = {
  riskAssessmentAssignedMembers: RiskAssessmentAssignedMembers[];
} & QueryResponse;

export interface RiskIndicatorsSubmitType extends RiskIndicatorsType {
  _id: string;
  submitted: boolean;
}

export type RiskAssessmentSubmitFormQueryResponse = {
  riskAssessmentSubmitForm: RiskIndicatorsSubmitType[];
} & QueryResponse;

type IndicatorFormType = {
  fields: IField[];
  withDescription: boolean;
  submittedFields: any[];
};

export type RiskAssessmentIndicatorFormQueryResponse = {
  riskAssessmentIndicatorForm: IndicatorFormType;
} & QueryResponse;
export type IndicatorAssessmentsQueryResponse = {
  indicatorsAssessmentHistory: IndicatorAssessmentHistory[];
} & QueryResponse;
