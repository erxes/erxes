import { IUser } from '@erxes/ui/src/auth/types';
import { IField, QueryResponse } from '@erxes/ui/src/types';
import { RiskIndicatorsType } from '../../indicator/common/types';

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
  groupId: string;
  branchIds: string[];
  departmentId: string[];
  operationIds: string[];
  status: string;
  statusColor: string;
  resultScore: string;
  totalScore: string;
  createdAt: string;
  closedAt: string;
};

type RiskAssessmentAssignedMembers = {
  submitStatus: string;
} & IUser;

export type RiskAssessmentQueryResponse = {
  riskAssessment: RiskAssessmentTypes;
} & QueryResponse;

export type RiskAssessmentAssignedMembersQueryResponse = {
  riskAssessmentAssignedMembers: RiskAssessmentAssignedMembers[];
} & QueryResponse;

export type RiskAssessmentSubmitFormQueryResponse = {
  riskAssessmentSubmitForm: RiskIndicatorsType[];
} & QueryResponse;

type IndicatorFormType = {
  fields: IField[];
  customScoreField: { label: string; percentWeight: number };
  submittedFields: any[];
};

export type RiskAssessmentIndicatorFormQueryResponse = {
  riskAssessmentIndicatorForm: IndicatorFormType;
} & QueryResponse;
