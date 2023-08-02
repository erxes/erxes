import { IUser } from '@erxes/ui/src/auth/types';
import { QueryResponse } from '@erxes/ui/src/types';

type StructureDetail = {
  _id: string;
  title: string;
  order: string;
  code: string;
};

export type Config = {
  cardType: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
};

export type IPLan = {
  _id: string;
  name: string;
  structureType: string;
  structureTypeId: string;
  status: string;
  tagId: string;
  createdAt: string;
  modifiedAt: string;
  closeDate: string;
  startDate: string;
  createDate: string;
  configs: Config;
  plannerId: string;
  planner: IUser;
  structureDetail: StructureDetail;
};

export type ISchedule = {
  _id: string;
  name: string;
  planId: string;
  structureTypeId: string;
  assignedUserIds: string[];
  status: string;
  customFieldsData: any;
  createdAt: string;

  assignedUsers: IUser[];
};

export type ScheduleQueryResponse = {
  riskAssessmentSchedules: ISchedule[];
} & QueryResponse;

export type PlanQueryResponse = {
  riskAssessmentPlan: IPLan[];
} & QueryResponse;
