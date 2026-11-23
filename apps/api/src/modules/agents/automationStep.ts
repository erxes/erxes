import type { AutomationStep } from '@erxes/core-contract';
import { automationRuns, automations, type Db, withOrg } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { memberOf } from '~/http/auth';
import { fail, notFound } from '~/http/errors';
import { agentStepSettings } from '~/modules/automations/actions/agent';
import type { CallContext } from '~/modules/automations/actions/context';
import { eachStep } from '~/modules/automations/cursor';
import { definitionOf, subjectRefOf } from '~/modules/automations/runs';
import { subjectOf } from '~/modules/automations/subjects';
import type { AgentScope } from './agent';

/** A step's conversation is keyed `<run>-<step>`; ids hold no dash. */
const idsOf = (key: string) => {
  const at = key.indexOf('-');

  return { runId: key.slice(0, at), stepId: key.slice(at + 1) };
};

const stepInput = (steps: AutomationStep[], id: string) => {
  let input: Record<string, unknown> = {};

  eachStep(steps, (step) => {
    if (step.id === id && step.type === 'action') input = step.input;
  });

  return input;
};

const readStep = (orgId: string, runId: string, stepId: string) =>
  withOrg(orgId, async (tx) => {
    const [row] = await tx
      .select({
        version: automationRuns.version,
        automationId: automations.id,
        name: automations.name,
        activatedBy: automations.activatedBy,
      })
      .from(automationRuns)
      .innerJoin(automations, eq(automations.id, automationRuns.automationId))
      .where(eq(automationRuns.id, runId))
      .limit(1);

    if (!row) throw notFound('Automation run');

    const definition = await definitionOf(tx, row.automationId, row.version);

    if (!definition) throw notFound('Automation version');

    return { ...row, trigger: definition.trigger, input: stepInput(definition.steps, stepId) };
  });

/**
 * The automation step an agent conversation carries out: the member who turned the automation
 * on, whom it acts as, and what the step lets it use.
 */
export const automationStepOf = async (scope: AgentScope) => {
  const { runId, stepId } = idsOf(scope.key);
  const row = await readStep(scope.orgId, runId, stepId);
  const member = row.activatedBy ? await memberOf(scope.orgId, row.activatedBy) : null;

  if (!member) throw fail('UNAUTHORIZED', 'The member who turned this automation on is not active');

  return {
    orgId: scope.orgId,
    member,
    runId,
    stepId,
    automation: { id: row.automationId, name: row.name },
    trigger: row.trigger,
    settings: agentStepSettings(row.input),
  };
};

export type AutomationStepScope = Awaited<ReturnType<typeof automationStepOf>>;

/** What an action the agent runs gets: the run as it is now, keyed by the agent's tool call. */
export const callContextOf = async (
  tx: Db,
  step: AutomationStepScope,
  call: string,
  input: Record<string, unknown>,
) => {
  const [run] = await tx
    .select()
    .from(automationRuns)
    .where(eq(automationRuns.id, step.runId))
    .limit(1);

  if (!run) throw notFound('Automation run');

  const context: CallContext = {
    orgId: step.orgId,
    automation: step.automation,
    run: { id: run.id, depth: run.depth },
    step: { id: step.stepId },
    call,
    subject: subjectRefOf(run),
    input,
    context: { ...run.context, subject: await subjectOf(tx, run.subjectType, run.subjectId) },
  };

  return context;
};
