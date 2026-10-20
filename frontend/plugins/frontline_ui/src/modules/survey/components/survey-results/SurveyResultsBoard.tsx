import {
  IconChartBar,
  IconSend,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  Empty,
  ScrollArea,
  Skeleton,
  useMultiQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SurveyStepResults } from '@/survey/components/survey-results/SurveyStepResults';
import { useSurveyResultsList } from '@/survey/hooks/useSurveyList';
import {
  ISurveyStepResult,
  ISurveyWithResults,
} from '@/survey/types/surveyTypes';
import { FrontlinePaths } from '@/types/FrontlinePaths';

const SETTINGS_PATH = `/${FrontlinePaths.Frontline}/settings${FrontlinePaths.Channels}`;

const SurveyResultCard = ({ survey }: { survey: ISurveyWithResults }) => {
  const { t } = useTranslation('frontline');
  const results = survey.results;
  const steps: ISurveyStepResult[] = results?.steps?.length
    ? results.steps
    : (survey.steps?.length
        ? survey.steps
        : [
            {
              _id: survey._id,
              name: null,
              order: 0,
              question: survey.question,
              options: survey.options,
            },
          ]
      ).map((step) => ({
        _id: step._id,
        name: step.name,
        question: step.question,
        totalVotes: 0,
        options: step.options.map((option) => ({
          _id: option._id,
          text: option.text,
          count: 0,
          percent: 0,
        })),
      }));

  return (
    <Link
      to={`${SETTINGS_PATH}/${survey.channelId}/surveys/${survey._id}`}
      className="flex flex-col gap-3 rounded-lg border bg-background p-4 transition-colors hover:border-primary/50 hover:bg-accent/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{survey.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {steps.length > 1
              ? t('n-steps', '{{count}} steps', { count: steps.length })
              : survey.question}
          </p>
        </div>
        <Badge variant={survey.status === 'active' ? 'success' : 'secondary'}>
          {survey.status ? t(survey.status) : null}
        </Badge>
      </div>

      <SurveyStepResults steps={steps} showStepLabel={steps.length > 1} />

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <IconChartBar className="size-3.5" />
          {t('survey-total-votes-short', '{{count}} votes', {
            count: results?.totalVotes || 0,
          })}
        </span>
        <span className="inline-flex items-center gap-1">
          <IconUsers className="size-3.5" />
          {t('survey-voters', '{{count}} voters', {
            count: results?.voterCount || 0,
          })}
        </span>
        <span className="inline-flex items-center gap-1">
          <IconSend className="size-3.5" />
          {t('survey-sent-count', 'sent {{count}}×', {
            count: survey.sentCount || 0,
          })}
        </span>
      </div>
    </Link>
  );
};

export const SurveyResultsBoard = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.survey' });
  const [{ status, searchValue, channelId }] = useMultiQueryState<{
    status?: string;
    searchValue?: string;
    channelId?: string;
  }>(['status', 'searchValue', 'channelId']);

  const { surveys, loading } = useSurveyResultsList({
    variables: {
      status: status || undefined,
      searchValue: searchValue || undefined,
      channelId: channelId || undefined,
    },
  });

  if (loading && !surveys) {
    return (
      <div className="m-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (!surveys?.length) {
    return (
      <Empty className="bg-sidebar rounded-lg m-3">
        <Empty.Header>
          <Empty.Media>
            <IconChartBar />
          </Empty.Media>
          <Empty.Title>{t('no-surveys-found', 'No surveys found')}</Empty.Title>
          <Empty.Description>
            {t(
              'surveys-empty-description',
              'Create a survey and send it into a messenger conversation.',
            )}
          </Empty.Description>
        </Empty.Header>
        <Empty.Content>
          <Button variant="outline" asChild>
            <Link to={SETTINGS_PATH}>
              <IconSettings />
              {t('go-to-survey-settings', 'Go to survey settings')}
            </Link>
          </Button>
        </Empty.Content>
      </Empty>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="m-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {surveys.map((survey) => (
          <SurveyResultCard key={survey._id} survey={survey} />
        ))}
      </div>
    </ScrollArea>
  );
};
