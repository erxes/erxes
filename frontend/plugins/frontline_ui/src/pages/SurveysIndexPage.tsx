import { lazy, Suspense } from 'react';
import { useAtomValue } from 'jotai';
import { useQueryState } from 'erxes-ui';
import { SurveySubHeader } from '@/survey/components/survey-page/SurveySubHeader';
import { surveyViewAtom } from '@/survey/states/surveyViewState';

const SurveyResultsBoard = lazy(() =>
  import('@/survey/components/survey-results/SurveyResultsBoard').then(
    (module) => ({
      default: module.SurveyResultsBoard,
    }),
  ),
);

const SurveyPageList = lazy(() =>
  import('@/survey/components/survey-page/SurveyPageList').then((module) => ({
    default: module.SurveyPageList,
  })),
);

export const SurveysIndexPage = () => {
  const view = useAtomValue(surveyViewAtom);
  const [channelId] = useQueryState<string>('channelId');

  return (
    <>
      <SurveySubHeader />
      <Suspense fallback={<div />}>
        {view === 'list' ? (
          <SurveyPageList channelId={channelId || undefined} />
        ) : (
          <SurveyResultsBoard />
        )}
      </Suspense>
    </>
  );
};
