import { type Db, newId } from '@erxes/core-db';
import { z } from 'zod';
import { connectedIntegrations, INTEGRATION_ACTIONS } from '~/modules/integrations/actions';
import { INTEGRATIONS } from '~/modules/integrations/registry';
import { type ApiProcedure, inputSchemaOf } from './catalog';
import { bounded, describeError, refusal } from './results';

/** An action of a connected app (`github.createIssue`), run by its automation handler. */
export interface IntegrationProcedure extends ApiProcedure {
  integration: string;
}

const JsonObject = z.looseObject({ properties: z.record(z.string(), z.unknown()).default({}) });

const withConnection = (
  schema: Record<string, unknown>,
  name: string,
  choices: { value: string; label: string }[],
) => {
  const object = JsonObject.parse(schema);

  return {
    ...object,
    properties: {
      ...object.properties,
      connection: {
        type: 'string',
        enum: choices.map((choice) => choice.value),
        description: `The ${name} connection: ${choices.map((choice) => `${choice.value} (${choice.label})`).join(', ')}. Leave it out for your own, else the organisation's.`,
      },
    },
  };
};

/** The actions of the apps the caller has a connection to: their own, or one their role manages. */
export const integrationProcedures = async (client: Db): Promise<IntegrationProcedure[]> => {
  const connected = await connectedIntegrations(client);

  return INTEGRATIONS.flatMap((integration) => {
    const choices = connected.get(integration.key);

    if (!integration.keys || !choices?.length) return [];

    return (integration.actions ?? []).map((action) => ({
      name: `${integration.key}.${action.key}`,
      integration: integration.key,
      method: 'POST',
      path: '',
      summary: `${integration.name}: ${action.label}`,
      description: action.description,
      input: withConnection(inputSchemaOf(action.input), integration.name, choices),
      changes: true,
      denied: false,
    }));
  });
};

const ACTIONS = new Map(INTEGRATION_ACTIONS.map((action) => [action.type, action]));

/** Runs the action's automation handler, which opens the caller's own connection first. */
export const runIntegrationAction = (
  orgId: string,
  name: string,
  input: Record<string, unknown>,
) => {
  const action = ACTIONS.get(name);

  if (!action || !('call' in action)) {
    return Promise.resolve(refusal('UNKNOWN_PROCEDURE', `No procedure is named ${name}`));
  }

  return action
    .call({
      orgId,
      automation: { id: name, name: 'Assistant' },
      run: { id: newId(), depth: 0 },
      step: { id: name },
      subject: null,
      input,
      context: {},
    })
    .then((result) => bounded(result), describeError);
};
