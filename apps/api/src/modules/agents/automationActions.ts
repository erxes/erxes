import { type ActionInfo, catalogCategory, STEP_ONLY_ACTIONS } from '@erxes/core-contract';
import { enterScope, runAs, withOrg } from '@erxes/core-db';
import { z } from 'zod';
import { fromDatabase } from '~/http/errors';
import { withRunCause } from '~/lib/causation';
import { bounded, describeError, refusal } from '~/modules/assistant/tools/results';
import { coreAction } from '~/modules/automations/actions/catalog';
import type { CallContext } from '~/modules/automations/actions/context';
import { pluginForAction, runPluginAction } from '~/modules/automations/actions/plugin';
import { automationCatalog } from '~/modules/automations/automationCatalog';
import { actionText, ranked } from '~/modules/automations/catalogSearch';
import { actionProblems } from '~/modules/automations/definitions';
import { type AutomationStepScope, callContextOf } from './automationStep';
import { agentTool } from './tool';

const SEARCH_LIMIT = 10;

const SEARCH_MAX = 30;

/** Whether a step that chose `tools` may run `action`: its category or itself, or all when none. */
const allows = (tools: string[], action: ActionInfo) =>
  tools.length === 0 || tools.includes(catalogCategory(action)) || tools.includes(action.type);

const offeredIn = (step: AutomationStepScope, actions: ActionInfo[]) =>
  actions.filter(
    (action) => !STEP_ONLY_ACTIONS.has(action.type) && allows(step.settings.tools, action),
  );

const catalogAs = (step: AutomationStepScope) =>
  enterScope(step.member, step.orgId, () => withOrg(step.orgId, automationCatalog));

const describe = (action: ActionInfo) => ({
  action: action.type,
  label: action.label,
  description: action.description,
  app: action.integrationName ?? (action.source === 'core' ? null : action.source),
  needsRecord: action.subject,
  fields: action.fields.map((field) => ({
    key: field.key,
    label: field.label,
    type: field.type,
    required: field.required,
    ...(field.options ? { options: field.options } : {}),
    ...(field.description ? { description: field.description } : {}),
  })),
  outputs: action.outputs.map((output) => output.key),
});

const searchActions = async (step: AutomationStepScope, query: string, limit: number) => {
  const found = ranked(offeredIn(step, (await catalogAs(step)).actions), query, actionText);

  return { actions: found.slice(0, limit).map(describe), more: Math.max(0, found.length - limit) };
};

/** The action's input checked as a saved step's is, then its context; else why it can't run. */
const prepare = async (
  step: AutomationStepScope,
  type: string,
  input: Record<string, unknown>,
  call: string,
) =>
  enterScope(step.member, step.orgId, () =>
    withOrg(step.orgId, async (tx) => {
      const catalog = await automationCatalog(tx);
      const info = catalog.actions.find((action) => action.type === type);

      if (STEP_ONLY_ACTIONS.has(type) || (info && !offeredIn(step, [info]).length))
        return refusal(
          'ACTION_NOT_ALLOWED',
          `This step doesn't let you use ${info?.label ?? type}`,
        );

      const ctx = await callContextOf(tx, step, call, input);

      const problems = actionProblems(
        { id: step.stepId, type: 'action', action: type, input },
        catalog,
        ctx.subject?.type ?? null,
        step.trigger,
      );

      if (problems.length) return refusal('INVALID_STEP_INPUT', problems.join('; '), { problems });

      return { ok: true as const, ctx };
    }),
  );

const execute = async (step: AutomationStepScope, type: string, ctx: CallContext) => {
  const action = coreAction(type);

  const cause = {
    runId: ctx.run.id,
    automationId: ctx.automation.id,
    automationName: ctx.automation.name,
    depth: ctx.run.depth,
  };

  if (action && 'run' in action)
    return withOrg(step.orgId, (tx) =>
      withRunCause(cause, () => runAs(step.member, () => action.run({ ...ctx, tx }))).catch(
        (error: unknown) => {
          throw fromDatabase(error);
        },
      ),
    );

  if (action) return action.call(ctx);

  const plugin = await withOrg(step.orgId, (tx) => pluginForAction(tx, type));

  return runPluginAction(ctx, plugin, type);
};

const runAction = async (
  step: AutomationStepScope,
  type: string,
  input: Record<string, unknown>,
  call: string,
) => {
  const prepared = await prepare(step, type, input, call);

  if (!prepared.ok) return prepared;

  return enterScope(step.member, step.orgId, () => execute(step, type, prepared.ctx)).then(
    bounded,
    describeError,
  );
};

/** Tools that run the automation actions the step allows, as a step of the run would. */
export const actionTools = (step: AutomationStepScope) => [
  agentTool({
    name: 'searchActions',
    description:
      'Find the automation actions you can run: send an email, notify team members, send to a web address, change the record, and every connected app’s (Telegram, GitHub, Facebook Pages, Google Sheets, Stripe…) and plugin’s. Search with plain words, or leave the query empty to list them. Returns each with its fields.',
    input: z.object({
      query: z.string().trim().max(200).optional(),
      limit: z.int().min(1).max(SEARCH_MAX).optional(),
    }),
    execute: ({ query, limit }) => searchActions(step, query ?? '', limit ?? SEARCH_LIMIT),
  }),
  agentTool({
    name: 'runAction',
    description:
      'Run one automation action from searchActions, with its fields as input: required fields filled, a select or connection field one of its options, members and tags by id. It acts on the record this automation run is about.',
    input: z.object({
      action: z
        .string()
        .min(3)
        .max(200)
        .describe('The action from searchActions, e.g. "core.note.add"'),
      input: z
        .record(z.string(), z.unknown())
        .optional()
        .describe('The fields by key, e.g. { "body": "Called back today" }'),
    }),
    execute: ({ action, input }, { callId }) => runAction(step, action, input ?? {}, callId),
  }),
];
