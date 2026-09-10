import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { nanoid } from 'nanoid';
import {
  createSurveyContentDefaultValues,
  SURVEY_CONFIRMATION_DEFAULT_VALUES,
  SURVEY_GENERAL_DEFAULT_VALUES,
  SURVEY_SETUP_STEPS,
  SURVEY_STORAGE_KEYS,
} from '@/survey/constants/surveySetupDefaultValues';
import {
  TSurveyConfirmation,
  TSurveyContent,
  TSurveyContentStep,
  TSurveyGeneral,
} from '@/survey/constants/surveySetupSchema';
import {
  ISurvey,
  ISurveyOption,
  ISurveyStep,
} from '@/survey/types/surveyTypes';

export interface ISurveyMutationOption {
  _id?: string;
  text: string;
  order: number;
  ticketCreationEnabled: boolean;
  ticketCreationThreshold: number | null;
  ticketPipelineId: string | null;
  ticketStatusId: string | null;
}

export interface ISurveyMutationStep {
  _id?: string;
  name: string;
  description: string;
  order: number;
  question: string;
  allowMultiselect: boolean;
  options: ISurveyMutationOption[];
}

export interface ISurveyMutationInput {
  title: string;
  brandId: string | null;
  durationHours: number | null;
  steps: ISurveyMutationStep[];
}

export const surveySetupStepAtom = atomWithStorage<number>(
  SURVEY_STORAGE_KEYS.STEP,
  SURVEY_SETUP_STEPS.GENERAL,
);

export const surveySetupGeneralAtom = atomWithStorage<TSurveyGeneral>(
  SURVEY_STORAGE_KEYS.GENERAL,
  SURVEY_GENERAL_DEFAULT_VALUES,
  undefined,
  { getOnInit: true },
);

export const surveySetupContentAtom = atomWithStorage<TSurveyContent>(
  SURVEY_STORAGE_KEYS.CONTENT,
  createSurveyContentDefaultValues(),
  undefined,
  { getOnInit: true },
);

export const surveySetupConfirmationAtom = atomWithStorage<TSurveyConfirmation>(
  SURVEY_STORAGE_KEYS.CONFIRMATION,
  SURVEY_CONFIRMATION_DEFAULT_VALUES,
  undefined,
  { getOnInit: true },
);

export const settedSurveyDetailAtom = atomWithStorage(
  SURVEY_STORAGE_KEYS.SETTED_DETAIL,
  false,
);

export const surveySetupValuesAtom = atom((get) => {
  const general = get(surveySetupGeneralAtom);
  const content = get(surveySetupContentAtom);

  return (confirmation: TSurveyConfirmation): ISurveyMutationInput => ({
    title: general.title.trim(),
    brandId: general.brandId || null,
    durationHours: confirmation.durationHours,
    steps: content.steps.map((step, index) => ({
      ...(step._id ? { _id: step._id } : {}),
      name: step.name.trim() || `Step ${index + 1}`,
      description: step.description.trim(),
      order: index,
      question: step.question.trim(),
      allowMultiselect: step.allowMultiselect,
      options: step.options.map((option, optionIndex) => ({
        ...(option._id ? { _id: option._id } : {}),
        text: option.text.trim(),
        order: optionIndex,
        ticketCreationEnabled: option.ticketCreationEnabled,
        ticketCreationThreshold: option.ticketCreationEnabled
          ? option.ticketCreationThreshold
          : null,
        ticketPipelineId: option.ticketCreationEnabled
          ? option.ticketPipelineId
          : null,
        ticketStatusId: option.ticketCreationEnabled
          ? option.ticketStatusId
          : null,
      })),
    })),
  });
});

export const resetSurveySetupAtom = atom(null, (_, set) => {
  set(surveySetupStepAtom, SURVEY_SETUP_STEPS.GENERAL);
  set(surveySetupGeneralAtom, SURVEY_GENERAL_DEFAULT_VALUES);
  set(surveySetupContentAtom, createSurveyContentDefaultValues());
  set(surveySetupConfirmationAtom, SURVEY_CONFIRMATION_DEFAULT_VALUES);
  set(settedSurveyDetailAtom, false);
});

const toContentOptions = (options: ISurveyOption[]) =>
  [...options]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((option) => ({
      _id: option._id,
      key: option._id || nanoid(),
      text: option.text,
      ticketCreationEnabled: Boolean(option.ticketCreationEnabled),
      ticketCreationThreshold: option.ticketCreationThreshold ?? null,
      ticketPipelineId: option.ticketPipelineId ?? null,
      ticketStatusId: option.ticketStatusId ?? null,
      ticketCreated: Boolean(option.ticketCreated),
      ticketId: option.ticketId ?? null,
    }));

const toContentStep = (step: ISurveyStep): TSurveyContentStep => ({
  _id: step._id,
  key: step._id || nanoid(),
  name: step.name ?? '',
  description: step.description ?? '',
  question: step.question,
  allowMultiselect: Boolean(step.allowMultiselect),
  options: toContentOptions(step.options),
});

const toSurveyContentSteps = (survey: ISurvey): TSurveyContentStep[] => {
  if (survey.steps?.length) {
    return [...survey.steps]
      .sort((a, b) => a.order - b.order)
      .map(toContentStep);
  }

  return [
    {
      key: nanoid(),
      name: '',
      description: '',
      question: survey.question,
      allowMultiselect: Boolean(survey.allowMultiselect),
      options: toContentOptions(survey.options),
    },
  ];
};

export const surveySetSetupAtom = atom(null, (_, set, payload: ISurvey) => {
  set(surveySetupStepAtom, SURVEY_SETUP_STEPS.GENERAL);
  set(surveySetupGeneralAtom, {
    title: payload.title ?? '',
    brandId: payload.brandId ?? null,
  });
  set(surveySetupContentAtom, { steps: toSurveyContentSteps(payload) });
  set(surveySetupConfirmationAtom, {
    durationHours: payload.durationHours ?? null,
  });
  set(settedSurveyDetailAtom, true);
});
