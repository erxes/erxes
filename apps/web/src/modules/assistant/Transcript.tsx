import { IconArrowDown, IconLoader2 } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AssistantAvatar } from './AssistantAvatar';
import { CopyButton } from './CopyButton';
import { QuestionCard } from './QuestionCard';
import { Reply } from './Reply';
import { StepsGroup, ThinkingBlock } from './Steps';
import {
  answerMessage,
  replyText,
  type TranscriptMessage,
  type TranscriptRow,
} from './transcriptRows';
import { UserMessage } from './UserMessage';

const ArtifactCard = lazy(() =>
  import('./artifacts/ArtifactCard').then((module) => ({ default: module.ArtifactCard })),
);

export interface TranscriptActions {
  busy: boolean;
  onAnswer: (text: string) => void;
}

const Row = ({
  row,
  live,
  actions,
}: {
  row: TranscriptRow;
  live: boolean;
  actions: TranscriptActions;
}) => {
  switch (row.kind) {
    case 'text':
      return <Reply text={row.text} streaming={row.streaming} />;
    case 'thinking':
      return <ThinkingBlock text={row.text} streaming={row.streaming} />;
    case 'steps':
      return <StepsGroup steps={row.steps} live={live} />;
    case 'question':
      return (
        <QuestionCard
          questions={row.questions}
          disabled={actions.busy}
          onAnswer={(answers) => actions.onAnswer(answerMessage(row.questions, answers))}
        />
      );
    case 'artifact':
      return (
        <Suspense fallback={<Spinner />}>
          <ArtifactCard artifact={row.artifact} />
        </Suspense>
      );
  }
};

const AssistantMessage = ({
  rows,
  last,
  actions,
}: {
  rows: TranscriptRow[];
  last: boolean;
  actions: TranscriptActions;
}) => {
  const { t } = useTranslation('assistant');
  const text = replyText(rows);
  const waiting = rows.some((row) => row.kind === 'question');
  const working = last && actions.busy;
  const thinking = working && !rows.some((row) => row.kind === 'text');
  const [first] = rows;
  const lead = first?.kind === 'steps' || first?.kind === 'thinking' ? first : null;
  const liveKey = working ? rows.at(-1)?.key : undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-w-0 items-start gap-2">
        <AssistantAvatar
          size={28}
          state={thinking ? 'thinking' : 'idle'}
          animated={last}
          follow={last && !thinking}
        />
        {lead ? (
          <div className="min-w-0 flex-1">
            <Row row={lead} live={lead.key === liveKey} actions={actions} />
          </div>
        ) : (
          thinking && (
            <span className="self-center text-sm text-muted-foreground">
              {t('working', 'Working on it…')}
            </span>
          )
        )}
      </div>
      {rows.slice(lead ? 1 : 0).map((row) => (
        <Row key={row.key} row={row} live={row.key === liveKey} actions={actions} />
      ))}
      {last && !working && !waiting && text && (
        <div className="flex items-center gap-0.5">
          <CopyButton text={text} />
        </div>
      )}
    </div>
  );
};

export const WorkingRow = ({ label, avatar = false }: { label: string; avatar?: boolean }) => (
  <p className="flex items-center gap-2 text-sm text-muted-foreground">
    {avatar ? (
      <AssistantAvatar size={28} state="thinking" />
    ) : (
      <IconLoader2 aria-hidden className="size-3.5 animate-spin" />
    )}
    {label}
  </p>
);

const LatestButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation('assistant');

  return (
    <Button
      variant="outline"
      size="sm"
      className="absolute bottom-3 left-1/2 -translate-x-1/2"
      onClick={onClick}
    >
      <IconArrowDown className="size-3.5" />
      {t('latest', 'Latest')}
    </Button>
  );
};

const useFollowBottom = (asked: string | undefined) => {
  const scroller = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const pinned = useRef(true);
  const top = useRef(0);
  const [away, setAway] = useState(false);

  useEffect(() => {
    const element = scroller.current;
    const content = list.current;

    if (!element || !content) return undefined;

    const follow = new ResizeObserver(() => {
      if (pinned.current) element.scrollTop = element.scrollHeight;
    });

    follow.observe(content);
    follow.observe(element);

    return () => follow.disconnect();
  }, []);

  useEffect(() => {
    const element = scroller.current;

    if (!element || !asked) return;

    pinned.current = true;
    element.scrollTop = element.scrollHeight;
  }, [asked]);

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const gap = element.scrollHeight - element.scrollTop - element.clientHeight;

    if (element.scrollTop < top.current && gap > 1) pinned.current = false;
    else if (gap < 48) pinned.current = true;

    top.current = element.scrollTop;
    setAway(gap > 240);
  };

  const toLatest = () => {
    pinned.current = true;
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  };

  return { scroller, list, onScroll, away, toLatest };
};

export const Transcript = ({
  messages,
  actions,
  footer,
}: {
  messages: TranscriptMessage[];
  actions: TranscriptActions;
  footer?: React.ReactNode;
}) => {
  const asked = messages.findLast((message) => message.role === 'user')?.key;
  const { scroller, list, onScroll, away, toLatest } = useFollowBottom(asked);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div ref={scroller} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto">
        <ol ref={list} className="flex flex-col gap-5 px-4 py-4">
          {messages.map((message, index) => (
            <li key={message.key}>
              {message.role === 'user' ? (
                <UserMessage parts={message.parts} />
              ) : (
                <AssistantMessage
                  rows={message.rows}
                  last={index === messages.length - 1}
                  actions={actions}
                />
              )}
            </li>
          ))}
          {footer && <li>{footer}</li>}
        </ol>
      </div>
      {away && <LatestButton onClick={toLatest} />}
    </div>
  );
};
