import { Button, cn, toast } from 'erxes-ui';
import { useState } from 'react';
import { usePollVote } from '../hooks/usePollVote';
import { IMessagePoll } from '../types/conversation';
import { Message, MessagePosition } from './message';

const timeLeftLabel = (expiry?: string): string => {
  if (!expiry) return '';

  const ms = new Date(expiry).getTime() - Date.now();

  if (Number.isNaN(ms) || ms <= 0) return 'Poll closed';

  const hours = Math.floor(ms / 3_600_000);

  if (hours >= 24) return `${Math.floor(hours / 24)}d left`;
  if (hours >= 1) return `${hours}h left`;

  return `${Math.max(1, Math.floor(ms / 60_000))}m left`;
};

const votesLabel = (count: number) =>
  `${count} ${count === 1 ? 'vote' : 'votes'}`;

export const PollMessage = ({
  messageId,
  poll,
  createdAt,
  src,
  userName,
  showAvatar,
  isFirstMessage,
  isLastMessage,
  isMiddleMessage,
  isSingleMessage,
}: {
  messageId: string;
  poll: IMessagePoll;
  createdAt: Date;
  src?: string;
  userName?: string;
  showAvatar?: boolean;
} & MessagePosition) => {
  const { vote, voting, selectedOptionIds, canVote } = usePollVote();

  const votedOptionIds = selectedOptionIds(messageId);
  const [draft, setDraft] = useState<string[] | null>(null);
  const selected = draft ?? votedOptionIds;

  const countById = new Map(
    (poll.results?.answerCounts ?? []).map((count) => [count.id, count.count]),
  );
  const totalVotes = [...countById.values()].reduce(
    (sum, count) => sum + count,
    0,
  );

  const closed =
    Boolean(poll.results?.isFinalized) ||
    (poll.expiry ? new Date(poll.expiry).getTime() <= Date.now() : false);

  const status = closed ? 'Poll closed' : timeLeftLabel(poll.expiry);
  const hasVoted = votedOptionIds.length > 0;
  const dirty =
    selected.length > 0 &&
    (selected.length !== votedOptionIds.length ||
      selected.some((id) => !votedOptionIds.includes(id)));

  const toggleOption = (optionId: string) => {
    if (closed || !canVote) return;

    setDraft(() => {
      if (poll.allowMultiselect) {
        return selected.includes(optionId)
          ? selected.filter((id) => id !== optionId)
          : [...selected, optionId];
      }

      return selected.includes(optionId) ? [] : [optionId];
    });
  };

  const handleVote = async () => {
    try {
      await vote(messageId, selected);
      setDraft(null);
    } catch (error) {
      toast({
        title: 'Vote failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const position: MessagePosition = {
    isFirstMessage,
    isLastMessage,
    isMiddleMessage,
    isSingleMessage,
  };

  return (
    <Message align="start">
      <Message.Row>
        <Message.Avatar
          show={showAvatar}
          src={src || 'assets/user.webp'}
          alt={userName || 'Erxes'}
          className={showAvatar ? 'mb-5' : undefined}
        />
        <Message.Body align="start">
          {(position.isFirstMessage || position.isSingleMessage) && userName && (
            <Message.Author>{userName}</Message.Author>
          )}

          <div className="w-full max-w-xs rounded-lg border bg-background p-3">
            <div className="text-sm font-semibold">
              {poll.question || 'Poll'}
            </div>
            <div className="mb-2 text-xs text-muted-foreground">
              {poll.allowMultiselect
                ? 'Select multiple answers'
                : 'Select one answer'}
            </div>

            <div className="flex flex-col gap-1.5">
              {poll.answers.map((answer) => {
                const count = countById.get(answer.id) ?? 0;
                const percent =
                  totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                const isSelected = selected.includes(answer.id);

                return (
                  <button
                    key={answer.id}
                    type="button"
                    disabled={closed || !canVote || voting}
                    onClick={() => toggleOption(answer.id)}
                    className={cn(
                      'relative overflow-hidden rounded border px-3 py-2 text-left',
                      isSelected && 'border-primary',
                      !closed && canVote && 'hover:bg-accent',
                      (closed || !canVote) && 'cursor-default',
                    )}
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-primary/15"
                      style={{ width: `${hasVoted || closed ? percent : 0}%` }}
                    />
                    <div className="relative flex items-center justify-between gap-2 text-sm">
                      <span className="truncate">{answer.text}</span>
                      {(hasVoted || closed) && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {votesLabel(count)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {!closed && canVote && (
              <Button
                size="sm"
                className="mt-2 w-full"
                disabled={!dirty || voting}
                onClick={handleVote}
              >
                {hasVoted ? 'Change vote' : 'Vote'}
              </Button>
            )}

            <div className="mt-2 text-xs text-muted-foreground">
              {votesLabel(totalVotes)}
              {status && ` • ${status}`}
            </div>
          </div>

          {(position.isLastMessage || position.isSingleMessage) && (
            <Message.Time align="start" date={createdAt} />
          )}
        </Message.Body>
      </Message.Row>
    </Message>
  );
};
