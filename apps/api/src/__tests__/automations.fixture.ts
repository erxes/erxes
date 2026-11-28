import type { AutomationDefinition } from '@erxes/core-contract';
import type { z } from 'zod';
import { useTwoOrgs } from './support';

/** What a member sends: defaults such as `reentry` may be left out. */
export type DefinitionInput = z.input<typeof AutomationDefinition>;

export type StepInput = DefinitionInput['steps'][number];

/** Runs `steps` for each new customer called `firstName`. */
export const forCustomer = (firstName: string, steps: StepInput[]): DefinitionInput => ({
  trigger: {
    kind: 'event',
    event: 'core.customer.created',
    conditions: {
      match: 'all',
      rules: [{ path: 'subject.firstName', op: 'eq', value: firstName }],
    },
  },
  steps,
});

/** An action step. */
export const action = (id: string, type: string, input: Record<string, unknown>): StepInput => ({
  id,
  type: 'action',
  action: type,
  input,
});

/** Acme and Globex (`useTwoOrgs`), with helpers to start automations as Acme's owner and read their runs. */
export const useAutomations = () => {
  const t = useTwoOrgs();

  /** Creates and activates an automation; returns its id. */
  const active = async (name: string, definition: DefinitionInput) => {
    const { id } = await t.owner().automations.create({ name, definition });

    await t.owner().automations.activate({ id });

    return id;
  };

  const runsOf = async (id: string) => (await t.owner().automations.runs({ id, limit: 100 })).data;

  /** The ids of the steps a run went through. */
  const stepsOf = async (runId: string) =>
    (await t.owner().automations.run({ runId })).steps.map((step) => step.stepId);

  /** The automation's only run, with its steps. */
  const onlyRun = async (id: string) => {
    const [run] = await runsOf(id);

    if (!run) throw new Error('no run started');

    return t.owner().automations.run({ runId: run.id });
  };

  /** Each step of the automation's only run, by id, with its output. */
  const outputsOf = async (id: string) =>
    Object.fromEntries((await onlyRun(id)).steps.map((step) => [step.stepId, step.output]));

  return { ...t, active, runsOf, stepsOf, onlyRun, outputsOf };
};
