import { Badge, cn } from 'erxes-ui';
import { IMessagePoll } from '@/inbox/types/Conversation';
import { useEffect, useState } from 'react';
import {
  IconChartBar,
  IconCircleCheckFilled,
  IconClock,
} from '@tabler/icons-react';

// Voting happens on Discord — the inbox shows the poll read-only (the "Show
// results" view). Vote tallies stay in sync: Discord poll-vote events refresh
// the stored counts and re-publish the message, so the card updates live.
const timeLeftLabel = (expiry?: string): string => {
  if (!expiry) return '';
  const ms = new Date(expiry).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return 'Poll closed';
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 24) return `${Math.floor(hours / 24)}d left`;
  if (hours >= 1) return `${hours}h left`;
  return `${Math.max(1, Math.floor(ms / 60_000))}m left`;
};

/** Pluralize a vote-count label ("1 vote" / "n votes"). */
const votesLabel = (count: number) =>
  `${count} ${count === 1 ? 'vote' : 'votes'}`;

const percentageLabel = (count: number, totalVotes: number) =>
  totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

/** Renders a Discord poll with per-answer tallies and totals. */
export const MessagePoll = ({ poll }: { poll: IMessagePoll }) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!poll.expiry) return;
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, [poll.expiry]);

  if (!poll.answers?.length) {
    return (
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-dashed bg-muted/30 px-3.5 py-3 text-sm text-muted-foreground">
        <IconChartBar className="size-4 shrink-0" />
        Poll results unavailable
      </div>
    );
  }
  const countById = new Map<number, number>(
    (poll.results?.answerCounts ?? []).map((c) => [c.id, c.count]),
  );
  const totalVotes = [...countById.values()].reduce((sum, n) => sum + n, 0);

  const closed =
    Boolean(poll.results?.isFinalized) ||
    (poll.expiry ? new Date(poll.expiry).getTime() <= now : false);
  const status = closed ? 'Poll closed' : timeLeftLabel(poll.expiry);
  const highestCount = Math.max(0, ...countById.values());

  return (
    <section className="mt-2 w-full min-w-72 overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm">
      <div className="px-4 pt-4 pb-3">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-[15px] leading-5 font-semibold text-foreground">
            {poll.question || 'Poll'}
          </h3>
          <Badge
            variant={closed ? 'secondary' : 'outline'}
            className="h-5 shrink-0 rounded-full px-2 text-[10px] font-medium"
          >
            {closed ? 'Closed' : 'Live'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {poll.allowMultiselect ? 'Multiple answers allowed' : 'Choose one'}
          {' · Vote in Discord'}
        </p>
      </div>

      <div className="flex flex-col gap-2 px-3 pb-3">
        {poll.answers.map((answer) => {
          const count = countById.get(answer.id) ?? 0;
          const percentage = percentageLabel(count, totalVotes);
          const isLeading = totalVotes > 0 && count === highestCount;

          return (
            <div
              key={answer.id}
              className={cn(
                'relative min-h-14 overflow-hidden rounded-xl border bg-muted/25 px-3 py-2.5',
                isLeading
                  ? 'border-primary/45 ring-1 ring-primary/15'
                  : 'border-border/70',
              )}
            >
              <div
                className={cn(
                  'absolute inset-y-0 left-0 transition-[width] duration-500 ease-out motion-reduce:transition-none',
                  isLeading ? 'bg-primary/15' : 'bg-muted/80',
                )}
                style={{ width: `${percentage}%` }}
              />
              <div className="relative flex items-center gap-3">
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full border bg-background text-base shadow-xs',
                    isLeading && 'border-primary/35',
                  )}
                >
                  {answer.emoji || (
                    <span className="text-xs font-semibold text-muted-foreground">
                      {answer.id}
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {answer.text}
                </span>
                <span className="flex shrink-0 items-center gap-2 text-right">
                  <span className="text-sm font-semibold tabular-nums">
                    {percentage}%
                  </span>
                  {isLeading && (
                    <IconCircleCheckFilled className="size-4 text-primary" />
                  )}
                </span>
              </div>
              <div className="relative mt-1 pl-11 text-[11px] text-muted-foreground tabular-nums">
                {votesLabel(count)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 border-t bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5 font-medium tabular-nums">
          <IconChartBar className="size-3.5" />
          {votesLabel(totalVotes)}
        </span>
        {status && (
          <span className="flex items-center gap-1.5">
            <IconClock className="size-3.5" />
            {status}
          </span>
        )}
      </div>
    </section>
  );
};
