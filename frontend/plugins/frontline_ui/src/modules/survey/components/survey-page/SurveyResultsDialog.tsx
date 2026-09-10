import { Dialog, Skeleton } from 'erxes-ui';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SurveyStepResults } from '@/survey/components/survey-results/SurveyStepResults';
import { useSurveyDetail } from '@/survey/hooks/useSurveyDetail';

export const SurveyResultsDialog = ({
  surveyId,
  trigger,
}: {
  surveyId: string;
  trigger: ReactNode;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  const { survey, loading } = useSurveyDetail({
    variables: { _id: surveyId },
    skip: !open,
  });

  const results = survey?.results;
  const steps = results?.steps || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>
            {survey?.title || t('survey-results', 'Results')}
          </Dialog.Title>
          <Dialog.Description>{survey?.question || ''}</Dialog.Description>
        </Dialog.Header>

        {loading && !survey ? (
          <div className="flex flex-col gap-2 py-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : !results || results.totalVotes === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('survey-no-votes', 'No votes yet.')}
          </p>
        ) : (
          <div className="flex flex-col gap-1.5 py-2">
            <SurveyStepResults steps={steps} showStepLabel={steps.length > 1} />
            <p className="mt-1 text-xs text-muted-foreground">
              {t(
                'survey-total-votes',
                '{{votes}} votes from {{voters}} people',
                {
                  votes: results.totalVotes,
                  voters: results.voterCount,
                },
              )}
            </p>
          </div>
        )}
      </Dialog.Content>
    </Dialog>
  );
};
