import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react';
import { Button, Collapsible, cn } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { type ActivityRow, intentsOf, searchLabel, stepLabel } from './stepLabels';
import type { Step } from './transcriptRows';

export const clock = (ms: number) => {
  const seconds = Math.max(0, Math.round(ms / 1000));

  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

const Json = ({ label, value }: { label: string; value: unknown }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <pre className="max-h-48 overflow-auto rounded-md bg-muted p-2 font-mono text-xs whitespace-pre-wrap">
      {JSON.stringify(value, null, 2)}
    </pre>
  </div>
);

export const LineTrigger = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <Collapsible.Trigger
    render={
      <Button
        variant="ghost"
        size="sm"
        tone="muted"
        className={cn('group/line max-w-full justify-start', className)}
      />
    }
  >
    {children}
  </Collapsible.Trigger>
);

const Time = ({ at, startedAt, running }: Timing & { running?: boolean }) => (
  <span className="flex w-9 shrink-0 justify-end font-mono text-muted-foreground/60 tabular-nums">
    {running ? (
      <IconLoader2 aria-hidden className="size-3 animate-spin" />
    ) : (
      at !== null && startedAt !== null && clock(at - startedAt)
    )}
  </span>
);

interface Timing {
  at: number | null;
  startedAt: number | null;
}

const Caret = () => (
  <Collapsible.TriggerIcon className="size-2.5 shrink-0 opacity-0 group-hover/line:opacity-100 in-data-panel-open:opacity-100" />
);

const StepRow = ({ step, startedAt }: { step: Step; startedAt: number | null }) => {
  const { t } = useTranslation('assistant');
  const failed = step.status === 'failed';

  return (
    <li>
      <Collapsible>
        <LineTrigger>
          <Time at={step.at} startedAt={startedAt} running={step.status === 'running'} />
          {failed && (
            <IconAlertTriangle aria-hidden className="size-3.5 shrink-0 text-destructive-text" />
          )}
          <span className={cn('min-w-0 truncate', failed && 'text-destructive-text')}>
            {stepLabel(step, t)}
          </span>
          <Caret />
        </LineTrigger>
        <Collapsible.Panel>
          <div className="flex flex-col gap-2 pt-1 pb-2 pl-11">
            {step.error && <p className="text-sm text-destructive-text">{step.error}</p>}
            <code className="font-mono text-xs text-muted-foreground">{step.name}</code>
            <Json label={t('step.input', 'Sent')} value={step.input} />
            {step.output !== null && (
              <Json label={t('step.output', 'Returned')} value={step.output} />
            )}
          </div>
        </Collapsible.Panel>
      </Collapsible>
    </li>
  );
};

const SearchesRow = ({ searches, startedAt }: { searches: Step[]; startedAt: number | null }) => {
  const { t } = useTranslation('assistant');
  const running = searches.some((step) => step.status === 'running');

  return (
    <li>
      <Collapsible>
        <LineTrigger>
          <Time at={searches.at(-1)?.at ?? null} startedAt={startedAt} running={running} />
          <span className="min-w-0 truncate">{searchLabel(running, t)}</span>
          {searches.length > 1 && (
            <span className="shrink-0 text-muted-foreground/60">×{searches.length}</span>
          )}
          <Caret />
        </LineTrigger>
        <Collapsible.Panel>
          <ul className="flex flex-col gap-1 pb-2 pl-11 font-mono text-xs text-muted-foreground">
            {searches.map((step) => (
              <li key={step.key}>{step.query ?? t('step.search-any', 'What it can do')}</li>
            ))}
          </ul>
        </Collapsible.Panel>
      </Collapsible>
    </li>
  );
};

const IntentRow = ({ intent, ...timing }: Timing & { intent: string }) => (
  <li className="flex h-6 items-center gap-1 px-2 text-xs text-muted-foreground/70 italic">
    <Time {...timing} />
    <span className="min-w-0 truncate">{intent}</span>
  </li>
);

type TraceItem =
  | { key: string; step: Step }
  | { key: string; searches: Step[] }
  | { key: string; intent: string; at: number | null };

const traceOf = (rows: ActivityRow[]) => {
  const items: TraceItem[] = [];

  for (const row of rows) {
    if (row.kind === 'thinking') {
      intentsOf(row.text).forEach((intent, index) =>
        items.push({ key: `${row.key}-${index}`, intent, at: row.at }),
      );

      continue;
    }

    for (const step of row.steps) {
      const last = items.at(-1);

      if (step.tool !== 'searchApi') items.push({ key: step.key, step });
      else if (last && 'searches' in last) last.searches.push(step);
      else items.push({ key: step.key, searches: [step] });
    }
  }

  return items;
};

export const TraceList = ({
  rows,
  startedAt,
}: {
  rows: ActivityRow[];
  startedAt: number | null;
}) => (
  <ol className="flex flex-col py-1 animate-in fade-in slide-in-from-top-1">
    {traceOf(rows).map((item) => {
      if ('intent' in item) {
        return <IntentRow key={item.key} intent={item.intent} at={item.at} startedAt={startedAt} />;
      }

      if ('searches' in item) {
        return <SearchesRow key={item.key} searches={item.searches} startedAt={startedAt} />;
      }

      return <StepRow key={item.key} step={item.step} startedAt={startedAt} />;
    })}
  </ol>
);
