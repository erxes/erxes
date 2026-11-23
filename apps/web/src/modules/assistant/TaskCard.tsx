import { IconCircleCheck, IconHandStop, IconLoader2 } from '@tabler/icons-react';
import { Badge, Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { AssistantAvatar } from './AssistantAvatar';
import { CopyButton } from './CopyButton';
import { Reply, type ReplyActions } from './Reply';
import { ActivityGroup, type ActivityRow } from './Steps';
import { replyText, type TranscriptRow } from './transcriptRows';
import { hasUi } from './ui/blocks';

const ArtifactCard = lazy(() =>
  import('./artifacts/ArtifactCard').then((module) => ({ default: module.ArtifactCard })),
);

export interface TranscriptActions extends ReplyActions {
  busy: boolean;
}

type ShownRow = Exclude<TranscriptRow, ActivityRow>;

type Status = 'working' | 'needs' | 'done';

const HEADING = /^\s*#{1,3}\s+(.+?)\s*(?:\n|$)/;

const ASKS = /<a2ui>[\s\S]*?Event\(/;

const isActivity = (row: TranscriptRow): row is ActivityRow =>
  row.kind === 'thinking' || row.kind === 'steps';

const titled = (rows: ShownRow[]) => {
  const first = rows.find((row) => row.kind === 'text');
  const heading = first?.kind === 'text' ? HEADING.exec(first.text) : null;

  if (!heading || first?.kind !== 'text') return { title: null, rows };

  const text = first.text.slice(heading[0].length);

  return {
    title: heading[1] ?? null,
    rows: rows.map((row) => (row === first ? { ...first, text } : row)),
  };
};

const statusOf = (rows: TranscriptRow[], working: boolean, live: boolean): Status => {
  if (working) return 'working';

  return live && rows.some((row) => row.kind === 'text' && ASKS.test(row.text)) ? 'needs' : 'done';
};

const StatusBadge = ({ status }: { status: Status }) => {
  const { t } = useTranslation('assistant');

  switch (status) {
    case 'working':
      return (
        <Badge variant="info">
          <IconLoader2 aria-hidden className="animate-spin" />
          {t('task.working', 'Working')}
        </Badge>
      );
    case 'needs':
      return (
        <Badge variant="warning">
          <IconHandStop aria-hidden />
          {t('task.needs', 'Needs you')}
        </Badge>
      );
    case 'done':
      return (
        <Badge variant="success">
          <IconCircleCheck aria-hidden />
          {t('task.done', 'Done')}
        </Badge>
      );
  }
};

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
  <p className="flex items-center gap-2 text-sm text-muted-foreground">
    <AssistantAvatar size={22} state="thinking" />
    {label}
  </p>
);

const Body = ({
  rows,
  last,
  actions,
}: {
  rows: ShownRow[];
  last: boolean;
  actions: TranscriptActions;
}) => {
  const lastText = rows.findLast((row) => row.kind === 'text')?.key;

  return rows.map((row) => (
    <Row
      key={row.key}
      row={row}
      last={last}
      superseded={row.kind === 'text' && row.key !== lastText}
      actions={actions}
    />
  ));
};

export const AssistantTurn = ({
  rows,
  asked,
  last,
  actions,
}: {
  rows: TranscriptRow[];
  asked: string;
  last: boolean;
  actions: TranscriptActions;
}) => {
  const { t } = useTranslation('assistant');
  const working = last && actions.busy;
  const activity = rows.filter(isActivity);
  const shown = titled(rows.filter((row): row is ShownRow => !isActivity(row)));
  const text = replyText(rows);
  const status = statusOf(rows, working, last && !actions.busy);

  const tasked =
    activity.length > 0 ||
    rows.some((row) => row.kind === 'artifact' || (row.kind === 'text' && hasUi(row.text)));

  if (!tasked) {
    return (
      <div className="flex flex-col gap-2">
        {working && !rows.length && <WorkingRow label={t('working', 'Working on it…')} />}
        <Body rows={shown.rows} last={last} actions={actions} />
        {last && !working && text && (
          <div className="-ml-2">
            <CopyButton text={text} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <article
        aria-busy={working}
        className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-background shadow-xs"
      >
        <header className="flex min-w-0 items-center gap-2 px-3.5 pt-3 pb-1.5">
          <h3 className="min-w-0 flex-1 truncate text-sm font-semibold">{shown.title ?? asked}</h3>
          <StatusBadge status={status} />
        </header>
        {activity.length > 0 && (
          <div className="px-3.5 pb-2">
            <ActivityGroup rows={activity} live={working} />
          </div>
        )}
        {shown.rows.length > 0 && (
          <div className="flex min-w-0 flex-col gap-3 border-t px-3.5 py-3">
            <Body rows={shown.rows} last={last} actions={actions} />
          </div>
        )}
      </article>
      {last && !working && text && (
        <div className="-ml-2">
          <CopyButton text={text} />
        </div>
      )}
    </div>
  );
};
