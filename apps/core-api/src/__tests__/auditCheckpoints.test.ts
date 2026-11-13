import { auditCheckpoints } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { recordAudit } from '~/modules/audit/audit.service';
import { signAuditCheckpoints } from '~/modules/audit/checkpoints';
import { adminDb, dbError, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const Jwks = z.object({ keys: z.array(z.record(z.string(), z.unknown())) });

/** Signed audit checkpoints catch entries cut off the end of the chain. */
describe('audit checkpoints', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const jwksUrl = () => t.url('/core/v1/.well-known/jwks.json');

  const record = (targetId: string) =>
    recordAudit(
      adminDb(),
      { orgId: t.ids.org, actorType: 'user', actorId: t.ids.owner, source: 'core' },
      { action: 'customer.created', targetType: 'customer', targetId },
    );

  it('signs audit checkpoints and catches entries cut off the end of the chain', async () => {
    for (const id of ['c0', 'c1', 'c2']) await record(id);

    expect(await signAuditCheckpoints(adminDb())).toBeGreaterThanOrEqual(1);
    // Nothing new since: nothing to sign.
    expect(await signAuditCheckpoints(adminDb(), t.ids.org)).toBe(0);

    const { data } = await t.owner().audit.checkpoints({ limit: 10 });
    const latest = data.at(-1);

    if (!latest) throw new Error('no checkpoint was signed');

    // Anyone can check a checkpoint with the published keys alone.
    const { payload } = await jwtVerify(latest.signature, createRemoteJWKSet(new URL(jwksUrl())), {
      issuer: 'erxes-core',
    });

    expect(payload).toMatchObject({ org: t.ids.org, seq: latest.chainSeq, hash: latest.hash });

    const whole = await t.owner().audit.verify({});

    expect(whole).toMatchObject({ ok: true, checkpoints: { mismatchAt: null } });
    expect(whole.checkpoints.latestSeq).toBeGreaterThanOrEqual(latest.chainSeq);

    // Remove the newest entries (as only someone with database access could):
    // the chain itself still looks whole, the checkpoint doesn't.
    const head = whole.checkpoints.latestSeq ?? 0;

    await adminDb().transaction(async (tx) => {
      await tx.execute(sql`set local core.audit_prune = 'on'`);
      await tx.execute(
        sql`delete from core_audit_logs where org_id = ${t.ids.org} and chain_seq >= ${head - 1}`,
      );
    });

    const cut = await t.owner().audit.verify({});

    expect(cut).toMatchObject({ ok: false, brokenAt: null });
    expect(cut.checkpoints.mismatchAt).not.toBeNull();

    // Checkpoints themselves are append-only.
    expect(await dbError(adminDb().delete(auditCheckpoints))).toMatch(/append-only/);
    // And a tampered chain is never signed over.
    await record('c9');
    expect(await signAuditCheckpoints(adminDb(), t.ids.org)).toBe(0);
  });

  it('publishes core’s public keys', async () => {
    const { keys } = Jwks.parse(await (await fetch(jwksUrl())).json());

    expect(keys[0]).toMatchObject({ kty: 'EC', crv: 'P-256', alg: 'ES256', use: 'sig' });
    expect(keys[0]).not.toHaveProperty('d');
  });
});
