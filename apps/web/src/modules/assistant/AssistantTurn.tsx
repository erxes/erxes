import { cn, Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { CopyButton } from './CopyButton';
import { Reply, type ReplyActions } from './Reply';
import { type ActivityRow, RunTrace, ThinkingLine } from './Steps';
import { replyText, type TranscriptRow } from './transcriptRows';

const ArtifactCard = lazy(() =>
  import('./artifacts/ArtifactCard').then((module) => ({ default: module.ArtifactCard })),
);

export interface TranscriptActions extends ReplyActions {
  busy: boolean;
}

type ShownRow = Exclude<TranscriptRow, ActivityRow>;

const isActivity = (row: TranscriptRow): row is ActivityRow =>
  row.kind === 'thinking' || row.kind === 'steps';

const Row = ({
  row,
  last,
  superseded,
  actions,
}: {
  row: ShownRow;
  last: boolean;
  superseded: boolean;
  actions: TranscriptActions;
}) => {
  switch (row.kind) {
    case 'text':
      return (
        <Reply
          text={row.text}
          state={{
            streaming: row.streaming,
            working: last && actions.busy,
            live: last && !actions.busy,
            superseded,
          }}
          actions={actions}
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

export const WorkingRow = ({ label }: { label: string }) => (
  <p className="py-1">
    <ThinkingLine label={label} />
  </p>
);

export const AssistantTurn = ({
  rows,
  last,
  actions,
}: {
  rows: TranscriptRow[];
  last: boolean;
  actions: TranscriptActions;
}) => {
  const working = last && actions.busy;
  const activity = rows.filter(isActivity);
  const shown = rows.filter((row): row is ShownRow => !isActivity(row));
  const lastText = shown.findLast((row) => row.kind === 'text')?.key;
  const end = rows.at(-1);
  const tracing = working && end !== undefined && isActivity(end);
  const text = replyText(rows);

  return (
    <article aria-busy={working} className="group/turn flex min-w-0 flex-col gap-3">
      <RunTrace rows={activity} live={working} tracing={tracing} />
      {shown.map((row) => (
        <Row
          key={row.key}
          row={row}
          last={last}
          superseded={row.kind === 'text' && row.key !== lastText}
          actions={actions}
        />
      ))}
      {!working && text && (
        <div
          className={cn(
            '-mt-1 -ml-2 flex transition-opacity',
            !last && 'opacity-0 group-hover/turn:opacity-100 focus-within:opacity-100',
          )}
        >
          <CopyButton text={text} />
        </div>
      )}
    </article>
  );
};
