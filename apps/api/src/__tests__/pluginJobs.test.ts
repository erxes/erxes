import { enqueueJob, type JobInput, verifyCoreJob } from '@erxes/plugin-sdk';
import { sql } from 'drizzle-orm';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { describeError, queue } from '~/modules/jobs/jobs';
import { pluginRoleSql } from '~/modules/plugins/pluginRole';
import { adminDb, testDatabaseUrl, useTestDatabase } from './db';
import { pluginApi } from './pluginApi';
import { makeDue, settle } from './settle';
import { useTwoOrgs } from './support';

const jobRow = async (id: string | undefined) => {
  const { rows } = await adminDb().execute<{ state: string; attempts: number; retryLimit: number }>(
    sql`select state::text, retry_count + 1 as attempts, retry_limit as "retryLimit"
      from core_queue.job where id = ${id}::uuid`,
  );

  return rows[0];
};

/** Why it failed, with the database's reason (Drizzle's "Failed query" wraps it), or null. */
const failure = (promise: Promise<unknown>) =>
  promise.then(
    () => null,
    (error: unknown) => describeError(error),
  );

const JOBS = [
  { name: 'mail.sync', retry: { attempts: 2, delay: 1, maxDelay: 1 } },
  { name: 'sla.check', cron: '*/5 * * * *' },
];

/** Jobs core queued and how pg-boss works them; the `hr` plugin's API receives them. */
describe('plugin jobs', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let api: Awaited<ReturnType<typeof pluginApi>>;
  let pool: Pool;
  let plugin: NodePgDatabase;

  const register = async (jobs: typeof JOBS) =>
    t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '2',
      api: { url: api.url },
      jobs,
    });

  /** A transaction on core's database as the hr plugin's own role, as a plugin runs one. */
  const asHr = <T>(
    fn: (tx: Parameters<Parameters<NodePgDatabase['transaction']>[0]>[0]) => Promise<T>,
  ) =>
    plugin.transaction(async (tx) => {
      await tx.execute(sql`set local role erxes_plugin_hr`);

      return fn(tx);
    });

  const enqueue = (job: JobInput) => asHr((tx) => enqueueJob(tx, job));

  beforeAll(async () => {
    api = await pluginApi(t.url(''));
    await adminDb().execute(sql.raw(pluginRoleSql('hr')));
    await adminDb().execute(sql.raw('GRANT erxes_plugin_hr TO current_user'));
    pool = new Pool({ connectionString: testDatabaseUrl(), max: 2 });
    plugin = drizzle({ client: pool });
    await register(JOBS);
    // Globex doesn't have the plugin.
    await t.other().plugins.uninstall({ name: 'hr' });
  });

  afterAll(async () => {
    await api.close();
    await pool.end();
  });

  it('queues a job only when the plugin transaction commits, once per dedupe key, and delivers it signed', async () => {
    await expect(
      asHr(async (tx) => {
        await enqueueJob(tx, { orgId: t.ids.org, name: 'mail.sync', payload: { account: 'gone' } });
        throw new Error('roll back');
      }),
    ).rejects.toThrow('roll back');

    await asHr(async (tx) => {
      const job = {
        orgId: t.ids.org,
        name: 'mail.sync',
        payload: { account: 'a1' },
        dedupeKey: 'a1',
      };

      await enqueueJob(tx, job);
      await enqueueJob(tx, { ...job, payload: { account: 'again' } });
    });

    await settle();

    expect(api.rejected).toEqual([]);
    expect(
      api.jobs.map(({ jobId, idempotencyKey, ...job }) => ({
        ...job,
        keyed: idempotencyKey === jobId,
      })),
    ).toEqual([
      {
        orgId: t.ids.org,
        name: 'mail.sync',
        attempt: 1,
        payload: { account: 'a1' },
        path: '/jobs/mail.sync',
        keyed: true,
      },
    ]);

    // The token signs this body for this plugin only.
    const [request] = api.jobRequests;
    const options = { coreUrl: t.url(''), plugin: 'hr' };

    await expect(
      verifyCoreJob(request?.authorization, request?.raw.replace('a1', 'a2') ?? '', options),
    ).rejects.toThrow('the body does not match the token');
    await expect(
      verifyCoreJob(request?.authorization, request?.raw ?? '', { ...options, plugin: 'ecom' }),
    ).rejects.toThrow(/"aud"/);
  });

  it('refuses a name the manifest does not declare, an organisation without the plugin, and any role but a plugin', async () => {
    expect(await failure(enqueue({ orgId: t.ids.org, name: 'payroll.run' }))).toMatch(
      /hr declares no job "payroll.run"/,
    );
    expect(await failure(enqueue({ orgId: t.ids.otherOrg, name: 'mail.sync' }))).toMatch(
      /hr is not installed/,
    );
    expect(
      await failure(adminDb().execute(sql`select core_enqueue_job(${t.ids.org}, 'mail.sync')`)),
    ).toMatch(/only a plugin's database role/);
  });

  it("retries after a 500 with the manifest's policy and leaves the job failed after its last attempt", async () => {
    api.jobs.length = 0;
    api.jobAnswers.push(500);
    await enqueue({ orgId: t.ids.org, name: 'mail.sync', payload: { account: 'b1' } });
    await settle();

    const id = api.jobs[0]?.jobId;

    expect(await jobRow(id)).toEqual({ state: 'retry', attempts: 1, retryLimit: 1 });

    await makeDue();
    await settle();

    expect(api.jobs.map((job) => [job.jobId, job.attempt])).toEqual([
      [id, 1],
      [id, 2],
    ]);
    expect((await jobRow(id))?.state).toBe('completed');

    api.jobs.length = 0;
    api.jobAnswers.push(500, 503);
    await enqueue({ orgId: t.ids.org, name: 'mail.sync', payload: { account: 'b2' } });
    await settle();
    await makeDue();
    await settle();

    expect(api.jobs.map((job) => job.attempt)).toEqual([1, 2]);
    expect(await jobRow(api.jobs[0]?.jobId)).toEqual({
      state: 'failed',
      attempts: 2,
      retryLimit: 1,
    });
  });

  it('schedules a cron job and fans each occurrence out to every organisation with the plugin', async () => {
    const schedules = await queue().getSchedules('plugin.cron');

    expect(schedules.map(({ key, cron, timezone }) => ({ key, cron, timezone }))).toEqual([
      { key: 'hr/sla.check', cron: '*/5 * * * *', timezone: 'UTC' },
    ]);

    // What pg-boss's cron pass sends when the schedule comes due.
    api.jobs.length = 0;
    await queue().send('plugin.cron', schedules[0]?.data ?? null, { singletonKey: 'hr/sla.check' });
    await settle();

    expect(api.jobs.map(({ orgId, name, attempt }) => ({ orgId, name, attempt }))).toEqual([
      { orgId: t.ids.org, name: 'sla.check', attempt: 1 },
    ]);

    await expect(register([{ name: 'sla.check', cron: 'every so often' }])).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_SCHEDULE',
    });

    // Without the cron, the schedule goes.
    await register(JOBS.filter((job) => job.name !== 'sla.check'));
    expect(await queue().getSchedules('plugin.cron')).toEqual([]);
  });
});
