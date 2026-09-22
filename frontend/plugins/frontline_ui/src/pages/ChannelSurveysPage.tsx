import { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { SurveySubHeader } from '@/survey/components/survey-page/SurveySubHeader';

const SurveyPageList = lazy(() =>
  import('@/survey/components/survey-page/SurveyPageList').then((module) => ({
    default: module.SurveyPageList,
  })),
);

export const ChannelSurveysPage = () => {
  const { id: channelId } = useParams<{ id: string }>();

  return (
    <>
      <SurveySubHeader channelId={channelId} />
      <Suspense fallback={<div />}>
        <SurveyPageList channelId={channelId} />
      </Suspense>
    </>
  );
};
