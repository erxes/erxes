import { cn } from 'erxes-ui';
import { IMessagePoll } from '@/inbox/types/Conversation';

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
const votesLabel = (count: number) => `${count} ${count === 1 ? 'vote' : 'votes'}`;

/** Renders a Discord poll with per-answer tallies and totals. */
export const MessagePoll = ({ poll }: { poll: IMessagePoll }) => {
  const countById = new Map<number, number>(
    (poll.results?.answerCounts ?? []).map((c) => [c.id, c.count]),
  );
  const totalVotes = [...countById.values()].reduce((sum, n) => sum + n, 0);

  const closed =
    Boolean(poll.results?.isFinalized) ||
    (poll.expiry ? new Date(poll.expiry).getTime() <= Date.now() : false);
  const status = closed ? 'Poll closed' : timeLeftLabel(poll.expiry);

  return (
    <div className="mt-2 w-full rounded-lg border bg-background p-3">
      <div className="text-sm font-semibold">{poll.question || 'Poll'}</div>
      <div className="mb-2 text-xs text-muted-foreground">
        {poll.allowMultiselect ? 'Select multiple answers' : 'Select one answer'}
      </div>

      <div className="flex flex-col gap-1.5">
        {poll.answers.map((answer) => {
          const count = countById.get(answer.id) ?? 0;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          return (
            <div
              key={answer.id}
              className="relative overflow-hidden rounded border bg-accent/40 px-3 py-2"
            >
              {/* Vote-share fill behind the label. */}
              <div
                className="absolute inset-y-0 left-0 bg-primary/15"
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center justify-between gap-2 text-sm">
                <span className="truncate">
                  {answer.emoji ? `${answer.emoji} ` : ''}
                  {answer.text}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {votesLabel(count)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={cn('mt-2 text-xs text-muted-foreground')}>
        {votesLabel(totalVotes)}
        {status && ` • ${status}`}
      </div>
    </div>
  );
};
