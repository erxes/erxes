import type { TFunction } from 'i18next';
import { z } from 'zod';
import type { Step, TranscriptRow } from './transcriptRows';

export type ActivityRow = Extract<TranscriptRow, { kind: 'thinking' | 'steps' }>;

const HEADING = /^\s*\*\*(.+?)\*\*\s*$/gm;

const SENTENCE = /^(.+?[.!?])(?:\s|$)/;

const Titled = z.object({ title: z.string() });

export const intentsOf = (thought: string) => {
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

export const searchLabel = (running: boolean, t: TFunction<'assistant'>) =>
  running
    ? t('step.searching', 'Looking up how to do it')
    : t('step.search', 'Looked up how to do it');

export const stepLabel = (step: Step, t: TFunction<'assistant'>) => {
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

const labelOf = (row: ActivityRow, t: TFunction<'assistant'>) => {
  if (row.kind === 'thinking') return intentsOf(row.text).at(-1);

  const step = row.steps.at(-1);

  if (!step || step.name === 'callApi') return undefined;

  return stepLabel({ ...step, status: 'running' }, t);
};

export const liveLabel = (rows: ActivityRow[], t: TFunction<'assistant'>) =>
  rows
    .toReversed()
    .map((row) => labelOf(row, t))
    .find(Boolean) ?? t('working', 'Working on it…');
