import { INTEGRATION_PROGRAM_MAX, INTEGRATION_VERSION_WINDOW } from '@erxes/core-contract';
import {
  callerUserId,
  type Db,
  type IntegrationProgramDefinition,
  integrationPrograms,
  integrationProgramVersions,
  integrations,
  newId,
  requestOrgId,
} from '@erxes/core-db';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { hmacSha256 } from '~/lib/crypto';
import { lockKeys } from '~/lib/locks';
import { oneRow } from '~/lib/rows';
import { coreKey } from '~/lib/secrets';
import { appLink } from '~/modules/email/email';

type ProgramRow = typeof integrationPrograms.$inferSelect;

type ProgramKind = ProgramRow['kind'];

export const incomingSignature = (programId: string) =>
  hmacSha256(coreKey('erxes-integration-incoming-v1'), programId, 'base64url');

const incomingPath = (programId: string) =>
  `/core/v1/integrations/in/${programId}/${incomingSignature(programId)}`;

const withAddress = async (client: Db, rows: ProgramRow[]) => {
  const base = rows.some((row) => row.kind === 'incoming') ? await appLink(client, '') : '';

  return rows.map((row) => ({
    ...row,
    address: row.kind === 'incoming' ? `${base}${incomingPath(row.id)}` : null,
  }));
};

export const programsOf = async (client: Db, integrationId: string) =>
  withAddress(
    client,
    await client
      .select()
      .from(integrationPrograms)
      .where(eq(integrationPrograms.integrationId, integrationId))
      .orderBy(asc(integrationPrograms.kind), asc(integrationPrograms.key))
      .limit(INTEGRATION_PROGRAM_MAX),
  );

const findProgram = async (client: Db, id: string) => {
  const [row] = await client
    .select()
    .from(integrationPrograms)
    .where(eq(integrationPrograms.id, id))
    .limit(1);

  if (!row) throw notFound('Program');

  return row;
};

export const loadedPrograms = (client: Db) =>
  client
    .select({ integration: integrations, program: integrationPrograms })
    .from(integrationPrograms)
    .innerJoin(integrations, eq(integrations.id, integrationPrograms.integrationId));

export const findLoadedProgram = async (client: Db, id: string) => {
  const [loaded] = await loadedPrograms(client).where(eq(integrationPrograms.id, id)).limit(1);

  return loaded ?? null;
};

export type LoadedProgram = NonNullable<Awaited<ReturnType<typeof findLoadedProgram>>>;

export const loadProgram = async (client: Db, id: string) => {
  const loaded = await findLoadedProgram(client, id);

  if (!loaded) throw notFound('Program');

  return loaded;
};

const keepVersion = (client: Db, row: ProgramRow) =>
  client.insert(integrationProgramVersions).values({
    programId: row.id,
    version: row.version,
    definition: {
      label: row.label,
      description: row.description,
      fields: row.fields,
      outputs: row.outputs,
      events: row.events,
      code: row.code,
    },
    createdBy: callerUserId(),
  });

const oneWithAddress = async (client: Db, row: ProgramRow) =>
  oneRow(await withAddress(client, [row]));

const writeDefinition = async (
  client: Db,
  existing: ProgramRow,
  definition: IntegrationProgramDefinition,
) => {
  const row = oneRow(
    await client
      .update(integrationPrograms)
      .set({ ...definition, version: existing.version + 1, updatedAt: sql`now()` })
      .where(eq(integrationPrograms.id, existing.id))
      .returning(),
  );

  await keepVersion(client, row);

  return oneWithAddress(client, row);
};

export const saveProgram = async (
  client: Db,
  input: IntegrationProgramDefinition & { integrationId: string; kind: ProgramKind; key: string },
) => {
  const { integrationId, kind, key, ...definition } = input;

  await lockKeys(client, [`integration-programs:${requestOrgId()}:${integrationId}`]);

  const [integration] = await client
    .select({ id: integrations.id })
    .from(integrations)
    .where(eq(integrations.id, integrationId))
    .limit(1);

  if (!integration) throw notFound('Integration');

  const [existing] = await client
    .select()
    .from(integrationPrograms)
    .where(
      and(
        eq(integrationPrograms.integrationId, integrationId),
        eq(integrationPrograms.kind, kind),
        eq(integrationPrograms.key, key),
      ),
    )
    .limit(1);

  if (existing) return writeDefinition(client, existing, definition);

  const held = await client.$count(
    integrationPrograms,
    eq(integrationPrograms.integrationId, integrationId),
  );

  if (held >= INTEGRATION_PROGRAM_MAX) {
    throw fail(
      'LIMIT_EXCEEDED',
      `An integration holds at most ${INTEGRATION_PROGRAM_MAX} programs. Delete one you don't use first.`,
    );
  }

  const row = oneRow(
    await client
      .insert(integrationPrograms)
      .values({
        id: newId(),
        integrationId,
        kind,
        key,
        ...definition,
        createdBy: callerUserId(),
      })
      .returning(),
  );

  await keepVersion(client, row);

  return oneWithAddress(client, row);
};

export const programVersions = async (client: Db, id: string) => {
  await findProgram(client, id);

  return {
    data: await client
      .select()
      .from(integrationProgramVersions)
      .where(eq(integrationProgramVersions.programId, id))
      .orderBy(desc(integrationProgramVersions.version))
      .limit(INTEGRATION_VERSION_WINDOW),
  };
};

export const restoreProgram = async (client: Db, id: string, version: number) => {
  const existing = await findProgram(client, id);

  const [kept] = await client
    .select({ definition: integrationProgramVersions.definition })
    .from(integrationProgramVersions)
    .where(
      and(
        eq(integrationProgramVersions.programId, id),
        eq(integrationProgramVersions.version, version),
      ),
    )
    .limit(1);

  if (!kept) throw notFound('Version');

  return writeDefinition(client, existing, kept.definition);
};

export const removeProgram = async (client: Db, id: string) => {
  await findProgram(client, id);
  await client.delete(integrationPrograms).where(eq(integrationPrograms.id, id));

  return { ok: true as const };
};
