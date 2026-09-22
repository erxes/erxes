import { Button, Skeleton } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { useSurveyDetail } from '@/survey/hooks/useSurveyDetail';

export const SurveyDetailsBreadcrumb = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const { survey, loading } = useSurveyDetail({
    variables: { _id: surveyId },
    skip: !surveyId,
  });

  if (loading && !survey) {
    return <Skeleton className="h-4 w-24" />;
  }

  return (
    <Button variant="ghost" className="font-semibold">
      {survey?.title}
    </Button>
  );
};
