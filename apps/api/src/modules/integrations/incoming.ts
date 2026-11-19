import { actorOf, caller, type Db, events, newId, withOrg } from '@erxes/core-db';
import { z } from 'zod';
import { parseBody } from '~/modules/automations/actions/context';
import { defineJob } from '~/modules/jobs/jobs';
import { INTEGRATION_NAMESPACE, integrationType } from './actions';
import { findLoadedProgram, type LoadedProgram } from './programs.service';
import { runIntegrationProgram } from './sandbox';

export const IncomingCall = z.object({
  method: z.string(),
  headers: z.record(z.string(), z.string()),
  query: z.record(z.string(), z.string()),
  rawBody: z.string(),
});

export type IncomingCall = z.infer<typeof IncomingCall>;

const Published = z.object({
  event: z.string(),
  payload: z
    .record(z.string(), z.unknown())
    .refine((value) => JSON.stringify(value).length <= 32_000, 'at most 32 KB')
    .default({}),
  dedupeKey: z.string().min(1).max(200).optional(),
});

const IncomingResult = z
  .union([Published, z.array(Published).max(50)])
  .nullish()
  .transform((value) => (Array.isArray(value) ? value : value ? [value] : []));

export const runIncoming = (loaded: LoadedProgram, call: IncomingCall) =>
  runIntegrationProgram(loaded, { incoming: { ...call, body: parseBody(call.rawBody) } });

const publish = async (
  client: Db,
  { integration, program }: LoadedProgram,
  published: z.infer<typeof Published>[],
) => {
  const undeclared = published.find(
    (item) => !program.events.some((event) => event.key === item.event),
  );

  if (undeclared) {
    throw new Error(`${program.label} publishes ${undeclared.event}, which it does not declare`);
  }

  if (!published.length) return;

  await client
    .insert(events)
    .values(
      published.map((item) => ({
        id: newId(),
        source: INTEGRATION_NAMESPACE,
        type: integrationType(integration.key, item.event),
        ...actorOf(caller()),
        payload: item.payload,
        dedupeKey: item.dedupeKey ? `${program.id}:${item.dedupeKey}` : null,
      })),
    )
    .onConflictDoNothing();
};

export const incomingJob = defineJob({
  queue: 'integration.incoming',
  payload: IncomingCall.extend({ programId: z.string() }),
  timeoutSeconds: 60,
  retry: { attempts: 5 },
  async handle(job) {
    const { programId, ...call } = job.payload;
    const loaded = await withOrg(job.orgId, (tx) => findLoadedProgram(tx, programId));

    if (!loaded) return;

    const run = await runIncoming(loaded, call);

    if (!run.ok) throw new Error(`${loaded.program.label}: ${run.message}`);

    const published = IncomingResult.parse(run.result);

    await withOrg(job.orgId, (tx) => publish(tx, loaded, published));
  },
});
