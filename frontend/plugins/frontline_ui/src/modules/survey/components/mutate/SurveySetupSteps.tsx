import { Resizable } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { SurveyConfirmation } from '@/survey/components/mutate/SurveyConfirmation';
import { SurveyContent } from '@/survey/components/mutate/SurveyContent';
import { SurveyGeneral } from '@/survey/components/mutate/SurveyGeneral';
import { SurveyPreview } from '@/survey/components/mutate/SurveyPreview';
import { SURVEY_SETUP_STEPS } from '@/survey/constants/surveySetupDefaultValues';
import { surveySetupStepAtom } from '@/survey/states/surveySetupStates';

export const SurveySetupSteps = () => {
  const step = useAtomValue(surveySetupStepAtom);

  return (
    <Resizable.PanelGroup direction="horizontal" className="flex-auto">
      <Resizable.Panel defaultSize={50}>
        {step === SURVEY_SETUP_STEPS.GENERAL && <SurveyGeneral />}
        {step === SURVEY_SETUP_STEPS.CONTENT && <SurveyContent />}
        {step === SURVEY_SETUP_STEPS.CONFIRMATION && <SurveyConfirmation />}
      </Resizable.Panel>
      <Resizable.Handle />
      <Resizable.Panel
        defaultSize={50}
        className="flex flex-col overflow-hidden"
      >
        <SurveyPreview />
      </Resizable.Panel>
    </Resizable.PanelGroup>
  );
};
