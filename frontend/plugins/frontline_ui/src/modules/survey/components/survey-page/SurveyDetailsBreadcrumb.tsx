import { Button, Skeleton } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { useSurveyDetail } from '@/survey/hooks/useSurveyDetail';

export const SurveyDetailsBreadcrumb = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const { survey, loading } = useSurveyDetail({
    variables: surveyId ? { _id: surveyId } : undefined,
    skip: !surveyId,
  });

  if (loading && !survey) {
    return <Skeleton className="h-4 w-24" />;
  }

  return <Button variant="ghost">{survey?.title}</Button>;
};
