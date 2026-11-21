import {
  type ActionInfo,
  CUSTOM_INTEGRATION_OWNER,
  customIntegrationRef,
  type EventTypeInfo,
  type IntegrationProgramRun,
  integrationType,
  LIST_MAX,
} from '@erxes/core-contract';
import {
  type Db,
  integrationAccounts,
  integrationPrograms,
  integrations,
  withOrg,
} from '@erxes/core-db';
import { and, asc, eq, like } from 'drizzle-orm';
import { customAccountInput } from './accountInput';
import { type CallContext, idempotencyKey } from '~/modules/automations/actions/context';
import { healedOutputs, inputProblem, saveOutputs } from './contract';
import { type LoadedProgram, loadedPrograms } from './programs.service';
import { type AccountValues, runIntegrationProgram } from './sandbox';
import { withoutAccount } from './stepAccounts';

const catalogOf = (client: Db, kind: 'action' | 'incoming') =>
  client
    .select({
      integrationKey: integrations.key,
      source: integrations.name,
      key: integrationPrograms.key,
      label: integrationPrograms.label,
      description: integrationPrograms.description,
      fields: integrationPrograms.fields,
      outputs: integrationPrograms.outputs,
      events: integrationPrograms.events,
    })
    .from(integrationPrograms)
    .innerJoin(integrations, eq(integrations.id, integrationPrograms.integrationId))
    .where(eq(integrationPrograms.kind, kind))
    .orderBy(asc(integrations.key), asc(integrationPrograms.key))
    .limit(LIST_MAX);

const integrationsWithAccounts = async (client: Db) =>
  new Set(
    (
      await client
        .selectDistinct({ integration: integrationAccounts.integration })
        .from(integrationAccounts)
        .where(like(integrationAccounts.integration, `${CUSTOM_INTEGRATION_OWNER}.%`))
    ).map((row) => row.integration),
  );

export const integrationActions = async (client: Db): Promise<ActionInfo[]> => {
  const withAccounts = await integrationsWithAccounts(client);

  return (await catalogOf(client, 'action')).map((program) => ({
    type: integrationType(program.integrationKey, program.key),
    label: program.label,
    description: program.description,
    source: program.source,
    subject: null,
    fields: [
      ...(withAccounts.has(customIntegrationRef(program.integrationKey))
        ? [customAccountInput(program.integrationKey)]
        : []),
      ...program.fields,
    ],
    outputs: program.outputs,
  }));
};

export const integrationEventTypes = async (client: Db): Promise<EventTypeInfo[]> =>
  (await catalogOf(client, 'incoming')).flatMap((program) =>
    program.events.map((event) => ({
      type: integrationType(program.integrationKey, event.key),
      label: event.label,
      description: null,
      source: program.source,
      subject: null,
      record: null,
      fields: event.fields,
    })),
  );

export const integrationForAction = async (client: Db, type: string) => {
  const [, integrationKey = '', key = ''] = type.split('.');

  const [loaded] = await loadedPrograms(client)
    .where(
      and(
        eq(integrations.key, integrationKey),
        eq(integrationPrograms.kind, 'action'),
        eq(integrationPrograms.key, key),
      ),
    )
    .limit(1);

  if (!loaded) throw new Error(`No action ${type} (was its integration removed?)`);

  return loaded;
};

export const runAction = async (
  orgId: string,
  loaded: LoadedProgram,
  globals: { input: Record<string, unknown>; idempotencyKey: string },
  account: AccountValues,
): Promise<IntegrationProgramRun> => {
  const problem = inputProblem(loaded.program, globals.input);

  if (problem) return { ok: false, code: 'INVALID_INPUT', message: problem };

  const run = await runIntegrationProgram(loaded, globals, account);
  const outputs = run.ok ? healedOutputs(loaded.program, run.result) : null;

  if (outputs) await withOrg(orgId, (tx) => saveOutputs(tx, loaded.program.id, outputs));

  return run;
};

export const runIntegrationAction = async (
  ctx: CallContext,
  loaded: LoadedProgram,
  account: AccountValues,
) => {
  const run = await runAction(
    ctx.orgId,
    loaded,
    { input: withoutAccount(ctx.input), idempotencyKey: idempotencyKey(ctx) },
    account,
  );

  if (!run.ok) throw new Error(`${loaded.program.label}: ${run.message}`);

  return run.result;
};
