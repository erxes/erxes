import { toast } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { TSurveyConfirmation } from '@/survey/constants/surveySetupSchema';
import { useSurveyAdd, useSurveyEdit } from '@/survey/hooks/useSurveyMutations';
import {
  surveySetupValuesAtom,
  resetSurveySetupAtom,
} from '@/survey/states/surveySetupStates';

export const useSurveyMutate = () => {
  const { t } = useTranslation('frontline');
  const { id: channelId, surveyId } = useParams<{
    id: string;
    surveyId: string;
  }>();
  const navigate = useNavigate();
  const surveySetupValues = useAtomValue(surveySetupValuesAtom);
  const resetSurveySetup = useSetAtom(resetSurveySetupAtom);
  const { addSurvey, loading: adding } = useSurveyAdd();
  const { editSurvey, loading: editing } = useSurveyEdit();

  const handleMutateSurvey = (confirmation: TSurveyConfirmation) => {
    const variables = { ...surveySetupValues(confirmation), channelId };

    const onCompleted = () => {
      toast({
        variant: 'success',
        title: surveyId
          ? t('survey-updated', 'Survey updated')
          : t('survey-created', 'Survey created'),
      });
      resetSurveySetup();
      navigate(`/settings/frontline/channels/${channelId}/surveys`);
    };

    const onError = (error: Error) =>
      toast({
        variant: 'destructive',
        title: t('error'),
        description: error.message,
      });

    if (surveyId) {
      editSurvey({
        variables: { _id: surveyId, ...variables },
        onCompleted,
        onError,
      });
      return;
    }

    addSurvey({ variables, onCompleted, onError });
  };

  return { handleMutateSurvey, loading: adding || editing };
};
