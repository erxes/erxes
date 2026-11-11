/* eslint-disable @typescript-eslint/no-explicit-any */
import { rm } from 'node:fs/promises';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { createApp } from '~/app';
import { signAccessToken } from '~/http/auth';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { describeWithDb, useTestDatabase } from './db';
import { pluginToken, requestPluginToken } from './plugin';

/** The database's own message behind a Drizzle query error. */
const dbError = (query: Promise<unknown>) =>
  query.then(
    () => '',
    (error: { cause?: { message?: string }; message: string }) =>
      error.cause?.message ?? error.message,
  );

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
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'owner@acme.mn' },
    });
    const globex = await createOrganization({
      subdomain: 'globex',
      name: 'Globex',
      owner: { email: 'owner@globex.mn' },
    });

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
      // Plugins never send their secret on API calls: they exchange it for a token.
      const token = await requestPluginToken(base, auth.org, auth.plugin);

      if (token.status !== 200) return token;

      headers.authorization = `Bearer ${token.body.access_token}`;
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
    const started = await call(token, '/files', {
      method: 'POST',
      body: { name, contentType, size: bytes.length },
    });

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

      expect(started.body.file).toMatchObject({
        name: 'notes.txt',
        status: 'pending',
        size: bytes.length,
      });
      expect(put.status).toBe(204);

      const done = await call(memberToken, `/files/${started.body.file.id}/complete`, {
        method: 'POST',
      });

      expect(done.status).toBe(200);
      expect(done.body).toMatchObject({
        status: 'ready',
        uploadedBy: { type: 'user', id: memberId },
      });

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
      const { started } = await upload(
        memberToken,
        'page.html',
        'text/html',
        Buffer.from('<script>1</script>'),
      );
      const done = await call(memberToken, `/files/${started.body.file.id}/complete`, {
        method: 'POST',
      });
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

      const done = await call(memberToken, `/files/${started.body.file.id}/complete`, {
        method: 'POST',
      });

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
        (
          await call(memberToken, '/settings/files', {
            method: 'PUT',
            body: { maxSizeMb: 1, allowedTypes: [] },
          })
        ).status,
      ).toBe(403);
      expect(
        (
          await call(ownerToken, '/settings/files', {
            method: 'PUT',
            body: { maxSizeMb: 50, allowedTypes: [] },
          })
        ).body.code,
      ).toBe('LIMIT_EXCEEDED');

      const saved = await call(ownerToken, '/settings/files', {
        method: 'PUT',
        body: { maxSizeMb: 2, allowedTypes: ['image/*', '.PDF'] },
      });

      expect(saved.body).toMatchObject({
        maxSizeMb: 2,
        allowedTypes: ['image/*', '.pdf'],
        limitMb: 5,
        storage: 'local',
      });

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

      await call(ownerToken, '/settings/files', {
        method: 'PUT',
        body: { maxSizeMb: 5, allowedTypes: [] },
      });
    });

    it('keeps files inside their organisation and lets only the uploader or a manager delete', async () => {
      const { started } = await upload(memberToken, 'c.txt', 'text/plain', Buffer.from('c'));
      const id = started.body.file.id;

      // Only the uploader can finish an upload.
      expect((await call(ownerToken, `/files/${id}/complete`, { method: 'POST' })).status).toBe(
        404,
      );
      await call(memberToken, `/files/${id}/complete`, { method: 'POST' });

      expect((await call(otherOrgToken, `/files/${id}`)).status).toBe(404);
      expect(
        (
          await fetch(`${base}/core/v1/files/${id}/download`, {
            headers: { authorization: `Bearer ${otherOrgToken}` },
          })
        ).status,
      ).toBe(404);

      const list = await call(ownerToken, `/files?ids=${id},missing`);

      expect(list.body.data.map((file: { id: string }) => file.id)).toEqual([id]);

      const { started: ownerFile } = await upload(
        ownerToken,
        'd.txt',
        'text/plain',
        Buffer.from('d'),
      );

      await call(ownerToken, `/files/${ownerFile.body.file.id}/complete`, { method: 'POST' });

      expect(
        (await call(memberToken, `/files/${ownerFile.body.file.id}`, { method: 'DELETE' })).status,
      ).toBe(403);
      expect((await call(ownerToken, `/files/${id}`, { method: 'DELETE' })).status).toBe(200);
      expect((await call(ownerToken, `/files/${id}`)).status).toBe(404);
    });

    it('lets plugins upload for an organisation', async () => {
      // The client secret itself is never accepted on API calls…
      const bare = await call(PLUGIN_KEY, '/files', {
        method: 'POST',
        body: { name: 'x.txt', contentType: 'text/plain', size: 1 },
      });

      expect(bare.status).toBe(401);

      // …and the deployment-wide token (no organisation) only updates the manifest.
      const service = await call(await pluginToken(base), '/files', {
        method: 'POST',
        body: { name: 'x.txt', contentType: 'text/plain', size: 1 },
      });

      expect(service.status).toBe(403);
      expect(service.body.code).toBe('ORG_REQUIRED');

      const viaPlugin = await call(hr(), '/files', {
        method: 'POST',
        body: { name: 'contract.pdf', contentType: 'application/pdf', size: 4 },
      });

      expect(viaPlugin.status).toBe(201);
      expect(viaPlugin.body.file).toMatchObject({
        source: 'hr',
        uploadedBy: { type: 'plugin', id: 'hr' },
      });
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

      expect(
        (
          await call(hr(), '/notifications', {
            method: 'POST',
            body: { ...base, kind: 'ecom.order.paid' },
          })
        ).body.code,
      ).toBe('INVALID_TYPE');
      expect(
        (
          await call(hr(), '/notifications', {
            method: 'POST',
            body: { ...base, kind: 'hr.x', userIds: ['nobody'] },
          })
        ).body.code,
      ).toBe('INVALID_RECIPIENT');
      expect(
        (
          await call(hr(), '/notifications', {
            method: 'POST',
            body: { ...base, kind: 'hr.x', link: 'https://evil.example' },
          })
        ).body.code,
      ).toBe('INVALID_INPUT');
      // Members can't create notifications; plugins can't read inboxes.
      expect(
        (
          await call(memberToken, '/notifications', {
            method: 'POST',
            body: { ...base, kind: 'hr.x' },
          })
        ).status,
      ).toBe(403);
      expect((await call(hr(), '/notifications')).status).toBe(403);
      // No token for an organisation that hasn't installed the plugin.
      expect(
        (await call({ plugin: PLUGIN_KEY, org: 'missing' }, '/notifications/unread-count')).body
          .code,
      ).toBe('NOT_INSTALLED');
    });

    it('gives each member their own inbox with unread counts', async () => {
      await call(hr(), '/notifications', {
        method: 'POST',
        body: { userIds: [memberId], kind: 'hr.review.due', title: 'Review due', priority: 'high' },
      });

      expect((await call(memberToken, '/notifications/unread-count')).body.count).toBe(2);
      expect((await call(ownerToken, '/notifications/unread-count')).body.count).toBe(0);

      const inbox = await call(memberToken, '/notifications?unread=true');

      expect(inbox.body.data.map((item: { kind: string }) => item.kind)).toEqual([
        'hr.review.due',
        'hr.leave.requested',
      ]);
      expect(inbox.body.data[1]).toMatchObject({
        source: 'hr',
        read: false,
        entity: { type: 'leave', id: 'abc' },
      });

      const first = inbox.body.data[0].id;

      expect(
        (await call(ownerToken, '/notifications/read', { method: 'POST', body: { ids: [first] } }))
          .body.updated,
      ).toBe(0);
      expect(
        (await call(memberToken, '/notifications/read', { method: 'POST', body: { ids: [first] } }))
          .body.updated,
      ).toBe(1);
      expect((await call(memberToken, '/notifications/unread-count')).body.count).toBe(1);
      expect(
        (await call(memberToken, '/notifications/read', { method: 'POST', body: {} })).body.updated,
      ).toBe(1);
      expect((await call(memberToken, '/notifications?unread=true')).body.data).toHaveLength(0);

      expect((await call(ownerToken, `/notifications/${first}`, { method: 'DELETE' })).status).toBe(
        404,
      );
      expect(
        (await call(memberToken, `/notifications/${first}`, { method: 'DELETE' })).status,
      ).toBe(200);
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

  describe('inboxes', () => {
    it('counts unread per inbox and filters one plugin’s inbox', async () => {
      await call(memberToken, '/notifications/read', { method: 'POST', body: {} });
      await call(hr(), '/notifications', {
        method: 'POST',
        body: {
          userIds: [memberId],
          kind: 'hr.onboarding.started',
          title: 'Onboarding started',
          priority: 'high',
        },
      });

      const counts = await call(memberToken, '/notifications/unread-count');
      const hrOnly = await call(memberToken, '/notifications/unread-count?source=hr');

      expect(counts.body.bySource.hr).toBe(1);
      expect(hrOnly.body).toEqual({ count: 1, bySource: { hr: 1 } });

      const important = await call(memberToken, '/notifications?source=hr&priority=high');

      expect(important.body.data.map((item: { kind: string }) => item.kind)).toEqual([
        'hr.onboarding.started',
      ]);
      expect((await call(memberToken, '/notifications?kind=hr.onboarding.')).body.totalCount).toBe(
        1,
      );
    });

    it('lets members mute a plugin or a kind, but not security notices', async () => {
      const saved = await call(memberToken, '/notifications/settings', {
        method: 'PUT',
        body: { muted: ['hr', 'core.customer.updated', 'core.user.role_changed'] },
      });

      expect(saved.body.sources).toContain('hr');

      const muted = await call(hr(), '/notifications', {
        method: 'POST',
        body: { userIds: [memberId], kind: 'hr.x', title: 'muted' },
      });

      expect(muted.body).toEqual({ created: 0, skipped: 1 });

      await call(ownerToken, `/users/${memberId}`, { method: 'PATCH', body: { role: 'admin' } });
      await call(ownerToken, `/users/${memberId}`, { method: 'PATCH', body: { role: 'member' } });

      const roles = await call(memberToken, '/notifications?kind=core.user.role_changed');

      expect(roles.body.totalCount).toBe(2);
      expect(roles.body.data[0]).toMatchObject({
        priority: 'high',
        data: { changes: { role: ['admin', 'member'] } },
      });

      await call(memberToken, '/notifications/settings', { method: 'PUT', body: { muted: [] } });
    });

    it('tells owners what others change, merging quick edits into one notification', async () => {
      const customer = await call(memberToken, '/customers', {
        method: 'POST',
        body: { firstName: 'Watched', primaryEmail: 'watched@mail.mn', ownerId: memberId },
      });
      const id = customer.body.id;

      await call(ownerToken, `/customers/${id}`, {
        method: 'PATCH',
        body: { position: 'Manager' },
      });
      await call(ownerToken, `/customers/${id}`, {
        method: 'PATCH',
        body: { position: 'Director', code: 'C-1' },
      });

      const updates = await call(memberToken, `/notifications?kind=core.customer.updated`);

      expect(updates.body.totalCount).toBe(1);
      expect(updates.body.data[0].data.changes).toEqual({
        position: [null, 'Director'],
        code: [null, 'C-1'],
      });

      // The owner's own edits don't notify them.
      await call(memberToken, `/customers/${id}`, {
        method: 'PATCH',
        body: { department: 'Sales' },
      });
      expect(
        (await call(memberToken, `/notifications?kind=core.customer.updated`)).body.totalCount,
      ).toBe(1);

      // A plugin event on the record reaches the owner's inbox for that plugin.
      await call(hr(), '/activities', {
        method: 'POST',
        body: {
          targetType: 'customer',
          targetId: id,
          type: 'hr.candidate.hired',
          summary: 'Hired as Director',
        },
      });

      const fromHr = await call(memberToken, '/notifications?source=hr&kind=hr.candidate.hired');

      expect(fromHr.body.data[0]).toMatchObject({
        title: 'Hired as Director',
        link: `/contacts/customers/${id}`,
      });

      await call(ownerToken, '/customers/remove', { method: 'POST', body: { ids: [id] } });

      const deleted = await call(memberToken, `/notifications?kind=core.customer.deleted`);

      expect(deleted.body.data[0]).toMatchObject({ body: 'Watched', link: null });
    });
  });

  describe('activity timeline', () => {
    it('records customer changes, tags, links and merges', async () => {
      const a = await call(ownerToken, '/customers', {
        method: 'POST',
        body: { firstName: 'Anu', primaryEmail: 'anu@mail.mn' },
      });
      const b = await call(ownerToken, '/customers', {
        method: 'POST',
        body: { firstName: 'Anu B', primaryEmail: 'anub@mail.mn' },
      });
      const tag = await call(ownerToken, '/tags', {
        method: 'POST',
        body: { type: 'customer', name: 'VIP' },
      });
      const company = await call(ownerToken, '/companies', {
        method: 'POST',
        body: { primaryName: 'Nomad LLC' },
      });

      await call(ownerToken, `/customers/${a.body.id}`, {
        method: 'PATCH',
        body: { lastName: 'Bold', firstName: 'Anu' },
      });
      await call(ownerToken, '/customers/tag', {
        method: 'POST',
        body: { ids: [a.body.id], add: [tag.body.id], remove: [] },
      });
      await call(ownerToken, `/customers/${a.body.id}/companies/${company.body.id}`, {
        method: 'PUT',
      });
      await call(ownerToken, `/customers/${b.body.id}`, {
        method: 'PATCH',
        body: { position: 'CEO' },
      });

      const timeline = await call(
        memberToken,
        `/activities?targetType=customer&targetId=${a.body.id}`,
      );

      expect(timeline.body.data.map((item: { type: string }) => item.type)).toEqual([
        'customer.company_linked',
        'customer.tagged',
        'customer.updated',
        'customer.created',
      ]);
      expect(timeline.body.data[2].data).toEqual({ changes: { lastName: [null, 'Bold'] } });
      expect(timeline.body.data[1].data).toEqual({ added: [tag.body.id], removed: [] });

      const companyTimeline = await call(
        memberToken,
        `/activities?targetType=company&targetId=${company.body.id}`,
      );

      expect(companyTimeline.body.data[0]).toMatchObject({
        type: 'company.customer_linked',
        data: { customerId: a.body.id },
      });

      // Merging moves the other customer's timeline to the one kept.
      await call(ownerToken, '/customers/merge', {
        method: 'POST',
        body: { ids: [a.body.id, b.body.id], keepId: a.body.id },
      });

      const merged = await call(
        memberToken,
        `/activities?targetType=customer&targetId=${a.body.id}`,
      );
      const types = merged.body.data.map((item: { type: string }) => item.type);

      expect(types[0]).toBe('customer.merged');
      expect(merged.body.data[0].data.mergedIds).toEqual([b.body.id]);
      expect(types.filter((type: string) => type === 'customer.created')).toHaveLength(2);

      // Deleting a customer deletes its timeline.
      await call(ownerToken, '/customers/remove', { method: 'POST', body: { ids: [a.body.id] } });

      const { db, activities } = await import('@erxes/core-db');
      const { eq } = await import('drizzle-orm');

      expect(
        await db().select().from(activities).where(eq(activities.targetId, a.body.id)),
      ).toHaveLength(0);
    });

    it('lets plugins add entries, retry-safe, to records of their organisation', async () => {
      const customer = await call(ownerToken, '/customers', {
        method: 'POST',
        body: { firstName: 'Guest', primaryEmail: 'guest@mail.mn' },
      });
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
      expect(retry.body).toMatchObject({
        created: false,
        activity: { id: first.body.activity.id },
      });
      expect(first.body.activity).toMatchObject({
        source: 'hr',
        actor: { type: 'user', id: memberId },
      });

      expect(
        (
          await call(hr(), '/activities', {
            method: 'POST',
            body: { ...entry, dedupeKey: undefined, type: 'ecom.x.y' },
          })
        ).body.code,
      ).toBe('INVALID_TYPE');
      expect(
        (
          await call({ plugin: PLUGIN_KEY, org: otherOrgId }, '/activities', {
            method: 'POST',
            body: { ...entry, dedupeKey: undefined },
          })
        ).status,
      ).toBe(404);
      expect((await call(memberToken, '/activities', { method: 'POST', body: entry })).status).toBe(
        403,
      );

      const timeline = await call(
        ownerToken,
        `/activities?targetType=customer&targetId=${customer.body.id}&source=hr`,
      );

      expect(timeline.body.data).toHaveLength(1);
      expect(
        (await call(otherOrgToken, `/activities?targetType=customer&targetId=${customer.body.id}`))
          .status,
      ).toBe(404);
    });
  });

  describe('own account', () => {
    it('changes my password only with the current one, and lists my sign-ins', async () => {
      const { db, users } = await import('@erxes/core-db');
      const { eq } = await import('drizzle-orm');
      const { hashPassword } = await import('~/modules/auth/password');

      await db()
        .update(users)
        .set({ passwordHash: await hashPassword('Owner-pass-123') })
        .where(eq(users.id, ownerId));

      const wrong = await call(ownerToken, '/auth/password', {
        method: 'POST',
        body: { currentPassword: 'nope', newPassword: 'Owner-pass-456' },
      });
      const same = await call(ownerToken, '/auth/password', {
        method: 'POST',
        body: { currentPassword: 'Owner-pass-123', newPassword: 'Owner-pass-123' },
      });
      const changed = await call(ownerToken, '/auth/password', {
        method: 'POST',
        body: { currentPassword: 'Owner-pass-123', newPassword: 'Owner-pass-456' },
      });

      expect(wrong.body.code).toBe('WRONG_PASSWORD');
      expect(same.body.code).toBe('SAME_PASSWORD');
      expect(changed.status).toBe(200);

      // A failed and a successful sign-in show up in my list, not in others'.
      await fetch(`${base}/core/v1/auth/sign-in`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: 'owner@acme.mn',
          password: 'Owner-pass-123',
          subdomain: 'acme',
        }),
      });
      await fetch(`${base}/core/v1/auth/sign-in`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: 'owner@acme.mn',
          password: 'Owner-pass-456',
          subdomain: 'acme',
        }),
      });

      const mine = await call(ownerToken, '/auth/sign-ins');

      expect(
        mine.body.data.map((entry: { success: boolean }) => entry.success).slice(0, 2),
      ).toEqual([true, false]);
      expect((await call(memberToken, '/auth/sign-ins')).body.data).toHaveLength(0);
    });

    it('lets a member edit their own profile, not their role', async () => {
      const saved = await call(memberToken, `/users/${memberId}`, {
        method: 'PATCH',
        body: { firstName: 'Bold', lastName: 'Bat', links: { github: 'https://github.com/bold' } },
      });

      expect(saved.body).toMatchObject({
        firstName: 'Bold',
        lastName: 'Bat',
        links: { github: 'https://github.com/bold' },
      });
      expect(
        (
          await call(memberToken, `/users/${memberId}`, {
            method: 'PATCH',
            body: { role: 'admin' },
          })
        ).body.code,
      ).toBe('OWN_ROLE');
    });
  });

  describe('audit log', () => {
    it('records who changed what, for owners and admins only', async () => {
      const customer = await call(ownerToken, '/customers', {
        method: 'POST',
        body: { firstName: 'Audited', primaryEmail: 'audited@mail.mn' },
      });

      await call(ownerToken, `/customers/${customer.body.id}`, {
        method: 'PATCH',
        body: { position: 'CTO' },
      });
      await call(ownerToken, `/users/${memberId}`, { method: 'PATCH', body: { role: 'admin' } });
      await call(ownerToken, '/customers/remove', {
        method: 'POST',
        body: { ids: [customer.body.id] },
      });

      expect((await call(memberToken, '/audit')).status).toBe(200); // now an admin
      await call(ownerToken, `/users/${memberId}`, { method: 'PATCH', body: { role: 'member' } });
      expect((await call(memberToken, '/audit')).status).toBe(403);

      const entries = await call(ownerToken, `/audit?targetId=${customer.body.id}`);

      expect(entries.body.data.map((entry: { action: string }) => entry.action).slice(-2)).toEqual([
        'customer.updated',
        'customer.created',
      ]);
      expect(
        entries.body.data.find((entry: { action: string }) => entry.action === 'customer.updated'),
      ).toMatchObject({
        actor: { type: 'user', id: ownerId },
        targetLabel: 'Audited',
        changes: { position: [null, 'CTO'] },
      });

      const roles = await call(ownerToken, `/audit?action=user.role_changed&targetId=${memberId}`);

      expect(roles.body.data[0].changes).toEqual({ role: ['admin', 'member'] });

      const prefixed = await call(ownerToken, '/audit?action=file.');

      expect(prefixed.body.data.length).toBeGreaterThan(0);
      expect(
        prefixed.body.data.every((entry: { action: string }) => entry.action.startsWith('file.')),
      ).toBe(true);

      expect(
        (await call(otherOrgToken, `/audit?targetId=${customer.body.id}`)).body.data,
      ).toHaveLength(0);
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

  describe('event stream', () => {
    it('publishes in the caller’s transaction: rolled back means never published', async () => {
      const { db } = await import('@erxes/core-db');
      const { sql } = await import('drizzle-orm');
      const customer = await call(ownerToken, '/customers', {
        method: 'POST',
        body: { firstName: 'Streamed', primaryEmail: 'streamed@mail.mn', ownerId: memberId },
      });

      await db()
        .transaction(async (tx) => {
          await tx.execute(
            sql`select core_publish_event(${orgId}, 'hr', 'hr.contract.drafted', '{}'::jsonb, 'customer', ${customer.body.id}, 'Drafted a contract')`,
          );
          throw new Error('roll back');
        })
        .catch(() => undefined);
      await db().execute(
        sql`select core_publish_event(${orgId}, 'hr', 'hr.contract.signed', '{"contractId":"c1"}'::jsonb, 'customer', ${customer.body.id}, 'Signed contract C-1', '/hr/contracts/c1', null, 'contract-c1')`,
      );
      await db().execute(
        sql`select core_publish_event(${orgId}, 'hr', 'hr.contract.signed', '{}'::jsonb, 'customer', ${customer.body.id}, 'Signed contract C-1', null, null, 'contract-c1')`,
      );
      expect(
        await dbError(
          db().execute(sql`select core_publish_event(${orgId}, 'hr', 'ecom.order.paid')`),
        ),
      ).toMatch(/must start with "hr\."/);

      const { processEvents } = await import('~/modules/events/processor');

      await processEvents();

      const timeline = await call(
        ownerToken,
        `/activities?targetType=customer&targetId=${customer.body.id}&kind=plugins`,
      );

      expect(timeline.body.data.map((entry: { summary: string }) => entry.summary)).toEqual([
        'Signed contract C-1',
      ]);
      expect(timeline.body.data[0]).toMatchObject({
        source: 'hr',
        link: '/hr/contracts/c1',
        data: { contractId: 'c1' },
      });

      // The owner hears about it in HR's inbox; running again changes nothing.
      await processEvents();

      const inbox = await call(memberToken, '/notifications?source=hr&kind=hr.contract.signed');

      expect(inbox.body.totalCount).toBe(1);
    });

    it('lets plugins publish over HTTP, checks what they send, and notifies', async () => {
      const bad = await call(hr(), '/events', {
        method: 'POST',
        body: { events: [{ type: 'hr.x.y', summary: 'no subject' }] },
      });

      expect(bad.body.code).toBe('SUBJECT_REQUIRED');

      const sent = await call(hr(), '/events', {
        method: 'POST',
        body: {
          events: [
            {
              type: 'hr.review.scheduled',
              payload: { reviewId: 'r1' },
              notify: { userIds: [memberId], title: 'Review on Friday', priority: 'high' },
              dedupeKey: 'review-r1',
            },
          ],
        },
      });
      const again = await call(hr(), '/events', {
        method: 'POST',
        body: { events: [{ type: 'hr.review.scheduled', dedupeKey: 'review-r1' }] },
      });

      expect(sent.body).toEqual({ published: 1, duplicates: 0 });
      expect(again.body).toEqual({ published: 0, duplicates: 1 });

      const { processEvents } = await import('~/modules/events/processor');

      await processEvents();

      const inbox = await call(memberToken, '/notifications?kind=hr.review.scheduled');

      expect(inbox.body.data[0]).toMatchObject({
        title: 'Review on Friday',
        priority: 'high',
        source: 'hr',
      });

      // Core's own changes are in the stream too (for automations).
      const stream = await call(ownerToken, '/events?type=core.customer.');

      expect(stream.body.data.length).toBeGreaterThan(0);
      expect((await call(memberToken, '/events')).status).toBe(403);
    });
  });

  describe('audit hardening', () => {
    it('takes plugin entries into the same log, filterable by source', async () => {
      const { db } = await import('@erxes/core-db');
      const { sql } = await import('drizzle-orm');
      const recorded = await call(hr(), '/audit', {
        method: 'POST',
        body: {
          entries: [
            {
              action: 'hr.employee.deleted',
              actorUserId: memberId,
              targetType: 'employee',
              targetId: 'e1',
              targetLabel: 'Bat Dorj',
              ip: '203.0.113.7',
            },
          ],
        },
      });

      expect(recorded.body).toEqual({ recorded: 1 });
      expect(
        (
          await call(hr(), '/audit', {
            method: 'POST',
            body: { entries: [{ action: 'core.user.deleted' }] },
          })
        ).body.code,
      ).toBe('INVALID_TYPE');

      await db().execute(
        sql`select core_record_audit(${orgId}, 'hr', 'hr.salary.changed', ${ownerId}, 'employee', 'e2', 'Saraa', '{"salary":[1,2]}'::jsonb)`,
      );

      const fromHr = await call(ownerToken, '/audit?source=hr');

      expect(fromHr.body.data.map((entry: { action: string }) => entry.action)).toEqual([
        'hr.salary.changed',
        'hr.employee.deleted',
      ]);
      expect(fromHr.body.data[1]).toMatchObject({
        actor: { type: 'user', id: memberId },
        ip: '203.0.113.7',
        source: 'hr',
      });
      expect((await call(ownerToken, '/audit?ip=203.0.113.7')).body.totalCount).toBe(1);
      expect((await call(ownerToken, '/audit?q=Bat%20deleted')).body.data[0].targetLabel).toBe(
        'Bat Dorj',
      );
      expect((await call(ownerToken, '/audit')).body.totalCapped).toBe(false);
    });

    it('is append-only and shows when an entry was changed', async () => {
      const { db } = await import('@erxes/core-db');
      const { sql } = await import('drizzle-orm');

      expect((await call(ownerToken, '/audit/verify')).body).toMatchObject({
        ok: true,
        brokenAt: null,
      });
      expect(
        await dbError(
          db().execute(sql`update core_audit_logs set target_label = 'x' where org_id = ${orgId}`),
        ),
      ).toMatch(/append-only/);
      expect(
        await dbError(db().execute(sql`delete from core_audit_logs where org_id = ${orgId}`)),
      ).toMatch(/append-only/);
      expect(await dbError(db().execute(sql`truncate core_audit_logs`))).toMatch(/append-only/);

      // Someone with database rights switches the guard off and edits an entry.
      await db().execute(
        sql`alter table core_audit_logs disable trigger core_audit_logs_append_only`,
      );
      await db().execute(sql`
        update core_audit_logs set target_label = 'tampered'
        where id = (select id from core_audit_logs where org_id = ${orgId} order by chain_seq limit 1 offset 2)
      `);
      await db().execute(
        sql`alter table core_audit_logs enable trigger core_audit_logs_append_only`,
      );

      const check = await call(ownerToken, '/audit/verify');

      expect(check.body).toMatchObject({ ok: false, brokenAt: 3 });
      expect((await call(otherOrgToken, '/audit/verify')).body.ok).toBe(true);
    });

    it('prunes by each organisation’s retention, only through the cleanup', async () => {
      const { db } = await import('@erxes/core-db');
      const { sql } = await import('drizzle-orm');
      const { pruneAudit } = await import('~/modules/audit/audit.service');

      await db().execute(sql`
        insert into core_audit_logs (id, org_id, actor_type, action, created_at)
        values ('old-entry-1', ${otherOrgId}, 'system', 'test.old', now() - interval '400 days'),
               ('old-entry-2', ${otherOrgId}, 'system', 'test.recent', now() - interval '40 days')
      `);

      expect(
        (await call(memberToken, '/settings/audit', { method: 'PUT', body: { retentionDays: 30 } }))
          .status,
      ).toBe(403);
      expect(
        (
          await call(otherOrgToken, '/settings/audit', {
            method: 'PUT',
            body: { retentionDays: 30 },
          })
        ).body,
      ).toEqual({
        retentionDays: 30,
        maxRetentionDays: 365,
      });

      expect(await pruneAudit(db(), 365)).toBeGreaterThanOrEqual(2);

      const left = await db().execute(
        sql`select id from core_audit_logs where id in ('old-entry-1', 'old-entry-2')`,
      );

      expect(left.rows).toHaveLength(0);
    });

    it('exports CSV and JSON, defusing spreadsheet formulas, and audits the export', async () => {
      await call(hr(), '/audit', {
        method: 'POST',
        body: { entries: [{ action: 'hr.note.added', targetLabel: '=HYPERLINK("http://evil")' }] },
      });

      const csv = await fetch(`${base}/core/v1/audit/export?format=csv&source=hr`, {
        headers: { authorization: `Bearer ${ownerToken}` },
      });
      const text = await csv.text();

      expect(csv.headers.get('content-disposition')).toMatch(
        /attachment; filename="audit-log-.*\.csv"/,
      );
      expect(text.split('\n')[0]).toBe(
        'createdAt,source,actorType,actorId,action,targetType,targetId,targetLabel,changes,metadata,ip,userAgent,chainSeq,hash',
      );
      expect(text).toContain(`"'=HYPERLINK(""http://evil"")"`);

      const json = await fetch(`${base}/core/v1/audit/export?format=json&action=hr.note.added`, {
        headers: { authorization: `Bearer ${ownerToken}` },
      }).then((response) => response.json() as Promise<Record<string, unknown>[]>);

      expect(json).toHaveLength(1);
      expect(json[0]).not.toHaveProperty('orgId');
      expect(
        (
          await fetch(`${base}/core/v1/audit/export`, {
            headers: { authorization: `Bearer ${memberToken}` },
          })
        ).status,
      ).toBe(403);
      expect((await call(ownerToken, '/audit?action=audit.exported')).body.totalCount).toBe(2);
    });

    it('records sign-outs and sign-ins with unknown emails', async () => {
      await fetch(`${base}/core/v1/auth/sign-in`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'nobody@acme.mn', password: 'x', subdomain: 'acme' }),
      });

      const unknown = await call(ownerToken, '/audit?action=auth.sign_in_failed&q=nobody');

      expect(unknown.body.data[0]).toMatchObject({
        actor: { type: 'system' },
        targetLabel: 'nobody@acme.mn',
      });

      await fetch(`${base}/core/v1/auth/sign-out`, {
        method: 'POST',
        headers: { cookie: `erxes_session=${memberToken}`, 'sec-fetch-site': 'same-origin' },
      });

      expect(
        (await call(ownerToken, `/audit?action=auth.signed_out&actorId=${memberId}`)).body
          .totalCount,
      ).toBe(1);
    });
  });

  describe('notes', () => {
    it('adds notes with mentions and files; only the author edits, anyone pins', async () => {
      const customer = await call(ownerToken, '/customers', {
        method: 'POST',
        body: { firstName: 'Noted', primaryEmail: 'noted@mail.mn' },
      });
      const id = customer.body.id;

      expect(
        (
          await call(ownerToken, '/activities/notes', {
            method: 'POST',
            body: { targetType: 'customer', targetId: id, body: 'x', fileIds: ['missing'] },
          })
        ).body.code,
      ).toBe('INVALID_FILE');

      const note = await call(ownerToken, '/activities/notes', {
        method: 'POST',
        body: {
          targetType: 'customer',
          targetId: id,
          body: 'Call back on Monday @member',
          mentions: [memberId],
        },
      });

      expect(note.status).toBe(201);
      expect(note.body).toMatchObject({
        type: 'customer.note',
        pinned: false,
        data: { body: 'Call back on Monday @member' },
      });

      const mention = await call(memberToken, '/notifications?kind=core.note.mentioned');

      expect(mention.body.data[0]).toMatchObject({
        body: 'Call back on Monday @member',
        link: `/contacts/customers/${id}`,
      });

      expect(
        (
          await call(memberToken, `/activities/notes/${note.body.id}`, {
            method: 'PATCH',
            body: { body: 'mine now' },
          })
        ).body.code,
      ).toBe('NOT_AUTHOR');

      const pinned = await call(memberToken, `/activities/notes/${note.body.id}`, {
        method: 'PATCH',
        body: { pinned: true },
      });
      const edited = await call(ownerToken, `/activities/notes/${note.body.id}`, {
        method: 'PATCH',
        body: { body: 'Call back on Tuesday' },
      });

      expect(pinned.body.pinned).toBe(true);
      expect(edited.body).toMatchObject({ pinned: true, data: { body: 'Call back on Tuesday' } });
      expect(edited.body.editedAt).not.toBeNull();

      const notes = await call(
        ownerToken,
        `/activities?targetType=customer&targetId=${id}&kind=notes`,
      );
      const changes = await call(
        ownerToken,
        `/activities?targetType=customer&targetId=${id}&kind=changes`,
      );
      const pins = await call(
        ownerToken,
        `/activities?targetType=customer&targetId=${id}&pinned=true`,
      );

      expect(notes.body.data).toHaveLength(1);
      expect(changes.body.data.map((entry: { type: string }) => entry.type)).toEqual([
        'customer.created',
      ]);
      expect(pins.body.data).toHaveLength(1);

      expect(
        (await call(memberToken, `/activities/notes/${note.body.id}`, { method: 'DELETE' })).status,
      ).toBe(403);
      expect(
        (await call(ownerToken, `/activities/notes/${note.body.id}`, { method: 'DELETE' })).status,
      ).toBe(200);
    });

    it('shows a company’s customers’ entries on its timeline when asked', async () => {
      const company = await call(ownerToken, '/companies', {
        method: 'POST',
        body: { primaryName: 'Rollup LLC' },
      });
      const customer = await call(ownerToken, '/customers', {
        method: 'POST',
        body: { firstName: 'Rolled', primaryEmail: 'rolled@mail.mn' },
      });

      await call(ownerToken, `/customers/${customer.body.id}/companies/${company.body.id}`, {
        method: 'PUT',
      });
      await call(ownerToken, '/activities/notes', {
        method: 'POST',
        body: { targetType: 'customer', targetId: customer.body.id, body: 'Prefers email' },
      });

      const own = await call(
        ownerToken,
        `/activities?targetType=company&targetId=${company.body.id}&kind=notes`,
      );
      const rolled = await call(
        ownerToken,
        `/activities?targetType=company&targetId=${company.body.id}&kind=notes&includeRelated=true`,
      );

      expect(own.body.data).toHaveLength(0);
      expect(rolled.body.data[0]).toMatchObject({
        targetType: 'customer',
        targetId: customer.body.id,
      });
    });
  });
});
