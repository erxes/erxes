import { type Job, Worker } from 'bullmq';
import { parseExpression } from 'cron-parser';
import { redis, sendWorkerQueue } from 'erxes-api-shared/utils';
import { z } from 'zod';
import type { IExtensionDocument, IModels } from './connectionResolver';
import { LIMITS } from './limits';
import { REFUSED, runTrigger } from './runs';

// Every trigger run is one job on this queue, in Redis, so schedules survive
// restarts and each job runs on one runtime instance however many there are.
const RUNS = ['extensions', 'runs'] as const;
const runsQueue = () => sendWorkerQueue(...RUNS);

const RunJob = z.object({
  tenant: z.string(),
  extId: z.string(),
  trigger: z.literal('cron'),
  // The schedule's name.
  name: z.string(),
});

// ---- Schedules

const MINUTES_PER_DAY = 24 * 60;

// Why `cron` can't be a schedule, or undefined when it can. Day, month and
// weekday only pick which days fire, so the shortest gap is between two
// times of day, midnight's wrap included as if every day fired.
export const cronProblem = (cron: string) => {
  if (cron.trim().split(/\s+/).length !== 5) {
    return 'needs five fields: minute hour day-of-month month day-of-week';
  }

  let fields;

  try {
    ({ fields } = parseExpression(cron, { tz: 'UTC' }));
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }

  const times = fields.hour
    .flatMap((hour) => fields.minute.map((minute) => hour * 60 + minute))
    .sort((a, b) => a - b);
  const gaps = [
    ...times.slice(1).map((time, i) => time - times[i]),
    times[0] + MINUTES_PER_DAY - times[times.length - 1],
  ];

  return Math.min(...gaps) < LIMITS.minScheduleMinutes
    ? `fires more often than every ${LIMITS.minScheduleMinutes} minutes`
    : undefined;
};

const schedulerId = (tenant: string, extId: string, name: string) =>
  `${tenant}/${extId}/${name}`;

// Makes the queue's schedulers match the install: one per schedule of the
// active build while it is enabled, none otherwise. Schedules any of its
// builds ever declared are candidates for removal, so a schedule an upgrade
// dropped stops too.
const syncSchedules = async (
  models: IModels,
  tenant: string,
  extId: string,
) => {
  const ext = await models.Extensions.findById(`${tenant}:${extId}`)
    .select('status schedules')
    .lean();
  const active = ext?.status === 'installed' ? ext.schedules ?? {} : {};
  const versions = await models.ExtensionVersions.find({
    subdomain: tenant,
    extId,
  })
    .select('schedules')
    .lean();
  const queue = runsQueue();

  for (const name of new Set(
    versions.flatMap((v) => Object.keys(v.schedules ?? {})),
  )) {
    if (!(name in active)) {
      await queue.removeJobScheduler(schedulerId(tenant, extId, name));
    }
  }

  for (const [name, { cron }] of Object.entries(active)) {
    await queue.upsertJobScheduler(
      schedulerId(tenant, extId, name),
      { pattern: cron, tz: 'UTC' },
      {
        name: 'cron',
        data: { tenant, extId, trigger: 'cron', name },
        // The next tick is the retry.
        opts: { attempts: 1 },
      },
    );
  }
};

// After any change to an install: enable, disable, upgrade, rollback,
// uninstall.
export const syncTriggers = async (
  models: IModels,
  tenant: string,
  extId: string,
) => {
  await syncSchedules(models, tenant, extId);
};

// ---- Running jobs

// The function a trigger names on the active build.
const functionOf = (
  ext: Pick<IExtensionDocument, 'schedules'>,
  { name }: z.infer<typeof RunJob>,
) => ext.schedules?.[name]?.function;

const inputOf = (job: Job) => ({
  // A scheduler's job carries the time it was due; it may start later.
  scheduledAt: new Date(job.opts.prevMillis ?? job.timestamp).toISOString(),
});

const processRun = async (job: Job<unknown>) => {
  const data = RunJob.parse(job.data);
  const result = await runTrigger(data.tenant, data.extId, {
    trigger: data.trigger,
    name: data.name,
    fn: (ext) => functionOf(ext, data),
    input: inputOf(job),
  });

  // A failed run is retried while the job has attempts left; a refused one
  // never runs, so retrying it is pointless.
  if (result && !result.ok && !REFUSED.has(result.error.code)) {
    throw new Error(`${result.error.code}: ${result.error.message}`);
  }
};

export const startTriggerWorkers = () => {
  const worker = new Worker<unknown>(RUNS.join('-'), processRun, {
    connection: redis,
    concurrency: LIMITS.triggerConcurrency,
  });

  worker.on('error', (e) => console.error('extension trigger worker', e));

  return () => worker.close();
};
