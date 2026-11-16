import { z } from 'zod';

/** A plugin job's name, the last part of its address: `mail.sync`, `token-refresh`. */
export const JobName = z
  .string()
  .trim()
  .regex(
    /^[a-z][a-z0-9_.-]{0,59}$/,
    'lower case letters, digits and . _ - (starting with a letter)',
  );

const PluginJob = z.object({
  name: JobName,
  /** A cron schedule in UTC (`0 3 * * *`): one job per organisation each time it comes due. */
  cron: z.string().trim().min(1).max(100).optional(),
  /**
   * Also runs once for an organisation when it installs the plugin or approves the scopes a newer
   * version asks for: a backfill of what the plugin could not do before.
   */
  onInstall: z.boolean().optional(),
  /**
   * Attempts in all; the first retry waits `delay` seconds, each next one
   * about twice as long, up to `maxDelay`. Default: 8 attempts, 30 s, 6 hours.
   */
  retry: z
    .object({
      attempts: z.int().min(1).max(25),
      delay: z.int().min(1).max(86_400),
      maxDelay: z
        .int()
        .min(1)
        .max(7 * 86_400),
    })
    .refine((retry) => retry.maxDelay >= retry.delay, 'maxDelay is at least delay')
    .optional(),
});

/**
 * The manifest's `jobs`: background work at the plugin's API. The plugin
 * queues a job with `core_enqueue_job()` in its own transaction; core POSTs
 * each attempt to `<api.url>/jobs/<name>` with a core token and
 * `Idempotency-Key: <job id>`, and retries until it answers 2xx. A job with
 * `cron` also runs on that schedule, once for each organisation that has the plugin.
 */
export const PluginJobs = z
  .array(PluginJob)
  .max(50)
  .refine(
    (jobs) => new Set(jobs.map((job) => job.name)).size === jobs.length,
    'each job name once',
  );

/** One attempt of a plugin job, as core POSTs it to `<api.url>/jobs/<name>`. */
export const PluginJobDelivery = z.object({
  jobId: z.string(),
  orgId: z.string(),
  name: JobName,
  /** 1 on the first try. */
  attempt: z.int().min(1),
  payload: z.record(z.string(), z.unknown()),
});

export type PluginJobDelivery = z.infer<typeof PluginJobDelivery>;
