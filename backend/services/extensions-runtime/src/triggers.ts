import { createHmac, timingSafeEqual } from 'node:crypto';
import { type Job, type JobsOptions, Worker } from 'bullmq';
import { parseExpression } from 'cron-parser';
import { redis, sendWorkerQueue } from 'erxes-api-shared/utils';
import { z } from 'zod';
import type { IExtensionDocument, IModels } from './connectionResolver';
import { ApiError } from './errors';
import { LIMITS } from './limits';
import { REFUSED, runTrigger } from './runs';
import { loadSecrets } from './secrets';

// Every trigger run is one job on this queue, in Redis, so schedules survive
// restarts and each job runs on one runtime instance however many there are.
const RUNS = ['extensions', 'runs'] as const;
const runsQueue = () => sendWorkerQueue(...RUNS);

// `name` is the trigger's name in the install's schedules or webhooks.
const RunJob = z.discriminatedUnion('trigger', [
  z.object({
    tenant: z.string(),
    extId: z.string(),
    trigger: z.literal('cron'),
    name: z.string(),
  }),
  z.object({
    tenant: z.string(),
    extId: z.string(),
    trigger: z.literal('webhook'),
    name: z.string(),
    input: z.object({
      headers: z.record(z.string(), z.string()),
      body: z.unknown(),
    }),
  }),
]);

// The first try and three retries, a few seconds apart and then longer.
const RETRIED: JobsOptions = {
  attempts: 4,
  backoff: { type: 'exponential', delay: 5000 },
};

// How long a delivery id is remembered, so a vendor's redelivery runs once.
const DEDUP_TTL_MS = 24 * 60 * 60 * 1000;

// The record's own entry under `key`, never one it inherits.
const own = <T>(record: Record<string, T> | undefined, key: string) =>
  record && Object.prototype.hasOwnProperty.call(record, key)
    ? record[key]
    : undefined;

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

// ---- Webhooks

// Headers vendors put a delivery's own id in. A redelivery repeats it.
const DELIVERY_ID_HEADERS = [
  'x-github-delivery',
  'x-gitlab-event-uuid',
  'x-shopify-webhook-id',
  'x-delivery-id',
  'x-webhook-id',
  'x-request-id',
];

// What the function sees of the request's headers: what the vendor says
// about the payload, not what proxies on the way added.
const passedHeaders = (headers: Headers) => {
  const passed: Record<string, string> = {};

  headers.forEach((value, name) => {
    if (
      name === 'content-type' ||
      name === 'user-agent' ||
      (name.startsWith('x-') && !name.startsWith('x-forwarded-'))
    ) {
      passed[name] = value;
    }
  });

  return passed;
};

const parseBody = (headers: Headers, raw: Buffer): unknown => {
  const text = raw.toString('utf8');

  if (!headers.get('content-type')?.includes('json')) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

// One webhook delivery, from the public route. The signature over the raw
// body is checked before the body is read as anything, then the run is
// queued, so the vendor gets its answer without waiting for the function.
export const acceptWebhook = async (
  models: IModels,
  tenant: string,
  { installKey, name }: { installKey: string; name: string },
  headers: Headers,
  raw: Buffer,
) => {
  const ext = await models.Extensions.findOne({ subdomain: tenant, installKey })
    .select('extId webhooks')
    .lean();
  // A name from the URL may be `constructor`: only the install's own keys.
  const webhook = own(ext?.webhooks, name);

  if (!ext || !webhook) {
    throw new ApiError(404, 'UNKNOWN_WEBHOOK', 'No such webhook');
  }

  const { secret: secretName, header, algorithm, prefix } = webhook.signature;
  const secret = (await loadSecrets(models, tenant, ext.extId, [secretName]))[
    secretName
  ];

  if (!secret) {
    throw new ApiError(
      412,
      'SECRET_NOT_SET',
      `Set ${secretName} in Settings > Extensions before sending this webhook`,
    );
  }

  const expected = Buffer.from(
    `${prefix ?? ''}${createHmac(algorithm, secret).update(raw).digest('hex')}`,
  );
  const received = Buffer.from(headers.get(header) ?? '');

  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  ) {
    throw new ApiError(
      401,
      'BAD_SIGNATURE',
      `${header} doesn't match the body`,
    );
  }

  const deliveryId = DELIVERY_ID_HEADERS.map((h) => headers.get(h)).find(
    Boolean,
  );

  await runsQueue().add(
    'webhook',
    {
      tenant,
      extId: ext.extId,
      trigger: 'webhook',
      name,
      input: { headers: passedHeaders(headers), body: parseBody(headers, raw) },
    },
    {
      ...RETRIED,
      ...(deliveryId && {
        deduplication: {
          id: `${tenant}/${ext.extId}/${name}/${deliveryId}`,
          ttl: DEDUP_TTL_MS,
        },
      }),
    },
  );
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
  ext: Pick<IExtensionDocument, 'schedules' | 'webhooks'>,
  { trigger, name }: z.infer<typeof RunJob>,
) =>
  own<{ function: string }>(
    trigger === 'cron' ? ext.schedules : ext.webhooks,
    name,
  )?.function;

const inputOf = (job: Job, data: z.infer<typeof RunJob>) =>
  data.trigger === 'cron'
    ? {
        // A scheduler's job carries the time it was due; it may start later.
        scheduledAt: new Date(
          job.opts.prevMillis ?? job.timestamp,
        ).toISOString(),
      }
    : data.input;

const processRun = async (job: Job<unknown>) => {
  const data = RunJob.parse(job.data);
  const result = await runTrigger(data.tenant, data.extId, {
    trigger: data.trigger,
    name: data.name,
    fn: (ext) => functionOf(ext, data),
    input: inputOf(job, data),
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
