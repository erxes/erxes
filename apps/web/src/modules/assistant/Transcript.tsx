import { IconArrowDown } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AssistantAvatar } from './AssistantAvatar';
import { CopyButton } from './CopyButton';
import { type OnUiAction, Reply } from './Reply';
import { ActivityGroup, type ActivityRow } from './Steps';
import { replyText, type TranscriptMessage, type TranscriptRow } from './transcriptRows';
import { UserMessage } from './UserMessage';

const ArtifactCard = lazy(() =>
  import('./artifacts/ArtifactCard').then((module) => ({ default: module.ArtifactCard })),
);

export interface TranscriptActions {
  busy: boolean;
  onAction: OnUiAction;
}

interface RowPlace {
  last: boolean;
  superseded: boolean;
}

type ShownRow = Exclude<TranscriptRow, ActivityRow>;

type Segment = ShownRow | { kind: 'activity'; key: string; rows: ActivityRow[] };

const isActivity = (row: TranscriptRow): row is ActivityRow =>
  row.kind === 'thinking' || row.kind === 'steps';

const segmentsOf = (rows: TranscriptRow[]) => {
  const segments: Segment[] = [];

  for (const row of rows) {
    const previous = segments.at(-1);

    if (!isActivity(row)) segments.push(row);
    else if (previous?.kind === 'activity') previous.rows.push(row);
    else segments.push({ kind: 'activity', key: row.key, rows: [row] });
  }

  return segments;
};

const Row = ({
  row,
  place,
  actions,
}: {
  row: ShownRow;
  place: RowPlace;
  actions: TranscriptActions;
}) => {
  switch (row.kind) {
    case 'text':
      return (
        <Reply
          text={row.text}
          state={{
            streaming: row.streaming,
            working: place.last && actions.busy,
            live: place.last && !actions.busy,
            superseded: place.superseded,
          }}
          onAction={actions.onAction}
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
  const working = last && actions.busy;
  const segments = segmentsOf(rows);
  const liveKey = working ? segments.at(-1)?.key : undefined;
  const lastText = rows.findLast((row) => row.kind === 'text')?.key;

  return (
    <div className="flex flex-col gap-3">
      {working && segments.length === 0 && <WorkingRow label={t('working', 'Working on it…')} />}
      {segments.map((segment) =>
        segment.kind === 'activity' ? (
          <ActivityGroup key={segment.key} rows={segment.rows} live={segment.key === liveKey} />
        ) : (
          <Row
            key={segment.key}
            row={segment}
            place={{ last, superseded: segment.kind === 'text' && segment.key !== lastText }}
            actions={actions}
          />
        ),
      )}
      {last && !working && text && (
        <div className="-mt-1 -ml-2 flex items-center gap-0.5">
          <CopyButton text={text} />
        </div>
      )}
    </div>
  );
};

export const WorkingRow = ({ label }: { label: string }) => (
  <p className="flex items-center gap-2 text-sm text-muted-foreground">
    <AssistantAvatar size={22} state="thinking" />
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
