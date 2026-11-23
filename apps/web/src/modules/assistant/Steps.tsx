import {
  IconAlertTriangle,
  IconBrain,
  IconCheck,
  IconLoader2,
  IconSearch,
  type Icon,
} from '@tabler/icons-react';
import { Button, Collapsible, cn } from 'erxes-ui';
import type { TFunction } from 'i18next';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { Step, StepStatus, TranscriptRow } from './transcriptRows';

const STATUS_ICONS: Record<StepStatus, Icon> = {
  running: IconLoader2,
  done: IconCheck,
  failed: IconAlertTriangle,
};

const Titled = z.object({ title: z.string() });

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

  const name = step.title ?? step.name;

  return step.status === 'failed' ? t('step.failed', 'Could not: {{name}}', { name }) : name;
};

const Json = ({ value, className }: { value: unknown; className?: string }) => (
  <pre
    className={cn(
      'max-h-48 overflow-auto rounded-md bg-muted p-2 font-mono text-xs whitespace-pre-wrap',
      className,
    )}
  >
    {JSON.stringify(value, null, 2)}
  </pre>
);

const LabeledJson = ({ label, value }: { label: string; value: unknown }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <Json value={value} />
  </div>
);

const FoldTrigger = ({ className, children }: { className?: string; children: ReactNode }) => (
  <Collapsible.Trigger
    render={<Button variant="ghost" size="sm" tone="muted" className={className} />}
  >
    <Collapsible.TriggerIcon className="size-3" />
    {children}
  </Collapsible.Trigger>
);

const StepRow = ({ step }: { step: Step }) => {
  const { t } = useTranslation('assistant');
  const failed = step.status === 'failed';

  const Icon =
    step.tool === 'searchApi' && step.status === 'done' ? IconSearch : STATUS_ICONS[step.status];

  return (
    <li>
      <Collapsible>
        <FoldTrigger className="w-full justify-start">
          <Icon
            aria-hidden
            className={cn(
              'size-3.5 shrink-0',
              failed && 'text-destructive-text',
              step.status === 'running' && 'animate-spin',
            )}
          />
          <span
            className={cn('min-w-0 flex-1 truncate text-left', failed && 'text-destructive-text')}
          >
            {stepLabel(step, t)}
          </span>
        </FoldTrigger>
        <Collapsible.Panel>
          <div className="flex flex-col gap-2 py-1 pl-8">
            {step.error && <p className="text-sm text-destructive-text">{step.error}</p>}
            {step.title && (
              <code className="font-mono text-xs text-muted-foreground">{step.name}</code>
            )}
            <LabeledJson label={t('step.input', 'Sent')} value={step.input} />
            {step.output !== null && (
              <LabeledJson label={t('step.output', 'Returned')} value={step.output} />
            )}
          </div>
        </Collapsible.Panel>
      </Collapsible>
    </li>
  );
};

type StepItem = { key: string; step: Step } | { key: string; searches: Step[] };

const foldSearches = (steps: Step[]) => {
  const items: StepItem[] = [];

  for (const step of steps) {
    const last = items.at(-1);

    if (step.tool !== 'searchApi') items.push({ key: step.key, step });
    else if (last && 'searches' in last) last.searches.push(step);
    else items.push({ key: step.key, searches: [step] });
  }

  return items;
};

const SearchesRow = ({ searches }: { searches: Step[] }) => {
  const { t } = useTranslation('assistant');
  const running = searches.find((step) => step.status === 'running');
  const Icon = running ? IconLoader2 : IconSearch;

  return (
    <li>
      <Collapsible>
        <FoldTrigger className="w-full justify-start">
          <Icon aria-hidden className={cn('size-3.5 shrink-0', running && 'animate-spin')} />
          <span className="min-w-0 flex-1 truncate text-left">
            {searchLabel(running !== undefined, t)}
          </span>
          {searches.length > 1 && (
            <span className="text-xs text-muted-foreground">
              {t('step.search-count', '{{count}} searches', { count: searches.length })}
            </span>
          )}
        </FoldTrigger>
        <Collapsible.Panel>
          <ul className="flex flex-col gap-1 py-1 pl-8 text-xs text-muted-foreground">
            {searches.map((step) => (
              <li key={step.key}>{step.query ?? t('step.search-any', 'What it can do')}</li>
            ))}
          </ul>
        </Collapsible.Panel>
      </Collapsible>
    </li>
  );
};

export type ActivityRow = Extract<TranscriptRow, { kind: 'thinking' | 'steps' }>;

const stoppedUnlessLive = (steps: Step[], live: boolean, stopped: string) =>
  live
    ? steps
    : steps.map((step) =>
        step.status === 'running' ? { ...step, status: 'failed' as const, error: stopped } : step,
      );

const activityLabel = (
  rows: ActivityRow[],
  steps: Step[],
  live: boolean,
  t: TFunction<'assistant'>,
) => {
  const current = steps.findLast((step) => step.status === 'running');

  if (current) return stepLabel(current, t);

  if (live && rows.at(-1)?.kind === 'thinking') return t('thinking.now', 'Thinking…');

  if (live) return t('working', 'Working on it…');

  if (!steps.length) return t('thinking.done', 'Thought');

  return t('steps', {
    count: steps.length,
    defaultValue_one: '{{count}} step',
    defaultValue_other: '{{count}} steps',
  });
};

const ThoughtText = ({ text }: { text: string }) => (
  <li className="flex gap-2 py-1 pl-2">
    <IconBrain aria-hidden className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
    <p className="min-w-0 text-sm whitespace-pre-wrap text-muted-foreground">{text}</p>
  </li>
);

export const ActivityGroup = ({ rows, live }: { rows: ActivityRow[]; live: boolean }) => {
  const { t } = useTranslation('assistant');
  const stopped = t('step.stopped', 'Stopped');

  const shown = rows.map((row) =>
    row.kind === 'steps' ? { ...row, steps: stoppedUnlessLive(row.steps, live, stopped) } : row,
  );

  const steps = shown.flatMap((row) => (row.kind === 'steps' ? row.steps : []));
  const failed = steps.filter((step) => step.status === 'failed').length;
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <FoldTrigger className="-ml-2 max-w-full">
        {live && <IconLoader2 aria-hidden className="size-3.5 shrink-0 animate-spin" />}
        <span className="min-w-0 truncate">{activityLabel(rows, steps, live, t)}</span>
        {failed > 0 && (
          <span className="shrink-0 text-destructive-text">
            {t('steps-failed', '· {{count}} failed', { count: failed })}
          </span>
        )}
      </FoldTrigger>
      <Collapsible.Panel>
        <ul className="mt-1 ml-1.5 flex flex-col border-l pl-1">
          {shown.flatMap((row) =>
            row.kind === 'thinking'
              ? [<ThoughtText key={row.key} text={row.text} />]
              : foldSearches(row.steps).map((item) =>
                  'searches' in item ? (
                    <SearchesRow key={item.key} searches={item.searches} />
                  ) : (
                    <StepRow key={item.key} step={item.step} />
                  ),
                ),
          )}
        </ul>
      </Collapsible.Panel>
    </Collapsible>
  );
};
