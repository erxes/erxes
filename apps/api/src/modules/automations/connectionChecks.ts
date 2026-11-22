import type { ActionInfo, AutomationDefinition } from '@erxes/core-contract';
import { type Db, integrationConnections } from '@erxes/core-db';
import { inArray } from 'drizzle-orm';
import { INTEGRATIONS } from '~/modules/integrations/registry';
import { eachStep } from './cursor';

interface Chosen {
  step: string;
  integration: string;
  value: unknown;
}

const nameOf = (key: string) =>
  INTEGRATIONS.find((integration) => integration.key === key)?.name ?? key;

const picksOf = (definition: AutomationDefinition, actions: ActionInfo[]) => {
  const picks: Chosen[] = [];

  eachStep(definition.steps, (step) => {
    if (step.type !== 'action') return;

    const action = actions.find((item) => item.type === step.action);

    if (!action) return;

    for (const field of action.fields) {
      const value = step.input[field.key];

      if (field.integration && value !== undefined && value !== null && value !== '')
        picks.push({
          step: `Step ${step.id} (${action.label})`,
          integration: field.integration,
          value,
        });
    }
  });

  return picks;
};

export const connectionProblems = async (
  client: Db,
  definition: AutomationDefinition,
  actions: ActionInfo[],
) => {
  const picks = picksOf(definition, actions);
  const ids = picks.flatMap((pick) => (typeof pick.value === 'string' ? [pick.value] : []));

  const rows = ids.length
    ? await client
        .select({
          id: integrationConnections.id,
          key: integrationConnections.key,
          status: integrationConnections.status,
        })
        .from(integrationConnections)
        .where(inArray(integrationConnections.id, ids))
    : [];

  const byId = new Map(rows.map((row) => [row.id, row]));

  return picks.flatMap((pick) => {
    const row = typeof pick.value === 'string' ? byId.get(pick.value) : undefined;
    const name = nameOf(pick.integration);

    if (row?.key !== pick.integration) return [`${pick.step}: pick a ${name} connection`];

    return row.status === 'active' ? [] : [`${pick.step}: the ${name} connection is off`];
  });
};
