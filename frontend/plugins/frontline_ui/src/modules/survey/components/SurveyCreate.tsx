import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { SurveySetupSteps } from '@/survey/components/mutate/SurveySetupSteps';
import {
  resetSurveySetupAtom,
  settedSurveyDetailAtom,
} from '@/survey/states/surveySetupStates';

export const SurveyCreate = () => {
  const settedSurveyDetail = useAtomValue(settedSurveyDetailAtom);
  const resetSurveySetup = useSetAtom(resetSurveySetupAtom);

  useEffect(() => {
    if (settedSurveyDetail) {
      resetSurveySetup();
    }
  }, [settedSurveyDetail, resetSurveySetup]);

  return <SurveySetupSteps />;
};
