import { beforeAll, expect, it } from 'vite-plus/test';
import type { Actor } from '~/http/auth';
import { adminDb, describeWithDb, useTestDatabase } from './db';

/**
 * Event delivery that survives failures (retries, dead events, manual retry),
 * event retention, and signed audit checkpoints.
 */
describeWithDb('event failures, retention and audit checkpoints', () => {
  useTestDatabase();

  let owner: Actor;
  let member: Actor;

  beforeAll(async () => {
    const { db, users, newId } = await import('@erxes/core-db');
    const { createOrganization } = await import('~/modules/organizations/organizations.service');

    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'owner@acme.mn' },
    });

    const memberId = newId();

    await adminDb().insert(users).values({
      id: memberId,
      orgId: acme.organization.id,
      email: 'm@acme.mn',
      role: 'member',
      status: 'active',
    });
    owner = {
      userId: acme.owner.id,
      orgId: acme.organization.id,
      role: 'owner',
      permissions: ['*'],
    };
    member = {
      userId: memberId,
      orgId: acme.organization.id,
      role: 'member',
      permissions: ['contacts.view'],
    };
  });

  const publish = async (type: string) => {
    const { db } = await import('@erxes/core-db');
    const { publishPluginEvents } = await import('~/modules/events/events.service');

    await publishPluginEvents(
      adminDb(),
      { plugin: 'hr', orgId: owner.orgId, scopes: ['events:write'] },
      [{ type, version: 1, payload: {} }],
    );
  };

  /**
   * Runs a consumer until it has read every event: it only reads transactions
   * older than the oldest one still running anywhere on the server, which on a
   * shared Postgres may take a moment.
   */
  const drain = async (consumer: { name: string; handle: (...args: never[]) => Promise<void> }) => {
    const { db, eventConsumers, events } = await import('@erxes/core-db');
    const { sql } = await import('drizzle-orm');
    const { runConsumer } = await import('~/modules/events/processor');

    for (let tries = 0; tries < 100; tries += 1) {
      await runConsumer(consumer as never);

      const behind = await adminDb().execute(sql`
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
  const due = async () => {
    const { db } = await import('@erxes/core-db');
    const { sql } = await import('drizzle-orm');

    await adminDb().execute(
      sql`update core_event_failures set next_attempt_at = now() where status = 'retrying'`,
    );
  };

  it('retries a failed event with backoff, then marks it dead; a manual retry gets it through', async () => {
    const { db } = await import('@erxes/core-db');
    const { retryFailures, MAX_ATTEMPTS } = await import('~/modules/events/processor');

    const { listEventFailures, retryEventFailures } =
      await import('~/modules/events/events.service');

    let broken = true;
    const handled: string[] = [];

    const flaky = {
      name: 'test.flaky',
      handle: async (_tx: unknown, event: { id: string; type: string }) => {
        if (broken && event.type === 'hr.flaky.happened') throw new Error('downstream is down');

        handled.push(event.type);
      },
    };

    await publish('hr.flaky.happened');
    await publish('hr.other.happened');
    await drain(flaky);

    // The bad event doesn't block the next one.
    expect(handled).toEqual(['hr.other.happened']);

    let failures = await listEventFailures(adminDb(), owner, {});

    expect(failures.counts).toEqual({ retrying: 1, dead: 0 });
    expect(failures.data[0]).toMatchObject({
      consumer: 'test.flaky',
      attempts: 1,
      status: 'retrying',
    });
    expect(failures.data[0]!.lastError).toContain('downstream is down');
    expect(new Date(failures.data[0]!.nextAttemptAt!).getTime()).toBeGreaterThan(
      Date.now() + 30_000,
    );

    // Not due yet: nothing happens.
    expect(await retryFailures(flaky as never)).toBe(0);

    for (let attempt = 2; attempt <= MAX_ATTEMPTS; attempt += 1) {
      await due();
      await retryFailures(flaky);
    }

    failures = await listEventFailures(adminDb(), owner, {});
    expect(failures.counts).toEqual({ retrying: 0, dead: 1 });
    expect(failures.data[0]).toMatchObject({
      attempts: MAX_ATTEMPTS,
      status: 'dead',
      nextAttemptAt: null,
    });

    await expect(retryEventFailures(adminDb(), member, { allDead: true })).rejects.toMatchObject({
      status: 403,
    });

    broken = false;
    expect(await retryEventFailures(adminDb(), owner, { allDead: true })).toEqual({ retried: 1 });
    await retryFailures(flaky);

    expect(handled).toEqual(['hr.other.happened', 'hr.flaky.happened']);
    expect((await listEventFailures(adminDb(), owner, {})).counts).toEqual({
      retrying: 0,
      dead: 0,
    });
  });

  it('dismisses failures, and keeps events until every consumer has passed them', async () => {
    const { db, events } = await import('@erxes/core-db');
    const { sql, eq } = await import('drizzle-orm');

    const { dismissEventFailures, listEventFailures, pruneEvents } =
      await import('~/modules/events/events.service');

    const failing = { name: 'test.failing', handle: async () => Promise.reject(new Error('nope')) };
    const passing = { name: 'test.passing', handle: async () => undefined };

    await publish('hr.old.happened');
    await adminDb().execute(sql`update core_events set created_at = now() - interval '40 days'`);

    // A consumer that never ran holds everything back.
    expect(await pruneEvents(adminDb(), 30, ['test.failing', 'test.never'])).toBe(0);

    await drain(failing);
    await drain(passing);

    // test.failing still has to retry its failures: those events stay.
    const kept = await adminDb().select({ id: events.id }).from(events);
    const failures = await listEventFailures(adminDb(), owner, {});
    const open = failures.data.filter((failure) => failure.consumer === 'test.failing');

    expect(open.length).toBe(kept.length);
    expect(await pruneEvents(adminDb(), 30, ['test.failing', 'test.passing'])).toBe(0);

    expect(
      await dismissEventFailures(adminDb(), owner, {
        failures: open.map((failure) => ({
          consumer: failure.consumer,
          eventId: failure.event.id,
        })),
      }),
    ).toEqual({ dismissed: open.length });

    // test.flaky's history (from the first test) is gone too, so all old events go.
    expect(await pruneEvents(adminDb(), 30, ['test.failing', 'test.passing'])).toBe(kept.length);

    await publish('hr.new.happened');
    await drain(failing);
    await drain(passing);
    await dismissEventFailures(adminDb(), owner, {
      failures: (await listEventFailures(adminDb(), owner, {})).data.map((f) => ({
        consumer: f.consumer,
        eventId: f.event.id,
      })),
    });
    // Recent events stay, handled or not.
    expect(await pruneEvents(adminDb(), 30, ['test.failing', 'test.passing'])).toBe(0);
    expect(
      (await adminDb().select().from(events).where(eq(events.type, 'hr.new.happened'))).length,
    ).toBe(1);
  });

  it('signs audit checkpoints and catches entries cut off the end of the chain', async () => {
    const { db, auditCheckpoints } = await import('@erxes/core-db');
    const { sql } = await import('drizzle-orm');
    const { recordAudit, verifyAudit } = await import('~/modules/audit/audit.service');
    const { listCheckpoints, signAuditCheckpoints } = await import('~/modules/audit/checkpoints');
    const { publicJwks } = await import('~/lib/signing');
    const { createLocalJWKSet, jwtVerify } = await import('jose');

    const caller = {
      orgId: owner.orgId,
      actorType: 'user' as const,
      actorId: owner.userId,
      source: 'core',
    };

    for (let index = 0; index < 3; index += 1) {
      await recordAudit(adminDb(), caller, {
        action: 'customer.created',
        targetType: 'customer',
        targetId: `c${index}`,
      });
    }

    expect(await signAuditCheckpoints(adminDb())).toBeGreaterThanOrEqual(1);
    // Nothing new since: nothing to sign.
    expect(await signAuditCheckpoints(adminDb(), owner.orgId)).toBe(0);

    const { data } = await listCheckpoints(adminDb(), owner.orgId, { limit: 10 });
    const latest = data[data.length - 1]!;

    // Anyone can check a checkpoint with the published keys alone.
    const { payload } = await jwtVerify(latest.signature, createLocalJWKSet(publicJwks()), {
      issuer: 'erxes-core',
    });

    expect(payload).toMatchObject({ org: owner.orgId, seq: latest.chainSeq, hash: latest.hash });

    let result = await verifyAudit(adminDb(), owner);

    expect(result.ok).toBe(true);
    expect(result.checkpoints.mismatchAt).toBeNull();
    expect(result.checkpoints.latestSeq).toBeGreaterThanOrEqual(latest.chainSeq);

    // Remove the newest entries (as only someone with database access could):
    // the chain itself still looks whole, the checkpoint doesn't.
    const head = result.checkpoints.latestSeq!;

    await adminDb().transaction(async (tx) => {
      await tx.execute(sql`set local core.audit_prune = 'on'`);
      await tx.execute(
        sql`delete from core_audit_logs where org_id = ${owner.orgId} and chain_seq >= ${head - 1}`,
      );
    });

    result = await verifyAudit(adminDb(), owner);
    expect(result.brokenAt).toBeNull();
    expect(result.ok).toBe(false);
    expect(result.checkpoints.mismatchAt).not.toBeNull();

    // Checkpoints themselves are append-only.
    await expect(adminDb().delete(auditCheckpoints)).rejects.toBeTruthy();
    // And a tampered chain is never signed over.
    await recordAudit(adminDb(), caller, {
      action: 'customer.created',
      targetType: 'customer',
      targetId: 'c9',
    });
    expect(await signAuditCheckpoints(adminDb(), owner.orgId)).toBe(0);
  });

  it('publishes core’s public keys', async () => {
    const { publicJwks } = await import('~/lib/signing');
    const { keys } = publicJwks();

    expect(keys[0]).toMatchObject({ kty: 'EC', crv: 'P-256', alg: 'ES256', use: 'sig' });
    expect(keys[0]).not.toHaveProperty('d');
  });
});
