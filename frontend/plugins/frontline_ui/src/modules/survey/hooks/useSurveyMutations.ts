import { MutationHookOptions, useMutation } from '@apollo/client';
import {
  SURVEY_ADD,
  SURVEY_EDIT,
  SURVEY_REMOVE,
  SURVEY_SEND_TO_CONVERSATION,
  SURVEY_TOGGLE_STATUS,
} from '@/survey/graphql/surveyMutations';
import {
  GET_SURVEY_LIST,
  GET_SURVEY_TOTAL_COUNT,
} from '@/survey/graphql/surveyQueries';

const refetchSurveyQueries = [GET_SURVEY_LIST, GET_SURVEY_TOTAL_COUNT];

export const useSurveyAdd = (options?: MutationHookOptions) => {
  const [addSurvey, { loading }] = useMutation(SURVEY_ADD, {
    refetchQueries: refetchSurveyQueries,
    ...options,
  });

  return { addSurvey, loading };
};

export const useSurveyEdit = (options?: MutationHookOptions) => {
  const [editSurvey, { loading }] = useMutation(SURVEY_EDIT, {
    refetchQueries: refetchSurveyQueries,
    ...options,
  });

  return { editSurvey, loading };
};

export const useSurveyRemove = (options?: MutationHookOptions) => {
  const [removeSurveys, { loading }] = useMutation(SURVEY_REMOVE, {
    refetchQueries: refetchSurveyQueries,
    ...options,
  });

  return { removeSurveys, loading };
};

export const useSurveyToggleStatus = (options?: MutationHookOptions) => {
  const [toggleSurveyStatus, { loading }] = useMutation(SURVEY_TOGGLE_STATUS, {
    refetchQueries: refetchSurveyQueries,
    ...options,
  });

  return { toggleSurveyStatus, loading };
};

export const useSurveySendToConversation = (options?: MutationHookOptions) => {
  const [sendSurvey, { loading }] = useMutation(SURVEY_SEND_TO_CONVERSATION, {
    ...options,
  });

  return { sendSurvey, loading };
};
