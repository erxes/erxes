import { lazy, Suspense } from 'react';
import { SurveySubHeader } from '@/survey/components/survey-page/SurveySubHeader';

const SurveyResultsBoard = lazy(() =>
  import('@/survey/components/survey-results/SurveyResultsBoard').then(
    (module) => ({
      default: module.SurveyResultsBoard,
    }),
  ),
);

export const SurveysIndexPage = () => (
  <>
    <SurveySubHeader />
    <Suspense fallback={<div />}>
      <SurveyResultsBoard />
    </Suspense>
  </>
);
