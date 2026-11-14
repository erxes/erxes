import {
  IconAlertTriangle,
  IconBan,
  IconBrain,
  IconCheck,
  IconClock,
  IconLoader2,
  IconSearch,
  type Icon,
} from '@tabler/icons-react';
import { Button, Collapsible, cn } from 'erxes-ui';
import type { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { Step, StepStatus } from './transcriptRows';

const STATUS_ICONS: Record<StepStatus, Icon> = {
  running: IconLoader2,
  waiting: IconClock,
  done: IconCheck,
  failed: IconAlertTriangle,
  declined: IconBan,
};

const Named = z.object({ name: z.string() });

const Titled = z.object({ title: z.string() });

const fileStepLabel = (step: Step, t: TFunction<'assistant'>) => {
  const name = Named.safeParse(step.output).data?.name;

  if (step.status === 'done' && name) return t('step.read-file', 'Read {{name}}', { name });

  return step.status === 'failed'
    ? t('step.read-file-failed', 'Could not read an attachment')
    : t('step.reading-file', 'Reading an attachment');
};

const artifactStepLabel = (step: Step, t: TFunction<'assistant'>) => {
  const title = Titled.safeParse(step.input).data?.title ?? '';

  return step.status === 'failed'
    ? t('step.artifact-failed', 'Could not create “{{title}}”', { title })
    : t('step.artifact', 'Creating “{{title}}”', { title });
};

const stepLabel = (step: Step, t: TFunction<'assistant'>) => {
  if (step.tool === 'searchApi') {
    return step.query
      ? t('step.search', 'Searched the API for “{{query}}”', { query: step.query })
      : t('step.search-any', 'Searched the API');
  }

  if (step.tool === 'readAttachment') return fileStepLabel(step, t);

  if (step.tool === 'createArtifact') return artifactStepLabel(step, t);

  if (step.tool === 'loadSkill') {
    return step.status === 'failed'
      ? t('step.skill-failed', 'Could not read the {{name}} skill', { name: step.name })
      : t('step.skill', 'Read the {{name}} skill', { name: step.name });
  }

  if (step.tool === 'runCode') {
    return {
      running: t('step.code-running', 'Running a program'),
      waiting: t('step.code-running', 'Running a program'),
      done: t('step.code-done', 'Ran a program'),
      failed: t('step.code-failed', 'The program failed'),
      declined: t('step.code-failed', 'The program failed'),
    }[step.status];
  }

  const labels: Record<StepStatus, string> = {
    running: t('step.running', 'Calling {{name}}', { name: step.name }),
    waiting: t('step.waiting', 'Waiting for approval: {{name}}', { name: step.name }),
    done: t('step.done', 'Called {{name}}', { name: step.name }),
    failed: t('step.failed', '{{name}} failed', { name: step.name }),
    declined: t('step.declined', 'Declined {{name}}', { name: step.name }),
  };

  return labels[step.status];
};

const Json = ({ label, value }: { label: string; value: unknown }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <pre className="max-h-48 overflow-auto rounded-md bg-muted p-2 font-mono text-xs whitespace-pre-wrap">
      {JSON.stringify(value, null, 2)}
    </pre>
  </div>
);

const StepRow = ({ step }: { step: Step }) => {
  const { t } = useTranslation('assistant');
  const failed = step.status === 'failed';

  const Icon =
    step.tool === 'searchApi' && step.status === 'done' ? IconSearch : STATUS_ICONS[step.status];

  return (
    <li>
      <Collapsible>
        <Collapsible.Trigger
          render={
            <Button variant="ghost" size="sm" tone="muted" className="w-full justify-start" />
          }
        >
          <Collapsible.TriggerIcon className="size-3" />
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
        </Collapsible.Trigger>
        <Collapsible.Panel>
          <div className="flex flex-col gap-2 py-1 pl-8">
            {step.error && <p className="text-sm text-destructive-text">{step.error}</p>}
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

export const StepsGroup = ({ steps }: { steps: Step[] }) => {
  const { t } = useTranslation('assistant');
  const active = steps.some((step) => step.status === 'running' || step.status === 'waiting');
  const failed = steps.filter((step) => step.status === 'failed').length;
  const [open, setOpen] = useState<boolean | null>(null);

  return (
    <Collapsible open={open ?? active} onOpenChange={setOpen}>
      <Collapsible.Trigger render={<Button variant="ghost" size="sm" tone="muted" />}>
        <Collapsible.TriggerIcon className="size-3" />
        {active && <IconLoader2 aria-hidden className="size-3.5 animate-spin" />}
        <span>
          {t('steps', {
            count: steps.length,
            defaultValue_one: '{{count}} step',
            defaultValue_other: '{{count}} steps',
          })}
        </span>
        {failed > 0 && (
          <span className="text-destructive-text">
            {t('steps-failed', '· {{count}} failed', { count: failed })}
          </span>
        )}
      </Collapsible.Trigger>
      <Collapsible.Panel>
        <ul className="mt-1 ml-3 flex flex-col border-l pl-1">
          {steps.map((step) => (
            <StepRow key={step.key} step={step} />
          ))}
        </ul>
      </Collapsible.Panel>
    </Collapsible>
  );
};

export const ThinkingBlock = ({ text, streaming }: { text: string; streaming: boolean }) => {
  const { t } = useTranslation('assistant');
  const [open, setOpen] = useState<boolean | null>(null);

  return (
    <Collapsible open={open ?? streaming} onOpenChange={setOpen}>
      <Collapsible.Trigger render={<Button variant="ghost" size="sm" tone="muted" />}>
        <Collapsible.TriggerIcon className="size-3" />
        <IconBrain aria-hidden className={cn('size-3.5', streaming && 'animate-pulse')} />
        <span>{streaming ? t('thinking.now', 'Thinking…') : t('thinking.done', 'Thought')}</span>
      </Collapsible.Trigger>
      <Collapsible.Panel>
        <p className="mt-1 ml-3 border-l pl-3 text-sm whitespace-pre-wrap text-muted-foreground">
          {text}
        </p>
      </Collapsible.Panel>
    </Collapsible>
  );
};
