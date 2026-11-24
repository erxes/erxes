import {
  IconAlertTriangle,
  IconBulb,
  IconCheck,
  IconLoader2,
  IconSearch,
  type Icon,
} from '@tabler/icons-react';
import { Button, Collapsible, cn } from 'erxes-ui';
import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { ThinkingLine } from './ThinkingLine';
import type { Step, StepStatus, TranscriptRow } from './transcriptRows';

const STATUS_ICONS: Record<StepStatus, Icon> = {
  running: IconLoader2,
  done: IconCheck,
  failed: IconAlertTriangle,
};

const MAX_DOTS = 24;

const HEADING = /^\s*\*\*(.+?)\*\*\s*$/gm;

const SENTENCE = /^(.+?[.!?])(?:\s|$)/;

const Titled = z.object({ title: z.string() });

const intentsOf = (thought: string) => {
  const headings = [...thought.matchAll(HEADING)].flatMap((match) =>
    match[1] ? [match[1].trim()] : [],
  );

  if (headings.length) return headings;

  const first = thought.trim().split('\n')[0]?.trim() ?? '';

  return first ? [SENTENCE.exec(first)?.[1] ?? first] : [];
};

const sentenceCase = (words: string) =>
  words
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/^./, (letter) => letter.toUpperCase());

const procedureLabel = (procedure: string) => {
  const [group, ...verb] = procedure.split('.');

  return verb.length && group ? `${sentenceCase(verb.join(' '))} ${group}` : procedure;
};

const artifactStepLabel = (step: Step, t: TFunction<'assistant'>) => {
  const title = Titled.safeParse(step.input).data?.title ?? '';

  return step.status === 'failed'
    ? t('step.artifact-failed', 'Could not create “{{title}}”', { title })
    : t('step.artifact', 'Creating “{{title}}”', { title });
};

const searchLabel = (running: boolean, t: TFunction<'assistant'>) =>
  running
    ? t('step.searching', 'Looking up how to do it')
    : t('step.search', 'Looked up how to do it');

const stepLabel = (step: Step, t: TFunction<'assistant'>) => {
  if (step.tool === 'searchApi') return searchLabel(step.status === 'running', t);

  if (step.tool === 'createArtifact') return artifactStepLabel(step, t);

  if (step.tool === 'loadSkill') {
    return step.status === 'failed'
      ? t('step.skill-failed', 'Could not read the {{name}} skill', { name: step.name })
      : t('step.skill', 'Read the {{name}} skill', { name: step.name });
  }

  if (step.tool === 'runCode') {
    return {
      running: t('step.code-running', 'Running a program'),
      done: t('step.code-done', 'Ran a program'),
      failed: t('step.code-failed', 'The program failed'),
    }[step.status];
  }

  const name = step.title ?? procedureLabel(step.name);

  return step.status === 'failed' ? t('step.failed', 'Could not: {{name}}', { name }) : name;
};

const Json = ({ label, value }: { label: string; value: unknown }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <pre className="max-h-48 overflow-auto rounded-md bg-muted p-2 font-mono text-xs whitespace-pre-wrap">
      {JSON.stringify(value, null, 2)}
    </pre>
  </div>
);

const LineTrigger = ({ className, children }: { className?: string; children: ReactNode }) => (
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

const Node = ({ icon: Glyph, tone }: { icon: Icon; tone?: 'failed' | 'running' }) => (
  <span className="absolute top-1 -left-5.5 flex size-4 items-center justify-center rounded-full bg-background">
    <Glyph
      aria-hidden
      className={cn(
        'size-3.5',
        tone === 'failed' && 'text-destructive-text',
        tone === 'running' && 'animate-spin text-primary',
      )}
    />
  </span>
);

const StepRow = ({ step }: { step: Step }) => {
  const { t } = useTranslation('assistant');
  const failed = step.status === 'failed';
  const running = step.status === 'running';

  return (
    <li className="relative">
      <Node
        icon={STATUS_ICONS[step.status]}
        tone={failed ? 'failed' : running ? 'running' : undefined}
      />
      <Collapsible>
        <LineTrigger>
          <span className={cn('min-w-0 truncate', failed && 'text-destructive-text')}>
            {stepLabel(step, t)}
          </span>
          <Collapsible.TriggerIcon className="size-2.5 shrink-0 opacity-0 group-hover/line:opacity-100 in-data-panel-open:opacity-100" />
        </LineTrigger>
        <Collapsible.Panel>
          <div className="flex flex-col gap-2 pt-1 pb-2">
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

type TraceItem =
  | { key: string; step: Step }
  | { key: string; searches: Step[] }
  | { key: string; intent: string };

const traceOf = (rows: ActivityRow[]) => {
  const items: TraceItem[] = [];

  for (const row of rows) {
    if (row.kind === 'thinking') {
      intentsOf(row.text).forEach((intent, at) => items.push({ key: `${row.key}-${at}`, intent }));

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

const SearchesRow = ({ searches }: { searches: Step[] }) => {
  const { t } = useTranslation('assistant');
  const running = searches.some((step) => step.status === 'running');

  return (
    <li className="relative">
      <Node icon={running ? IconLoader2 : IconSearch} tone={running ? 'running' : undefined} />
      <Collapsible>
        <LineTrigger>
          <span className="min-w-0 truncate">{searchLabel(running, t)}</span>
          {searches.length > 1 && (
            <span className="shrink-0 text-xs text-muted-foreground/70">
              {t('step.search-count', '{{count}} searches', { count: searches.length })}
            </span>
          )}
          <Collapsible.TriggerIcon className="size-2.5 shrink-0 opacity-0 group-hover/line:opacity-100 in-data-panel-open:opacity-100" />
        </LineTrigger>
        <Collapsible.Panel>
          <ul className="flex flex-col gap-1 pb-2 font-mono text-xs text-muted-foreground">
            {searches.map((step) => (
              <li key={step.key}>{step.query ?? t('step.search-any', 'What it can do')}</li>
            ))}
          </ul>
        </Collapsible.Panel>
      </Collapsible>
    </li>
  );
};

const IntentRow = ({ intent }: { intent: string }) => (
  <li className="relative">
    <Node icon={IconBulb} />
    <p className="truncate py-1 text-sm text-muted-foreground/80 italic">{intent}</p>
  </li>
);

export type ActivityRow = Extract<TranscriptRow, { kind: 'thinking' | 'steps' }>;

const stoppedUnlessLive = (steps: Step[], live: boolean, stopped: string) =>
  live
    ? steps
    : steps.map((step) =>
        step.status === 'running' ? { ...step, status: 'failed' as const, error: stopped } : step,
      );

const labelOf = (row: ActivityRow, t: TFunction<'assistant'>) => {
  if (row.kind === 'thinking') return intentsOf(row.text).at(-1);

  const step = row.steps.at(-1);

  if (!step || step.name === 'callApi') return undefined;

  return stepLabel({ ...step, status: 'running' }, t);
};

const liveLabel = (rows: ActivityRow[], t: TFunction<'assistant'>) =>
  rows
    .toReversed()
    .map((row) => labelOf(row, t))
    .find(Boolean) ?? t('working', 'Working on it…');

const StepDots = ({ steps }: { steps: Step[] }) => {
  const shown = steps.slice(-MAX_DOTS);

  return (
    <span aria-hidden className="flex shrink-0 items-center gap-0.5">
      {steps.length > MAX_DOTS && (
        <span className="mr-0.5 text-xs tabular-nums">+{steps.length - MAX_DOTS}</span>
      )}
      {shown.map((step) => (
        <span
          key={step.key}
          className={cn(
            'size-1.5 rounded-full bg-muted-foreground/35 animate-in fade-in zoom-in',
            step.status === 'failed' && 'bg-destructive',
            step.status === 'running' && 'animate-pulse bg-primary',
          )}
        />
      ))}
    </span>
  );
};

export const RunTrace = ({ rows, live }: { rows: ActivityRow[]; live: boolean }) => {
  const { t } = useTranslation('assistant');
  const stopped = t('step.stopped', 'Stopped');

  const shown = rows.map((row) =>
    row.kind === 'steps' ? { ...row, steps: stoppedUnlessLive(row.steps, live, stopped) } : row,
  );

  const steps = shown.flatMap((row) => (row.kind === 'steps' ? row.steps : []));
  const failed = steps.filter((step) => step.status === 'failed').length;

  if (!steps.length && !(live && rows.length)) return null;

  return (
    <Collapsible className="flex flex-col">
      <LineTrigger className="w-auto self-start">
        {live ? (
          <ThinkingLine label={liveLabel(shown, t)} />
        ) : (
          <>
            <Collapsible.TriggerIcon className="size-2.5 shrink-0" />
            <span className="shrink-0">
              {t('steps', {
                count: steps.length,
                defaultValue_one: '{{count}} step',
                defaultValue_other: '{{count}} steps',
              })}
            </span>
          </>
        )}
        {steps.length > 0 && <StepDots steps={steps} />}
        {failed > 0 && (
          <span className="shrink-0 text-xs text-destructive-text">
            {t('steps-failed', '· {{count}} failed', { count: failed })}
          </span>
        )}
      </LineTrigger>
      <Collapsible.Panel>
        <ol className="mt-1 mb-1 ml-2 flex flex-col border-l pl-4 animate-in fade-in slide-in-from-top-1">
          {traceOf(shown).map((item) => {
            if ('intent' in item) return <IntentRow key={item.key} intent={item.intent} />;

            if ('searches' in item) return <SearchesRow key={item.key} searches={item.searches} />;

            return <StepRow key={item.key} step={item.step} />;
          })}
        </ol>
      </Collapsible.Panel>
    </Collapsible>
  );
};
