import { auditCheckpoints, db, eventConsumers, events, newId, users } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { createLocalJWKSet, jwtVerify } from 'jose';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { signAccessToken } from '~/http/auth';
import { publicJwks } from '~/lib/signing';
import { recordAudit } from '~/modules/audit/audit.service';
import { signAuditCheckpoints } from '~/modules/audit/checkpoints';
import { publishPluginEvents, pruneEvents } from '~/modules/events/events.service';
import {
  CONSUMERS,
  type EventConsumer,
  MAX_ATTEMPTS,
  retryFailures,
  runConsumer,
} from '~/modules/events/processor';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { useTestDatabase, useTestServer } from './support';

/**
 * Runs a consumer until it has read every event: it only reads transactions
 * older than the oldest one still running anywhere on the server, which on a
 * shared Postgres may take a moment.
 */
const drain = async (consumer: EventConsumer) => {
  for (let tries = 0; tries < 100; tries += 1) {
    await runConsumer(consumer);

    const behind = await db().execute(sql`
      select 1 from ${events} e
      where not exists (
        select 1 from ${eventConsumers} c where c.name = ${consumer.name} and (e.tx_id, e.seq) <= (c.last_tx_id, c.last_seq)
      ) limit 1
    `);

    if (!behind.rows.length) return;

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`${consumer.name} never caught up`);
};

/** Makes every waiting retry due now. */
const due = () =>
  db().execute(
    sql`update core_event_failures set next_attempt_at = now() where status = 'retrying'`,
  );

/**
 * Event delivery that survives failures (retries, dead events, manual retry),
 * event retention, and signed audit checkpoints.
 */
describe('event failures, retention and audit checkpoints', () => {
  useTestDatabase();

  const server = useTestServer();
  let orgId = '';
  let ownerId = '';
  let memberId = '';
  let ownerToken = '';
  let memberToken = '';

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'owner@acme.mn' },
    });

    orgId = acme.organization.id;
    ownerId = acme.owner.id;
    memberId = newId();
    await db()
      .insert(users)
      .values({ id: memberId, orgId, email: 'm@acme.mn', role: 'member', status: 'active' });
    ownerToken = signAccessToken(ownerId, orgId);
    memberToken = signAccessToken(memberId, orgId);
  });

  const publish = (type: string) =>
    publishPluginEvents(db(), { plugin: 'hr', orgId, scopes: ['events:write'] }, [
      { type, version: 1, payload: {} },
    ]);

  const failures = () => server.client(ownerToken).events.failures({});

  it('retries a failed event with backoff, then marks it dead; a manual retry gets it through', async () => {
    let broken = true;
    const handled: string[] = [];

    const flaky: EventConsumer = {
      name: 'test.flaky',
      handle: async (_tx, event) => {
        if (broken && event.type === 'hr.flaky.happened') throw new Error('downstream is down');

        handled.push(event.type);
      },
    };

    await publish('hr.flaky.happened');
    await publish('hr.other.happened');
    await drain(flaky);

    // The bad event doesn't block the next one.
    expect(handled).toEqual(['hr.other.happened']);

    let listed = await failures();

    expect(listed.counts).toEqual({ retrying: 1, dead: 0 });
    expect(listed.data[0]).toMatchObject({
      consumer: 'test.flaky',
      attempts: 1,
      status: 'retrying',
    });
    expect(listed.data[0]?.lastError).toContain('downstream is down');
    expect(new Date(listed.data[0]?.nextAttemptAt ?? 0).getTime()).toBeGreaterThan(
      Date.now() + 30_000,
    );

    // Not due yet: nothing happens.
    expect(await retryFailures(flaky)).toBe(0);

    for (let attempt = 2; attempt <= MAX_ATTEMPTS; attempt += 1) {
      await due();
      await retryFailures(flaky);
    }

    listed = await failures();
    expect(listed.counts).toEqual({ retrying: 0, dead: 1 });
    expect(listed.data[0]).toMatchObject({
      attempts: MAX_ATTEMPTS,
      status: 'dead',
      nextAttemptAt: null,
    });

    await expect(
      server.client(memberToken).events.retryFailures({ allDead: true }),
    ).rejects.toMatchObject({ status: 403 });

    broken = false;
    expect(await server.client(ownerToken).events.retryFailures({ allDead: true })).toEqual({
      retried: 1,
    });
    await retryFailures(flaky);

    expect(handled).toEqual(['hr.other.happened', 'hr.flaky.happened']);
    expect((await failures()).counts).toEqual({ retrying: 0, dead: 0 });
  });

  it('dismisses failures, and keeps events until every consumer has passed them', async () => {
    const owner = server.client(ownerToken);

    const failing: EventConsumer = {
      name: 'test.failing',
      handle: () => Promise.reject(new Error('nope')),
    };

    const passing: EventConsumer = { name: 'test.passing', handle: async () => undefined };

    await publish('hr.old.happened');
    await db().execute(sql`update core_events set created_at = now() - interval '40 days'`);

    // A consumer that never ran holds everything back.
    expect(await pruneEvents(db(), 30, ['test.failing', 'test.never'])).toBe(0);

    await drain(failing);
    await drain(passing);

    // test.failing still has to retry its failures: those events stay.
    const kept = await db().select({ id: events.id }).from(events);
    const open = (await failures()).data.filter((failure) => failure.consumer === 'test.failing');

    expect(open.length).toBe(kept.length);
    expect(await pruneEvents(db(), 30, ['test.failing', 'test.passing'])).toBe(0);

    expect(
      await owner.events.dismissFailures({
        failures: open.map((failure) => ({
          consumer: failure.consumer,
          eventId: failure.event.id,
        })),
      }),
    ).toEqual({ dismissed: open.length });

    // test.flaky's history (from the first test) is gone too, so all old events go.
    expect(await pruneEvents(db(), 30, ['test.failing', 'test.passing'])).toBe(kept.length);

    await publish('hr.new.happened');
    await drain(failing);
    await drain(passing);
    await owner.events.dismissFailures({
      failures: (await failures()).data.map((failure) => ({
        consumer: failure.consumer,
        eventId: failure.event.id,
      })),
    });
    // Recent events stay, handled or not.
    expect(await pruneEvents(db(), 30, ['test.failing', 'test.passing'])).toBe(0);
    expect(
      (await db().select().from(events).where(eq(events.type, 'hr.new.happened'))).length,
    ).toBe(1);
  });

  it('signs audit checkpoints and catches entries cut off the end of the chain', async () => {
    const owner = server.client(ownerToken);
    const caller = { orgId, actorType: 'user' as const, actorId: ownerId, source: 'core' };

    for (let index = 0; index < 3; index += 1) {
      await recordAudit(db(), caller, {
        action: 'customer.created',
        targetType: 'customer',
        targetId: `c${index}`,
      });
    }

    expect(await signAuditCheckpoints(db())).toBeGreaterThanOrEqual(1);
    // Nothing new since: nothing to sign.
    expect(await signAuditCheckpoints(db(), orgId)).toBe(0);

    const { data } = await owner.audit.checkpoints({ limit: 10 });
    const latest = data.at(-1);

    // Anyone can check a checkpoint with the published keys alone.
    const { payload } = await jwtVerify(latest?.signature ?? '', createLocalJWKSet(publicJwks()), {
      issuer: 'erxes-core',
    });

    expect(payload).toMatchObject({ org: orgId, seq: latest?.chainSeq, hash: latest?.hash });

    let result = await owner.audit.verify();

    expect(result.ok).toBe(true);
    expect(result.checkpoints.mismatchAt).toBeNull();
    expect(result.checkpoints.latestSeq).toBeGreaterThanOrEqual(latest?.chainSeq ?? 1);

    // Remove the newest entries (as only someone with database access could):
    // the chain itself still looks whole, the checkpoint doesn't.
    const head = result.checkpoints.latestSeq ?? 0;

    await db().transaction(async (tx) => {
      await tx.execute(sql`set local core.audit_prune = 'on'`);
      await tx.execute(
        sql`delete from core_audit_logs where org_id = ${orgId} and chain_seq >= ${head - 1}`,
      );
    });

    result = await owner.audit.verify();
    expect(result.brokenAt).toBeNull();
    expect(result.ok).toBe(false);
    expect(result.checkpoints.mismatchAt).not.toBeNull();

    // Checkpoints themselves are append-only.
    await expect(db().delete(auditCheckpoints)).rejects.toMatchObject({
      cause: { message: 'core_audit_checkpoints is append-only' },
    });
    // And a tampered chain is never signed over.
    await recordAudit(db(), caller, {
      action: 'customer.created',
      targetType: 'customer',
      targetId: 'c9',
    });
    expect(await signAuditCheckpoints(db(), orgId)).toBe(0);
  });

  it('publishes core’s public keys', () => {
    const { keys } = publicJwks();

    expect(keys[0]).toMatchObject({ kty: 'EC', crv: 'P-256', alg: 'ES256', use: 'sig' });
    expect(keys[0]).not.toHaveProperty('d');
  });

  it('records a notify request core_publish_event() let through but POST /events would refuse as a failed delivery', async () => {
    const notifications = CONSUMERS.find((consumer) => consumer.name === 'core.notifications');

    if (!notifications) throw new Error('no core.notifications consumer');

    // The recipient count is checked in SQL; the missing title only by the consumer.
    await db().execute(
      sql`select core_publish_event(${orgId}, 'hr', 'hr.leave.untitled', p_notify => jsonb_build_object('userIds', jsonb_build_array(${memberId}::text)))`,
    );
    await drain(notifications);

    const failure = (await failures()).data.find(
      (entry) => entry.event.type === 'hr.leave.untitled',
    );

    expect(failure).toMatchObject({ consumer: 'core.notifications', status: 'retrying' });
    expect(failure?.lastError).toContain('title');
  });
});
