import { PluginJobDelivery } from '@erxes/core-contract';
import {
  type Db,
  pluginInstallations,
  plugins,
  type StoredPluginManifest,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import type { JobWithMetadata } from 'pg-boss';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { traced } from '~/logger';
import {
  defineJob,
  describeError,
  inTransaction,
  type JobQueue,
  queue,
  queueOptions,
} from '~/modules/jobs/jobs';
import { activeInstallation, deliverToPlugin, installedWhere } from './pluginDelivery';

const CORE_JOB_TYP = 'erxes-core-job+jwt';

const JOB_QUEUE = 'plugin.job';
const CRON_QUEUE = 'plugin.cron';

type ManifestJob = NonNullable<StoredPluginManifest['jobs']>[number];

/** The plugin's API address while it is installed here and still declares the job. */
const targetUrl = (orgId: string, plugin: string, name: string) =>
  withOrg(orgId, async (tx) => {
    const manifest = (await activeInstallation(tx, plugin))?.manifest;

    return manifest?.jobs?.some((job) => job.name === name) ? manifest.api?.url : undefined;
  });

/**
 * One attempt: POST `{ jobId, orgId, name, attempt, payload }` to
 * `<api.url>/jobs/<name>` with a 5-minute core token and
 * `Idempotency-Key: <job id>`. Anything but 2xx, or no answer in 50 s,
 * retries with the manifest's `retry` (core_enqueue_job writes it on the
 * job), else 8 attempts from 30 s up to 6 hours apart. After the last one the
 * job stays failed. Uninstalled, or the job left the manifest: nothing to send.
 */
export const pluginJob = defineJob({
  queue: JOB_QUEUE,
  timeoutSeconds: 60,
  concurrency: 5,
  payload: z.object({
    plugin: z.string(),
    name: z.string(),
    payload: z.record(z.string(), z.unknown()),
  }),
  async handle(job) {
    const { plugin, name } = job.payload;
    const url = await targetUrl(job.orgId, plugin, name);

    if (!url) return;

    await deliverToPlugin({
      plugin,
      url,
      path: `/jobs/${name}`,
      orgId: job.orgId,
      kind: 'job',
      id: job.id,
      body: JSON.stringify(
        PluginJobDelivery.parse({
          jobId: job.id,
          orgId: job.orgId,
          name,
          attempt: job.attempt,
          payload: job.payload.payload,
        }),
      ),
      typ: CORE_JOB_TYP,
      headers: { 'User-Agent': 'erxes-jobs/1' },
      timeoutMs: 50_000,
    });
  },
});

const CronData = z.object({ plugin: z.string(), name: z.string() });

/**
 * One occurrence of a job's `cron`: a job for each organisation that has the
 * plugin, deduped by the occurrence, so a retried fan-out adds none twice
 * while the first ones wait.
 */
const fanOut = (raw: JobWithMetadata<unknown>) =>
  withSystem('plugin job schedule', async (tx) => {
    const { plugin, name } = CronData.parse(raw.data);

    await tx
      .select({
        id: sql`core_plugin_job(${plugin}, ${pluginInstallations.orgId}, ${name}, '{}'::jsonb, null, ${`cron:${raw.id}`})`,
      })
      .from(pluginInstallations)
      .innerJoin(plugins, eq(plugins.name, pluginInstallations.plugin))
      .where(
        and(
          installedWhere(plugin),
          sql`${plugins.manifest}->'jobs' @> ${JSON.stringify([{ name }])}::jsonb`,
        ),
      );
  });

/** The queue pg-boss's cron pass fills: one schedule per plugin job with a `cron`, keyed `<plugin>/<job>`. */
export const pluginJobSchedules = {
  queues: [
    {
      name: CRON_QUEUE,
      options: queueOptions({ retry: { attempts: 3, delay: 60, maxDelay: 60 } }),
      concurrency: 2,
      run: (raw) => traced(`job ${CRON_QUEUE}`, () => fanOut(raw)),
    } satisfies JobQueue,
  ],
};

/** pg-boss allows letters, digits and `_-./` in a key; plugin names have no `/`. */
const scheduleKey = (plugin: string, name: string) => `${plugin}/${name}`;

/** pg-boss reads the expression: a 5-field cron, or what else it accepts. */
const assertSchedule = (job: ManifestJob & { cron: string }) => {
  try {
    queue().previewSchedule(job.cron, { tz: 'UTC', count: 1 });
  } catch (error) {
    throw fail(
      'INVALID_SCHEDULE',
      `Job "${job.name}" has a cron that doesn't parse (${job.cron}): ${describeError(error)}`,
    );
  }
};

/**
 * Brings the plugin's schedules in line with its manifest's `jobs`, in the
 * caller's transaction: one per job with a `cron`, none for the rest.
 */
export const schedulePluginJobs = async (tx: Db, plugin: string, jobs: ManifestJob[] = []) => {
  const timed = jobs.flatMap((job) => (job.cron ? [{ ...job, cron: job.cron }] : []));

  for (const job of timed) assertSchedule(job);

  const keys = new Set(timed.map((job) => scheduleKey(plugin, job.name)));
  const existing = await queue().getSchedules(CRON_QUEUE);

  await Promise.all([
    ...existing
      .filter((schedule) => schedule.key.startsWith(`${plugin}/`) && !keys.has(schedule.key))
      .map((schedule) => queue().unschedule(CRON_QUEUE, schedule.key, inTransaction(tx))),
    ...timed.map((job) => {
      const key = scheduleKey(plugin, job.name);

      // One fan-out per job at a time: an exclusive queue's jobs need a key of their own.
      return queue().schedule(
        CRON_QUEUE,
        job.cron,
        { plugin, name: job.name },
        { key, singletonKey: key, tz: 'UTC', ...inTransaction(tx) },
      );
    }),
  ]);
};
