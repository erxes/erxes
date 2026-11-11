/* eslint-disable @typescript-eslint/no-explicit-any */
import { rm } from 'node:fs/promises';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '~/app';
import { signAccessToken } from '~/http/auth';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { describeWithDb, useTestDatabase } from './db';

const PLUGIN_KEY = 'hr:test-hr-plugin-key-0123456789abcdefghijklmnop'.slice(3);

/** Files, notifications, the activity timeline and the audit log. */
describeWithDb('platform services', () => {
  useTestDatabase();

  let server: Server;
  let base = '';
  let orgId = '';
  let otherOrgId = '';
  let ownerId = '';
  let memberId = '';
  let disabledId = '';
  let ownerToken = '';
  let memberToken = '';
  let otherOrgToken = '';

  beforeAll(async () => {
    const { db, users, newId } = await import('@erxes/core-db');
    const acme = await createOrganization({ subdomain: 'acme', name: 'Acme', owner: { email: 'owner@acme.mn' } });
    const globex = await createOrganization({ subdomain: 'globex', name: 'Globex', owner: { email: 'owner@globex.mn' } });

    orgId = acme.organization.id;
    otherOrgId = globex.organization.id;
    ownerId = acme.owner.id;
    memberId = newId();
    disabledId = newId();

    await db()
      .insert(users)
      .values([
        { id: memberId, orgId, email: 'member@acme.mn', role: 'member', status: 'active' },
        { id: disabledId, orgId, email: 'gone@acme.mn', role: 'member', status: 'disabled' },
      ]);

    ownerToken = signAccessToken(ownerId, orgId);
    memberToken = signAccessToken(memberId, orgId);
    otherOrgToken = signAccessToken(globex.owner.id, otherOrgId);

    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    await new Promise<void>((done) => server.close(() => done()));
    await rm(resolve(__dirname, '../../.test-files'), { recursive: true, force: true });
  });

  const call = async (
    auth: string | { plugin: string; org: string },
    path: string,
    init: { method?: string; body?: unknown } = {},
  ): Promise<{ status: number; body: any }> => {
    const headers: Record<string, string> = { 'content-type': 'application/json' };

    if (typeof auth === 'string') {
      headers.authorization = `Bearer ${auth}`;
    } else {
      headers.authorization = `Bearer ${auth.plugin}`;
      headers['x-erxes-org'] = auth.org;
    }

    const response = await fetch(`${base}/core/v1${path}`, {
      method: init.method ?? 'GET',
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    const text = await response.text();

    return { status: response.status, body: text ? JSON.parse(text) : null };
  };

  const hr = () => ({ plugin: PLUGIN_KEY, org: orgId });

  const upload = async (token: string, name: string, contentType: string, bytes: Buffer) => {
    const started = await call(token, '/files', { method: 'POST', body: { name, contentType, size: bytes.length } });

    expect(started.status).toBe(201);

    const put = await fetch(`${base}${started.body.upload.url}`, {
      method: 'PUT',
      headers: started.body.upload.headers,
      body: bytes,
    });

    return { started, put };
  };

  describe('files', () => {
    it('uploads in two steps and serves the file through a signed link', async () => {
      const bytes = Buffer.from('hello erxes');
      const { started, put } = await upload(memberToken, 'notes.txt', 'text/plain', bytes);

      expect(started.body.file).toMatchObject({ name: 'notes.txt', status: 'pending', size: bytes.length });
      expect(put.status).toBe(204);

      const done = await call(memberToken, `/files/${started.body.file.id}/complete`, { method: 'POST' });

      expect(done.status).toBe(200);
      expect(done.body).toMatchObject({ status: 'ready', uploadedBy: { type: 'user', id: memberId } });

      const got = await call(memberToken, `/files/${done.body.id}`);
      const download = await fetch(`${base}${got.body.downloadUrl}`);

      expect(await download.text()).toBe('hello erxes');
      expect(download.headers.get('content-disposition')).toMatch(/^inline; filename="notes.txt"/);
      expect(download.headers.get('x-content-type-options')).toBe('nosniff');

      // The stable address redirects signed-in members to a fresh link.
      const redirect = await fetch(`${base}${done.body.url}`, {
        headers: { authorization: `Bearer ${ownerToken}` },
        redirect: 'manual',
      });

      expect(redirect.status).toBe(302);
      expect(redirect.headers.get('location')).toMatch(/\/core\/v1\/files\/signed\//);
    });

    it('serves risky types as downloads, never inline', async () => {
      const { started } = await upload(memberToken, 'page.html', 'text/html', Buffer.from('<script>1</script>'));
      const done = await call(memberToken, `/files/${started.body.file.id}/complete`, { method: 'POST' });
      const got = await call(memberToken, `/files/${done.body.id}`);
      const download = await fetch(`${base}${got.body.downloadUrl}`);

      expect(download.headers.get('content-disposition')).toMatch(/^attachment;/);
      expect(download.headers.get('content-security-policy')).toContain('sandbox');
    });

    it('rejects bytes that differ from what was declared', async () => {
      const started = await call(memberToken, '/files', {
        method: 'POST',
        body: { name: 'a.txt', contentType: 'text/plain', size: 3 },
      });
      const put = await fetch(`${base}${started.body.upload.url}`, {
        method: 'PUT',
        headers: started.body.upload.headers,
        body: Buffer.from('longer than three'),
      });

      expect(put.status).toBe(400);

      const done = await call(memberToken, `/files/${started.body.file.id}/complete`, { method: 'POST' });

      expect(done.status).toBe(409);
      expect(done.body.code).toBe('UPLOAD_INCOMPLETE');
    });

    it('refuses forged or reused-for-another-purpose links', async () => {
      const { started } = await upload(memberToken, 'b.txt', 'text/plain', Buffer.from('b'));
      const token = (started.body.upload.url as string).split('/').pop()!;
      const forged = `${token.split('.')[0]}.AAAA`;

      expect((await fetch(`${base}/core/v1/files/signed/${forged}`)).status).toBe(403);
      // An upload link can't be used to read.
      expect((await fetch(`${base}/core/v1/files/signed/${token}`)).status).toBe(403);
    });

    it('applies the deployment limit, the blocked list and the organisation settings', async () => {
      const big = await call(memberToken, '/files', {
        method: 'POST',
        body: { name: 'big.zip', contentType: 'application/zip', size: 6 * 1024 * 1024 },
      });

      expect(big.status).toBe(400);
      expect(big.body.code).toBe('FILE_TOO_LARGE');

      const program = await call(memberToken, '/files', {
        method: 'POST',
        body: { name: 'setup.exe', contentType: 'application/octet-stream', size: 10 },
      });

      expect(program.body.code).toBe('FILE_TYPE_NOT_ALLOWED');

      expect(
        (await call(memberToken, '/settings/files', { method: 'PUT', body: { maxSizeMb: 1, allowedTypes: [] } })).status,
      ).toBe(403);
      expect(
        (await call(ownerToken, '/settings/files', { method: 'PUT', body: { maxSizeMb: 50, allowedTypes: [] } })).body
          .code,
      ).toBe('LIMIT_EXCEEDED');

      const saved = await call(ownerToken, '/settings/files', {
        method: 'PUT',
        body: { maxSizeMb: 2, allowedTypes: ['image/*', '.PDF'] },
      });

      expect(saved.body).toMatchObject({ maxSizeMb: 2, allowedTypes: ['image/*', '.pdf'], limitMb: 5, storage: 'local' });

      const text = await call(memberToken, '/files', {
        method: 'POST',
        body: { name: 'a.txt', contentType: 'text/plain', size: 1 },
      });
      const image = await call(memberToken, '/files', {
        method: 'POST',
        body: { name: 'a.png', contentType: 'image/png', size: 1 },
      });
      const pdf = await call(memberToken, '/files', {
        method: 'POST',
        body: { name: 'Report.PDF', contentType: 'application/pdf', size: 1 },
      });

      expect(text.body.code).toBe('FILE_TYPE_NOT_ALLOWED');
      expect(image.status).toBe(201);
      expect(pdf.status).toBe(201);

      await call(ownerToken, '/settings/files', { method: 'PUT', body: { maxSizeMb: 5, allowedTypes: [] } });
    });

    it('keeps files inside their organisation and lets only the uploader or a manager delete', async () => {
      const { started } = await upload(memberToken, 'c.txt', 'text/plain', Buffer.from('c'));
      const id = started.body.file.id;

      // Only the uploader can finish an upload.
      expect((await call(ownerToken, `/files/${id}/complete`, { method: 'POST' })).status).toBe(404);
      await call(memberToken, `/files/${id}/complete`, { method: 'POST' });

      expect((await call(otherOrgToken, `/files/${id}`)).status).toBe(404);
      expect(
        (await fetch(`${base}/core/v1/files/${id}/download`, { headers: { authorization: `Bearer ${otherOrgToken}` } }))
          .status,
      ).toBe(404);

      const list = await call(ownerToken, `/files?ids=${id},missing`);

      expect(list.body.data.map((file: { id: string }) => file.id)).toEqual([id]);

      const { started: ownerFile } = await upload(ownerToken, 'd.txt', 'text/plain', Buffer.from('d'));

      await call(ownerToken, `/files/${ownerFile.body.file.id}/complete`, { method: 'POST' });

      expect((await call(memberToken, `/files/${ownerFile.body.file.id}`, { method: 'DELETE' })).status).toBe(403);
      expect((await call(ownerToken, `/files/${id}`, { method: 'DELETE' })).status).toBe(200);
      expect((await call(ownerToken, `/files/${id}`)).status).toBe(404);
    });

    it('lets plugins upload for an organisation', async () => {
      // A plugin key must name the organisation it acts for.
      const bare = await call(PLUGIN_KEY, '/files', {
        method: 'POST',
        body: { name: 'x.txt', contentType: 'text/plain', size: 1 },
      });

      expect(bare.status).toBe(400);
      expect(bare.body.code).toBe('ORG_REQUIRED');

      const viaPlugin = await call(hr(), '/files', {
        method: 'POST',
        body: { name: 'contract.pdf', contentType: 'application/pdf', size: 4 },
      });

      expect(viaPlugin.status).toBe(201);
      expect(viaPlugin.body.file).toMatchObject({ source: 'hr', uploadedBy: { type: 'plugin', id: 'hr' } });
    });
  });

  describe('notifications', () => {
    it('lets plugins notify members, retry-safe, and skips inactive members', async () => {
      const body = {
        userIds: [memberId, disabledId],
        kind: 'hr.leave.requested',
        title: 'Leave request from Bat',
        link: '/hr/leaves/abc',
        entity: { type: 'leave', id: 'abc' },
        dedupeKey: 'leave-abc',
      };
      const first = await call(hr(), '/notifications', { method: 'POST', body });
      const retry = await call(hr(), '/notifications', { method: 'POST', body });

      expect(first.status).toBe(201);
      expect(first.body).toEqual({ created: 1, skipped: 1 });
      expect(retry.body).toEqual({ created: 0, skipped: 2 });
    });

    it('checks what plugins send', async () => {
      const base = { userIds: [memberId], title: 'x' };

      expect((await call(hr(), '/notifications', { method: 'POST', body: { ...base, kind: 'ecom.order.paid' } })).body.code).toBe(
        'INVALID_TYPE',
      );
      expect(
        (await call(hr(), '/notifications', { method: 'POST', body: { ...base, kind: 'hr.x', userIds: ['nobody'] } })).body
          .code,
      ).toBe('INVALID_RECIPIENT');
      expect(
        (await call(hr(), '/notifications', { method: 'POST', body: { ...base, kind: 'hr.x', link: 'https://evil.example' } }))
          .body.code,
      ).toBe('INVALID_INPUT');
      // Members can't create notifications; plugins can't read inboxes.
      expect((await call(memberToken, '/notifications', { method: 'POST', body: { ...base, kind: 'hr.x' } })).status).toBe(
        403,
      );
      expect((await call(hr(), '/notifications')).status).toBe(403);
      expect((await call({ plugin: PLUGIN_KEY, org: 'missing' }, '/notifications/unread-count')).status).toBe(401);
    });

    it('gives each member their own inbox with unread counts', async () => {
      await call(hr(), '/notifications', {
        method: 'POST',
        body: { userIds: [memberId], kind: 'hr.review.due', title: 'Review due', priority: 'high' },
      });

      expect((await call(memberToken, '/notifications/unread-count')).body.count).toBe(2);
      expect((await call(ownerToken, '/notifications/unread-count')).body.count).toBe(0);

      const inbox = await call(memberToken, '/notifications?unread=true');

      expect(inbox.body.data.map((item: { kind: string }) => item.kind)).toEqual(['hr.review.due', 'hr.leave.requested']);
      expect(inbox.body.data[1]).toMatchObject({ source: 'hr', read: false, entity: { type: 'leave', id: 'abc' } });

      const first = inbox.body.data[0].id;

      expect((await call(ownerToken, '/notifications/read', { method: 'POST', body: { ids: [first] } })).body.updated).toBe(
        0,
      );
      expect((await call(memberToken, '/notifications/read', { method: 'POST', body: { ids: [first] } })).body.updated).toBe(
        1,
      );
      expect((await call(memberToken, '/notifications/unread-count')).body.count).toBe(1);
      expect((await call(memberToken, '/notifications/read', { method: 'POST', body: {} })).body.updated).toBe(1);
      expect((await call(memberToken, '/notifications?unread=true')).body.data).toHaveLength(0);

      expect((await call(ownerToken, `/notifications/${first}`, { method: 'DELETE' })).status).toBe(404);
      expect((await call(memberToken, `/notifications/${first}`, { method: 'DELETE' })).status).toBe(200);
    });

    it('tells a member when someone else makes them a customer’s owner', async () => {
      const created = await call(ownerToken, '/customers', {
        method: 'POST',
        body: { firstName: 'Owned', primaryEmail: 'owned@mail.mn', ownerId: memberId },
      });
      const inbox = await call(memberToken, '/notifications?source=core');

      expect(inbox.body.data[0]).toMatchObject({
        kind: 'core.customer.assigned',
        body: 'Owned',
        link: `/contacts/customers/${created.body.id}`,
        actor: { type: 'user', id: ownerId },
      });

      // Making yourself owner doesn't notify you.
      await call(memberToken, '/customers', {
        method: 'POST',
        body: { firstName: 'Mine', primaryEmail: 'mine@mail.mn', ownerId: memberId },
      });
      expect((await call(memberToken, '/notifications?source=core')).body.totalCount).toBe(1);
    });
  });

  describe('activity timeline', () => {
    it('records customer changes, tags, links and merges', async () => {
      const a = await call(ownerToken, '/customers', { method: 'POST', body: { firstName: 'Anu', primaryEmail: 'anu@mail.mn' } });
      const b = await call(ownerToken, '/customers', { method: 'POST', body: { firstName: 'Anu B', primaryEmail: 'anub@mail.mn' } });
      const tag = await call(ownerToken, '/tags', { method: 'POST', body: { type: 'customer', name: 'VIP' } });
      const company = await call(ownerToken, '/companies', { method: 'POST', body: { primaryName: 'Nomad LLC' } });

      await call(ownerToken, `/customers/${a.body.id}`, { method: 'PATCH', body: { lastName: 'Bold', firstName: 'Anu' } });
      await call(ownerToken, '/customers/tag', { method: 'POST', body: { ids: [a.body.id], add: [tag.body.id], remove: [] } });
      await call(ownerToken, `/customers/${a.body.id}/companies/${company.body.id}`, { method: 'PUT' });
      await call(ownerToken, `/customers/${b.body.id}`, { method: 'PATCH', body: { position: 'CEO' } });

      const timeline = await call(memberToken, `/activities?targetType=customer&targetId=${a.body.id}`);

      expect(timeline.body.data.map((item: { type: string }) => item.type)).toEqual([
        'customer.company_linked',
        'customer.tagged',
        'customer.updated',
        'customer.created',
      ]);
      expect(timeline.body.data[2].data).toEqual({ changes: { lastName: [null, 'Bold'] } });
      expect(timeline.body.data[1].data).toEqual({ added: [tag.body.id], removed: [] });

      const companyTimeline = await call(memberToken, `/activities?targetType=company&targetId=${company.body.id}`);

      expect(companyTimeline.body.data[0]).toMatchObject({ type: 'company.customer_linked', data: { customerId: a.body.id } });

      // Merging moves the other customer's timeline to the one kept.
      await call(ownerToken, '/customers/merge', { method: 'POST', body: { ids: [a.body.id, b.body.id], keepId: a.body.id } });

      const merged = await call(memberToken, `/activities?targetType=customer&targetId=${a.body.id}`);
      const types = merged.body.data.map((item: { type: string }) => item.type);

      expect(types[0]).toBe('customer.merged');
      expect(merged.body.data[0].data.mergedIds).toEqual([b.body.id]);
      expect(types.filter((type: string) => type === 'customer.created')).toHaveLength(2);

      // Deleting a customer deletes its timeline.
      await call(ownerToken, '/customers/remove', { method: 'POST', body: { ids: [a.body.id] } });

      const { db, activities } = await import('@erxes/core-db');
      const { eq } = await import('drizzle-orm');

      expect(await db().select().from(activities).where(eq(activities.targetId, a.body.id))).toHaveLength(0);
    });

    it('lets plugins add entries, retry-safe, to records of their organisation', async () => {
      const customer = await call(ownerToken, '/customers', { method: 'POST', body: { firstName: 'Guest', primaryEmail: 'guest@mail.mn' } });
      const entry = {
        targetType: 'customer',
        targetId: customer.body.id,
        type: 'hr.candidate.applied',
        summary: 'Applied for Accountant',
        entity: { type: 'application', id: 'app1' },
        link: '/hr/applications/app1',
        actorUserId: memberId,
        dedupeKey: 'application-app1',
      };
      const first = await call(hr(), '/activities', { method: 'POST', body: entry });
      const retry = await call(hr(), '/activities', { method: 'POST', body: entry });

      expect(first.status).toBe(201);
      expect(first.body.created).toBe(true);
      expect(retry.body).toMatchObject({ created: false, activity: { id: first.body.activity.id } });
      expect(first.body.activity).toMatchObject({ source: 'hr', actor: { type: 'user', id: memberId } });

      expect((await call(hr(), '/activities', { method: 'POST', body: { ...entry, dedupeKey: undefined, type: 'ecom.x.y' } })).body.code).toBe(
        'INVALID_TYPE',
      );
      expect(
        (await call({ plugin: PLUGIN_KEY, org: otherOrgId }, '/activities', { method: 'POST', body: { ...entry, dedupeKey: undefined } }))
          .status,
      ).toBe(404);
      expect((await call(memberToken, '/activities', { method: 'POST', body: entry })).status).toBe(403);

      const timeline = await call(ownerToken, `/activities?targetType=customer&targetId=${customer.body.id}&source=hr`);

      expect(timeline.body.data).toHaveLength(1);
      expect((await call(otherOrgToken, `/activities?targetType=customer&targetId=${customer.body.id}`)).status).toBe(404);
    });
  });

  describe('audit log', () => {
    it('records who changed what, for owners and admins only', async () => {
      const customer = await call(ownerToken, '/customers', { method: 'POST', body: { firstName: 'Audited', primaryEmail: 'audited@mail.mn' } });

      await call(ownerToken, `/customers/${customer.body.id}`, { method: 'PATCH', body: { position: 'CTO' } });
      await call(ownerToken, `/users/${memberId}`, { method: 'PATCH', body: { role: 'admin' } });
      await call(ownerToken, '/customers/remove', { method: 'POST', body: { ids: [customer.body.id] } });

      expect((await call(memberToken, '/audit')).status).toBe(200); // now an admin
      await call(ownerToken, `/users/${memberId}`, { method: 'PATCH', body: { role: 'member' } });
      expect((await call(memberToken, '/audit')).status).toBe(403);

      const entries = await call(ownerToken, `/audit?targetId=${customer.body.id}`);

      expect(entries.body.data.map((entry: { action: string }) => entry.action).slice(-2)).toEqual([
        'customer.updated',
        'customer.created',
      ]);
      expect(entries.body.data.find((entry: { action: string }) => entry.action === 'customer.updated')).toMatchObject({
        actor: { type: 'user', id: ownerId },
        targetLabel: 'Audited',
        changes: { position: [null, 'CTO'] },
      });

      const roles = await call(ownerToken, `/audit?action=user.role_changed&targetId=${memberId}`);

      expect(roles.body.data[0].changes).toEqual({ role: ['admin', 'member'] });

      const prefixed = await call(ownerToken, '/audit?action=file.');

      expect(prefixed.body.data.length).toBeGreaterThan(0);
      expect(prefixed.body.data.every((entry: { action: string }) => entry.action.startsWith('file.'))).toBe(true);

      expect((await call(otherOrgToken, `/audit?targetId=${customer.body.id}`)).body.data).toHaveLength(0);
    });

    it('never stores password hashes', async () => {
      const set = await call(ownerToken, `/users/${memberId}/password`, {
        method: 'POST',
        body: { password: 'A-new-password-123' },
      });

      expect(set.status).toBe(200);

      const entries = await call(ownerToken, `/audit?targetId=${memberId}`);

      expect(JSON.stringify(entries.body)).not.toMatch(/scrypt|passwordHash/);
      expect(entries.body.data[0].action).toBe('user.password_set');
    });
  });
});
