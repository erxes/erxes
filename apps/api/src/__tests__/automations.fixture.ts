import type { AutomationDefinition } from '@erxes/core-contract';
import type { z } from 'zod';
import { useTwoOrgs } from './support';

/** What a member sends: defaults such as `reentry` may be left out. */
export type DefinitionInput = z.input<typeof AutomationDefinition>;

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

  return { ...t, active, runsOf, stepsOf };
};
