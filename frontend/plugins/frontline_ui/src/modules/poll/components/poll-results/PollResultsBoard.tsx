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
import { usePollList } from '@/poll/hooks/usePollList';
import { IPoll } from '@/poll/types/pollTypes';
import { FrontlinePaths } from '@/types/FrontlinePaths';

const SETTINGS_PATH = `/settings/${FrontlinePaths.Frontline}${FrontlinePaths.Channels}`;

const PollResultCard = ({ poll }: { poll: IPoll }) => {
  const { t } = useTranslation('frontline');
  const results = poll.results;
  const options = results?.options?.length
    ? results.options
    : poll.options.map((option) => ({
        _id: option._id,
        text: option.text,
        count: 0,
        percent: 0,
      }));

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{poll.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {poll.question}
          </p>
        </div>
        <Badge variant={poll.status === 'active' ? 'success' : 'secondary'}>
          {t(poll.status)}
        </Badge>
      </div>

      <div className="flex flex-col gap-1.5">
        {options.map((option) => (
          <div
            key={option._id}
            className="relative overflow-hidden rounded border bg-accent/40 px-3 py-2"
          >
            <div
              className="absolute inset-y-0 left-0 bg-primary/15"
              style={{ width: `${option.percent}%` }}
            />
            <div className="relative flex items-center justify-between gap-2 text-sm">
              <span className="truncate">{option.text}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {option.count} · {option.percent}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <IconChartBar className="size-3.5" />
          {t('poll-total-votes-short', { count: results?.totalVotes || 0 })}
        </span>
        <span className="inline-flex items-center gap-1">
          <IconUsers className="size-3.5" />
          {t('poll-voters', { count: results?.voterCount || 0 })}
        </span>
        <span className="inline-flex items-center gap-1">
          <IconSend className="size-3.5" />
          {t('poll-sent-count', { count: poll.sentCount || 0 })}
        </span>
      </div>
    </div>
  );
};

export const PollResultsBoard = () => {
  const { t } = useTranslation('frontline');
  const [{ status, searchValue }] = useMultiQueryState<{
    status?: string;
    searchValue?: string;
  }>(['status', 'searchValue']);

  const { polls, loading } = usePollList({
    withResults: true,
    variables: {
      status: status || undefined,
      searchValue: searchValue || undefined,
    },
  });

  if (loading && !polls) {
    return (
      <div className="m-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (!polls?.length) {
    return (
      <Empty className="bg-sidebar rounded-lg m-3">
        <Empty.Header>
          <Empty.Media>
            <IconChartBar />
          </Empty.Media>
          <Empty.Title>{t('no-polls-found')}</Empty.Title>
          <Empty.Description>{t('polls-empty-description')}</Empty.Description>
        </Empty.Header>
        <Empty.Content>
          <Button variant="outline" asChild>
            <Link to={SETTINGS_PATH}>
              <IconSettings />
              {t('go-to-poll-settings')}
            </Link>
          </Button>
        </Empty.Content>
      </Empty>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="m-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {polls.map((poll) => (
          <PollResultCard key={poll._id} poll={poll} />
        ))}
      </div>
    </ScrollArea>
  );
};
