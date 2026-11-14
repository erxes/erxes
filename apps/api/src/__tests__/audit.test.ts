import { withSystem } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { pruneAudit } from '~/modules/audit/audit.service';
import { adminDb, dbError, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/** Who changed what: core and plugin entries, the hash chain, retention and exports. */
describe('audit log', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('records who changed what, for owners and admins only', async () => {
    const customer = await t
      .owner()
      .customers.create({ firstName: 'Audited', primaryEmail: 'audited@mail.mn' });

    await t.owner().customers.update({ id: customer.id, position: 'CTO' });
    await t.owner().users.update({ id: t.ids.member, role: 'admin' });
    await t.owner().customers.remove({ ids: [customer.id] });

    // An admin now.
    expect((await t.member().audit.list({})).data.length).toBeGreaterThan(0);
    await t.owner().users.update({ id: t.ids.member, role: 'member' });
    await expect(t.member().audit.list({})).rejects.toMatchObject({ status: 403 });

    const entries = await t.owner().audit.list({ targetId: customer.id });

    expect(entries.data.map((entry) => entry.action).slice(-2)).toEqual([
      'customer.updated',
      'customer.created',
    ]);
    expect(entries.data.find((entry) => entry.action === 'customer.updated')).toMatchObject({
      actorType: 'user',
      actorId: t.ids.owner,
      targetLabel: 'Audited',
      changes: { position: [null, 'CTO'] },
    });

    const roles = await t
      .owner()
      .audit.list({ action: 'user.role_changed', targetId: t.ids.member });

    expect(roles.data[0]?.changes).toEqual({ role: ['admin', 'member'] });

    const prefixed = await t.owner().audit.list({ action: 'customer.' });

    expect(prefixed.data.map((entry) => entry.action)).toEqual([
      'customer.deleted',
      'customer.updated',
      'customer.created',
    ]);
    expect((await t.other().audit.list({ targetId: customer.id })).data).toHaveLength(0);
  });

  it('never stores password hashes', async () => {
    await t.owner().users.setPassword({ id: t.ids.member, password: 'A-new-password-123' });

    const entries = await t.owner().audit.list({ targetId: t.ids.member });

    expect(JSON.stringify(entries)).not.toMatch(/scrypt|passwordHash/);
    expect(entries.data[0]?.action).toBe('user.password_set');
  });

  it('takes plugin entries into the same log, filterable by source', async () => {
    const recorded = await t.hr().audit.record({
      entries: [
        {
          action: 'hr.employee.deleted',
          actorUserId: t.ids.member,
          targetType: 'employee',
          targetId: 'e1',
          targetLabel: 'Bat Dorj',
          ip: '203.0.113.7',
        },
      ],
    });

    expect(recorded).toEqual({ recorded: 1 });
    await expect(
      t.hr().audit.record({ entries: [{ action: 'core.user.deleted' }] }),
    ).rejects.toMatchObject({ code: 'INVALID_TYPE' });

    await adminDb().execute(
      sql`select core_record_audit(${t.ids.org}, 'hr', 'hr.salary.changed', ${t.ids.owner}, 'employee', 'e2', 'Saraa', '{"salary":[1,2]}'::jsonb)`,
    );

    const fromHr = await t.owner().audit.list({ source: 'hr' });

    expect(fromHr.data.map((entry) => entry.action)).toEqual([
      'hr.salary.changed',
      'hr.employee.deleted',
    ]);
    expect(fromHr.data[1]).toMatchObject({
      actorType: 'user',
      actorId: t.ids.member,
      ip: '203.0.113.7',
      source: 'hr',
    });
    expect((await t.owner().audit.list({ ip: '203.0.113.7' })).totalCount).toBe(1);
    expect((await t.owner().audit.list({ q: 'Bat deleted' })).data[0]?.targetLabel).toBe(
      'Bat Dorj',
    );
    expect((await t.owner().audit.list({})).totalCapped).toBe(false);
  });

  it('is append-only and shows when an entry was changed', async () => {
    const { org } = t.ids;

    expect(await t.owner().audit.verify({})).toMatchObject({ ok: true, brokenAt: null });
    expect(
      await dbError(
        adminDb().execute(sql`update core_audit_logs set target_label = 'x' where org_id = ${org}`),
      ),
    ).toMatch(/append-only/);
    expect(
      await dbError(adminDb().execute(sql`delete from core_audit_logs where org_id = ${org}`)),
    ).toMatch(/append-only/);
    expect(await dbError(adminDb().execute(sql`truncate core_audit_logs`))).toMatch(/append-only/);

    // Someone with database rights switches the guard off and edits an entry.
    await adminDb().execute(
      sql`alter table core_audit_logs disable trigger core_audit_logs_append_only`,
    );
    await adminDb().execute(sql`
      update core_audit_logs set target_label = 'tampered'
      where id = (select id from core_audit_logs where org_id = ${org} order by chain_seq limit 1 offset 2)
    `);
    await adminDb().execute(
      sql`alter table core_audit_logs enable trigger core_audit_logs_append_only`,
    );

    expect(await t.owner().audit.verify({})).toMatchObject({ ok: false, brokenAt: 3 });
    expect((await t.other().audit.verify({})).ok).toBe(true);
  });

  it('prunes by each organisation’s retention, only through the cleanup', async () => {
    await adminDb().execute(sql`
      insert into core_audit_logs (id, org_id, actor_type, action, created_at)
      values ('old-entry-1', ${t.ids.otherOrg}, 'system', 'test.old', now() - interval '400 days'),
             ('old-entry-2', ${t.ids.otherOrg}, 'system', 'test.recent', now() - interval '40 days')
    `);

    await expect(t.member().audit.updateSettings({ retentionDays: 30 })).rejects.toMatchObject({
      status: 403,
    });
    expect(await t.other().audit.updateSettings({ retentionDays: 30 })).toEqual({
      retentionDays: 30,
      maxRetentionDays: 365,
    });
    expect(await withSystem('cleanup: audit', (tx) => pruneAudit(tx, 365))).toBeGreaterThanOrEqual(
      2,
    );

    const left = await adminDb().execute(
      sql`select id from core_audit_logs where id in ${['old-entry-1', 'old-entry-2']}`,
    );

    expect(left.rows).toHaveLength(0);
  });

  it('exports CSV and JSON, defusing spreadsheet formulas, and audits the export', async () => {
    await t.hr().audit.record({
      entries: [{ action: 'hr.note.added', targetLabel: '=HYPERLINK("http://evil")' }],
    });

    const asOwner = { headers: t.headers(await t.token()) };
    const csv = await fetch(t.url('/core/v1/audit/export?format=csv&source=hr'), asOwner);
    const text = await csv.text();

    expect(csv.headers.get('content-disposition')).toMatch(
      /attachment; filename="audit-log-.*\.csv"/,
    );
    expect(text.split('\n')[0]).toBe(
      'createdAt,source,actorType,actorId,action,targetType,targetId,targetLabel,changes,metadata,ip,userAgent,chainSeq,hash',
    );
    expect(text).toContain(`"'=HYPERLINK(""http://evil"")"`);

    const json = await fetch(
      t.url('/core/v1/audit/export?format=json&action=hr.note.added'),
      asOwner,
    ).then((response) => response.text());

    expect(json).toContain('hr.note.added');
    expect(json).not.toContain('orgId');

    const asMember = { headers: t.headers(await t.token(t.ids.member)) };

    expect((await fetch(t.url('/core/v1/audit/export'), asMember)).status).toBe(403);
    expect((await t.owner().audit.list({ action: 'audit.exported' })).totalCount).toBe(2);
  });

  it('records sign-outs and sign-ins with unknown emails', async () => {
    await expect(
      t.client().auth.signIn({ email: 'nobody@acme.mn', password: 'x', subdomain: 'acme' }),
    ).rejects.toMatchObject({ status: 401 });

    const unknown = await t.owner().audit.list({ action: 'auth.sign_in_failed', q: 'nobody' });

    expect(unknown.data[0]).toMatchObject({
      actorType: 'system',
      targetLabel: 'nobody@acme.mn',
    });

    await fetch(t.url('/core/v1/auth/sign-out'), {
      method: 'POST',
      headers: {
        cookie: `erxes_session=${await t.token(t.ids.member)}`,
        'sec-fetch-site': 'same-origin',
      },
    });

    const signedOut = await t
      .owner()
      .audit.list({ action: 'auth.signed_out', actorId: t.ids.member });

    expect(signedOut.totalCount).toBe(1);
  });
});
