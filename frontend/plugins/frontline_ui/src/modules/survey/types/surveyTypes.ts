import type {
  SurveyDetailQuery,
  SurveyFieldsFragment,
  SurveyResultsListQuery,
} from '~/gql/graphql';

export type ISurvey = SurveyFieldsFragment;

export type ISurveyDetail = NonNullable<SurveyDetailQuery['surveyDetail']>;

export type ISurveyWithResults = NonNullable<
  NonNullable<NonNullable<SurveyResultsListQuery['surveyList']>['list']>[number]
>;

export type ISurveyStep = ISurvey['steps'][number];

export type ISurveyOption = ISurveyStep['options'][number];

export type ISurveyStepResult = NonNullable<
  ISurveyDetail['results']
>['steps'][number];

/** The attachment shape the survey form keeps and sends as `AttachmentInput`. */
export interface ISurveyAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

export enum SurveysPageHotKeyScope {
  SurveysPage = 'surveys-page',
}

export const SURVEY_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  REJECTED: 'rejected',
  ARCHIVED: 'archived',
} as const;

export const SURVEY_STATUSES = [
  SURVEY_STATUS.PENDING,
  SURVEY_STATUS.ACTIVE,
  SURVEY_STATUS.REJECTED,
  SURVEY_STATUS.ARCHIVED,
];

export const MAX_REJECTION_REASON_LENGTH = 500;

export const MAX_SURVEY_ATTACHMENTS = 5;

export const MAX_SURVEY_OPTIONS = 10;

export const MAX_SURVEY_STEPS = 10;

export const SURVEY_DURATIONS: { labelKey: string; value: number | null }[] = [
  { labelKey: 'duration-none', value: null },
  { labelKey: 'duration-1-hour', value: 1 },
  { labelKey: 'duration-4-hours', value: 4 },
  { labelKey: 'duration-8-hours', value: 8 },
  { labelKey: 'duration-1-day', value: 24 },
  { labelKey: 'duration-3-days', value: 72 },
  { labelKey: 'duration-7-days', value: 168 },
];
