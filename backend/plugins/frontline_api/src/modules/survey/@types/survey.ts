import { HydratedDocument } from 'mongoose';

export interface ISurveyOption {
  _id: string;
  text: string;
  order: number;
  ticketCreationEnabled?: boolean;
  ticketCreationThreshold?: number;
  ticketPipelineId?: string;
  ticketStatusId?: string;
  ticketCreated?: boolean;
  ticketId?: string;
  ticketClaimedAt?: Date;
}

export interface ISurveyStep {
  _id: string;
  name?: string;
  description?: string;
  order: number;
  question: string;
  options: ISurveyOption[];
  allowMultiselect?: boolean;
}

export interface ISurvey {
  _id: string;
  title: string;
  question: string;
  steps: ISurveyStep[];
  channelId?: string;
  brandId?: string;
  code?: string;
  options: ISurveyOption[];
  allowMultiselect?: boolean;
  durationHours?: number;
  status: string;
  sentCount?: number;
  createdUserId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export type ISurveyDocument = HydratedDocument<ISurvey>;

export interface ISurveyVote {
  _id: string;
  surveyId: string;
  messageId: string;
  conversationId: string;
  voterId: string;
  cpUserId?: string;
  customerId?: string;
  visitorId?: string;
  optionIds: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export type ISurveyVoteDocument = HydratedDocument<ISurveyVote>;

export interface ISurveyCpUser {
  _id: string;
  erxesCustomerId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

export interface ISurveyAnswerSnapshot {
  id: string;
  text: string;
}

export interface ISurveyAnswerCount {
  id: string;
  count: number;
}

export interface ISurveySnapshotStep {
  stepId: string;
  name?: string;
  description?: string;
  question: string;
  answers: ISurveyAnswerSnapshot[];
  allowMultiselect: boolean;
}

export interface ISurveySnapshot {
  surveyId: string;
  question: string;
  answers: ISurveyAnswerSnapshot[];
  allowMultiselect: boolean;
  steps?: ISurveySnapshotStep[];
  expiry?: string;
  results: {
    isFinalized: boolean;
    answerCounts: ISurveyAnswerCount[];
  };
}
