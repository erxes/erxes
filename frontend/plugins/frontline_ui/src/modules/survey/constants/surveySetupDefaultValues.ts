import { nanoid } from 'nanoid';
import {
  TSurveyConfirmation,
  TSurveyContent,
  TSurveyContentStep,
  TSurveyGeneral,
} from '@/survey/constants/surveySetupSchema';

export const SURVEY_STORAGE_KEYS = {
  STEP: 'surveyStep',
  GENERAL: 'surveyGeneral',
  CONTENT: 'surveyContent',
  CONFIRMATION: 'surveyConfirmation',
  SETTED_DETAIL: 'settedSurveyDetail',
} as const;

export const SURVEY_SETUP_STEPS = {
  GENERAL: 1,
  CONTENT: 2,
  CONFIRMATION: 3,
} as const;

export const SURVEY_SETUP_STEPS_LENGTH = Object.keys(SURVEY_SETUP_STEPS).length;

export const createSurveyContentOption = () => ({
  key: nanoid(),
  text: '',
  ticketCreationEnabled: false,
  ticketCreationThreshold: null,
  ticketPipelineId: null,
  ticketStatusId: null,
});

export const createSurveyContentStep = (): TSurveyContentStep => ({
  key: nanoid(),
  name: '',
  description: '',
  question: '',
  allowMultiselect: false,
  options: [createSurveyContentOption(), createSurveyContentOption()],
});

export const SURVEY_GENERAL_DEFAULT_VALUES: TSurveyGeneral = {
  title: '',
  brandId: null,
};

export const SURVEY_CONFIRMATION_DEFAULT_VALUES: TSurveyConfirmation = {
  durationHours: null,
};

export const createSurveyContentDefaultValues = (): TSurveyContent => ({
  steps: [createSurveyContentStep()],
});
