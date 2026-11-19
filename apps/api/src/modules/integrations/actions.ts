import { type ActionInfo, type EventTypeInfo, LIST_MAX } from '@erxes/core-contract';
import { type Db, integrationPrograms, integrations } from '@erxes/core-db';
import { and, asc, eq } from 'drizzle-orm';
import { type CallContext, idempotencyKey } from '~/modules/automations/actions/context';
import type { LoadedProgram } from './programs.service';
import { runIntegrationProgram } from './sandbox';

export const INTEGRATION_NAMESPACE = 'integrations';

export const isIntegrationType = (type: string) => type.startsWith(`${INTEGRATION_NAMESPACE}.`);

export const integrationType = (integrationKey: string, key: string) =>
  `${INTEGRATION_NAMESPACE}.${integrationKey}.${key}`;

const programsOfKind = (client: Db, kind: 'action' | 'incoming') =>
  client
    .select({ integration: integrations, program: integrationPrograms })
    .from(integrationPrograms)
    .innerJoin(integrations, eq(integrations.id, integrationPrograms.integrationId))
    .where(eq(integrationPrograms.kind, kind))
    .orderBy(asc(integrations.key), asc(integrationPrograms.key))
    .limit(LIST_MAX);

export const integrationActions = async (client: Db): Promise<ActionInfo[]> =>
  (await programsOfKind(client, 'action')).map(({ integration, program }) => ({
    type: integrationType(integration.key, program.key),
    label: program.label,
    description: program.description,
    source: integration.name,
    subject: null,
    fields: program.fields,
    outputs: program.outputs,
  }));

export const integrationEventTypes = async (client: Db): Promise<EventTypeInfo[]> =>
  (await programsOfKind(client, 'incoming')).flatMap(({ integration, program }) =>
    program.events.map((event) => ({
      type: integrationType(integration.key, event.key),
      label: event.label,
      description: null,
      source: integration.name,
      subject: null,
      record: null,
      fields: event.fields,
    })),
  );

export const integrationForAction = async (client: Db, type: string): Promise<LoadedProgram> => {
  const [, integrationKey = '', key = ''] = type.split('.');

  const [loaded] = await client
    .select({ integration: integrations, program: integrationPrograms })
    .from(integrationPrograms)
    .innerJoin(integrations, eq(integrations.id, integrationPrograms.integrationId))
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

export const runIntegrationAction = async (ctx: CallContext, loaded: LoadedProgram) => {
  const run = await runIntegrationProgram(loaded, {
    input: ctx.input,
    idempotencyKey: idempotencyKey(ctx),
  });

  if (!run.ok) throw new Error(`${loaded.program.label}: ${run.message}`);

  return run.result;
};
