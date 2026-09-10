import { IconChartBar } from '@tabler/icons-react';
import { Empty, Spinner } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { SurveySetupSteps } from '@/survey/components/mutate/SurveySetupSteps';
import { useSurveyDetail } from '@/survey/hooks/useSurveyDetail';
import { surveySetSetupAtom } from '@/survey/states/surveySetupStates';

export const SurveyEdit = () => {
  const { t } = useTranslation('frontline');
  const { surveyId } = useParams<{ surveyId: string }>();
  const [isSetup, setIsSetup] = useState(false);
  const seededSurveyId = useRef<string | null>(null);
  const { survey, loading, error } = useSurveyDetail({
    variables: { _id: surveyId },
    skip: !surveyId,
  });
  const surveySetSetup = useSetAtom(surveySetSetupAtom);

  useEffect(() => {
    if (!survey || seededSurveyId.current === survey._id) {
      return;
    }

    seededSurveyId.current = survey._id;
    surveySetSetup(survey);
    setIsSetup(true);
  }, [survey, surveySetSetup]);

  if (isSetup) {
    return <SurveySetupSteps />;
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <Empty className="bg-sidebar m-3 rounded-lg">
      <Empty.Header>
        <Empty.Media>
          <IconChartBar />
        </Empty.Media>
        <Empty.Title>{t('no-surveys-found', 'No surveys found')}</Empty.Title>
        <Empty.Description>
          {error?.message ||
            t(
              'surveys-empty-description',
              'Create a survey and send it into a messenger conversation.',
            )}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};
