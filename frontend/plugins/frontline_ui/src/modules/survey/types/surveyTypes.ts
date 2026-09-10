export interface ISurveyOption {
  _id: string;
  text: string;
  order?: number;
  ticketCreationEnabled?: boolean;
  ticketCreationThreshold?: number;
  ticketPipelineId?: string;
  ticketStatusId?: string;
  ticketCreated?: boolean;
  ticketId?: string;
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

export interface ISurveyOptionResult {
  _id: string;
  text: string;
  count: number;
  percent: number;
}

export interface ISurveyStepResult {
  _id: string;
  name?: string;
  question: string;
  totalVotes: number;
  options: ISurveyOptionResult[];
}

export interface ISurveyResults {
  totalVotes: number;
  voterCount: number;
  options: ISurveyOptionResult[];
  steps?: ISurveyStepResult[];
}

export interface ISurveyCreatedUser {
  _id: string;
  details?: {
    fullName?: string;
    avatar?: string;
  };
}

export interface ISurvey {
  _id: string;
  title: string;
  question: string;
  channelId?: string;
  brandId?: string;
  code?: string;
  options: ISurveyOption[];
  steps?: ISurveyStep[];
  allowMultiselect?: boolean;
  durationHours?: number | null;
  status: string;
  sentCount?: number;
  createdAt?: string;
  createdUserId?: string;
  createdUser?: ISurveyCreatedUser;
  results?: ISurveyResults;
}

export enum SurveysPageHotKeyScope {
  SurveysPage = 'surveys-page',
}

export const SURVEY_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;

export const MAX_SURVEY_OPTIONS = 10;

export const MAX_SURVEY_STEPS = 10;

export const SURVEY_DURATIONS: { label: string; value: number | null }[] = [
  { label: 'No end date', value: null },
  { label: '1 hour', value: 1 },
  { label: '4 hours', value: 4 },
  { label: '8 hours', value: 8 },
  { label: '1 day', value: 24 },
  { label: '3 days', value: 72 },
  { label: '7 days', value: 168 },
];
