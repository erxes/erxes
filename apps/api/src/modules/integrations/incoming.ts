import {
  DedupeKey,
  EventInput,
  INTEGRATION_NAMESPACE,
  IntegrationIncomingCall,
  integrationType,
} from '@erxes/core-contract';
import { type Db, withOrg } from '@erxes/core-db';
import { z } from 'zod';
import { parseBody } from '~/modules/automations/actions/context';
import { publishEventsFrom } from '~/modules/events/events.service';
import { defineJob } from '~/modules/jobs/jobs';
import { healEvents } from './contract';
import { findLoadedProgram, type LoadedProgram } from './programs.service';
import { runIntegrationProgram } from './sandbox';

const Published = z.object({
  event: z.string(),
  payload: EventInput.shape.payload,
  dedupeKey: DedupeKey.optional(),
});

const IncomingResult = z
  .union([Published, z.array(Published).max(50)])
  .nullish()
  .transform((value) => (Array.isArray(value) ? value : value ? [value] : []));

export const runIncoming = (loaded: LoadedProgram, call: IntegrationIncomingCall) =>
  runIntegrationProgram(loaded, { incoming: { ...call, body: parseBody(call.rawBody) } });

const publish = async (
  client: Db,
  { integration, program }: LoadedProgram,
  published: z.infer<typeof Published>[],
) => {
  await healEvents(client, program, published);
  await publishEventsFrom(
    client,
    INTEGRATION_NAMESPACE,
    published.map((item) => ({
      type: integrationType(integration.key, item.event),
      payload: item.payload,
      dedupeKey: item.dedupeKey ? `${program.id}:${item.dedupeKey}` : null,
    })),
  );
};

export const incomingJob = defineJob({
  queue: 'integration.incoming',
  payload: IntegrationIncomingCall.extend({ programId: z.string() }),
  timeoutSeconds: 60,
  retry: { attempts: 5 },
  async handle(job) {
    const { programId, ...call } = job.payload;
    const loaded = await withOrg(job.orgId, (tx) => findLoadedProgram(tx, programId));

    if (!loaded) return;

    const run = await runIncoming(loaded, call);

    if (!run.ok) throw new Error(`${loaded.program.label}: ${run.message}`);

    const published = IncomingResult.parse(run.result);

    if (published.length) await withOrg(job.orgId, (tx) => publish(tx, loaded, published));
  },
});
