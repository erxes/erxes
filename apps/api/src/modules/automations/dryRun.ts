import type { AutomationDefinition, AutomationStep, DryRunStep } from '@erxes/core-contract';
import type { ContentType, Db } from '@erxes/core-db';
import { notFound } from '~/http/errors';
import { findAutomation } from './automations.service';
import { evaluateGroup } from './conditions';
import { type Cursor, enterArm, nextCursor, splitPath, stepAt } from './cursor';
import { automationCatalog } from './definitions';
import { subjectOf } from './subjects';
import { render } from './templates';

/** The most steps a dry run follows (a loop guard). */
const MAX_DRY_STEPS = 200;

interface DryRun {
  definition: AutomationDefinition;
  actions: Awaited<ReturnType<typeof automationCatalog>>['actions'];
  context: Record<string, unknown>;
  hasSubject: boolean;
  /** Seeds the split's choice, so the same record takes the same path. */
  seed: string;
  assumeEventHappens: boolean;
}

/** What one step would do. */
interface Probe {
  outcome: string;
  next: Cursor | null;
  input?: unknown;
  problem?: string | null;
  output?: unknown;
}

const labelled = (index: number, label: string | null | undefined) =>
  `${index + 1}${label ? ` (${label})` : ''}`;

const probeAction = (step: Extract<AutomationStep, { type: 'action' }>, dry: DryRun) => {
  const action = dry.actions.find((item) => item.type === step.action);
  let input: unknown = null;
  let problem: string | null = null;

  try {
    input = render(step.input, dry.context);
  } catch (error) {
    problem = error instanceof Error ? error.message : String(error);
  }

  if (!action) problem = `Unknown action ${step.action}`;
  else if (action.subject && !dry.hasSubject)
    problem = 'Needs a customer or company: pick one to test with';

  return { outcome: `Would run “${action?.label ?? step.action}”`, input, problem };
};

const probeWait = (step: AutomationStep, dry: DryRun) => {
  if (step.type === 'delay')
    return step.until
      ? `Would wait until ${String(render(step.until, dry.context))}`
      : `Would wait ${step.amount} ${step.unit}`;

  if (step.type !== 'wait_for') return null;

  return dry.assumeEventHappens
    ? `Would wait for ${step.event} (up to ${step.amount} ${step.unit}); assumed it happens`
    : `Would wait for ${step.event} up to ${step.amount} ${step.unit}; assumed it doesn't`;
};

/** Which arm a branch, switch or split takes, or null for other steps. */
const probeArm = (step: AutomationStep, cursor: Cursor, dry: DryRun): Probe | null => {
  const { steps } = dry.definition;

  if (step.type === 'branch') {
    const matched = evaluateGroup(step.conditions, dry.context);

    return {
      outcome: matched
        ? 'Conditions hold: “if it matches” path'
        : 'Conditions don’t hold: “otherwise” path',
      output: { matched },
      next: enterArm(steps, cursor, matched ? 'then' : 'else'),
    };
  }

  if (step.type === 'switch') {
    const chosen = step.cases.findIndex((item) => evaluateGroup(item.conditions, dry.context));
    const match = step.cases[chosen];

    return {
      outcome: match ? `Case ${labelled(chosen, match.label)}` : 'Otherwise',
      output: { case: match ? chosen : 'otherwise' },
      next: enterArm(steps, cursor, match ? `case:${chosen}` : 'otherwise'),
    };
  }

  if (step.type === 'split') {
    const path = splitPath(dry.seed, step);

    return {
      outcome: `Path ${labelled(path, step.paths[path]?.label)} (chosen at random by weight)`,
      output: { path },
      next: enterArm(steps, cursor, `path:${path}`),
    };
  }

  return null;
};

const probeStep = (step: AutomationStep, cursor: Cursor, dry: DryRun): Probe => {
  const next = nextCursor(dry.definition.steps, cursor);

  if (step.type === 'action') return { ...probeAction(step, dry), next };

  const wait = probeWait(step, dry);

  if (wait !== null)
    return {
      outcome: wait,
      next,
      output: step.type === 'wait_for' ? { matched: dry.assumeEventHappens } : null,
    };

  return probeArm(step, cursor, dry) ?? { outcome: 'Stops here', next: null };
};

const triggerConditions = (trigger: AutomationDefinition['trigger']) => {
  if (trigger.kind === 'event' || trigger.kind === 'date') return trigger.conditions;

  return trigger.audience?.conditions;
};

/** Follows the steps from the first, recording what each would do. */
const trace = (dry: DryRun) => {
  const { definition } = dry;
  const lines: DryRunStep[] = [];

  const outputs: Record<string, { output: unknown }> = {};
  let cursor: Cursor | null = [0];

  for (let count = 0; cursor && count < MAX_DRY_STEPS; count += 1) {
    const step = stepAt(definition.steps, cursor);

    if (!step) break;

    if (definition.goal && evaluateGroup(definition.goal, dry.context)) {
      lines.push({
        stepId: step.id,
        type: 'goal',
        outcome: 'The goal is met: the record leaves here',
        input: null,
        problem: null,
      });
      break;
    }

    const probe = probeStep(step, cursor, dry);

    outputs[step.id] = { output: probe.output ?? null };
    dry.context = { ...dry.context, steps: { ...outputs } };
    lines.push({
      stepId: step.id,
      type: step.type === 'action' ? step.action : step.type,
      outcome: probe.outcome,
      input: probe.input ?? null,
      problem: probe.problem ?? null,
    });
    cursor = probe.next;
  }

  return lines;
};

/**
 * A dry run of the working copy for one record: which way each branch goes,
 * what each action would get (placeholders filled), where it would wait.
 * Nothing is changed.
 */
export const testAutomation = async (
  client: Db,
  id: string,
  input: {
    subject?: { type: ContentType; id: string };
    payload?: Record<string, unknown>;
    assumeEventHappens: boolean;
  },
) => {
  const row = await findAutomation(client, id);
  const { definition } = row;
  const { trigger } = definition;

  const subject = input.subject
    ? await subjectOf(client, input.subject.type, input.subject.id)
    : null;

  if (input.subject && !subject)
    throw notFound(input.subject.type === 'customer' ? 'Customer' : 'Company');

  const context = {
    event: {
      type: trigger.kind === 'event' ? trigger.event : trigger.kind,
      occurredAt: new Date().toISOString(),
      payload: input.payload ?? {},
      subject: input.subject ?? null,
    },
    subject,
    steps: {},
  };

  const dry: DryRun = {
    definition,
    actions: (await automationCatalog(client)).actions,
    context,
    hasSubject: subject !== null,
    seed: `test:${input.subject?.id ?? 'none'}`,
    assumeEventHappens: input.assumeEventHappens,
  };

  const goalMetAtStart = Boolean(definition.goal && evaluateGroup(definition.goal, context));
  const steps = trace(dry);

  return {
    triggerMatches: evaluateGroup(triggerConditions(trigger), dry.context),
    goalMetAtStart,
    trace: steps,
  };
};
