import type { ActivityInput } from '@erxes/core-contract';
import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { accessToken, HR_SECRET, useTestDatabase, useTestServer } from './support';

/** The database's own message behind a Drizzle query error. */
const dbError = (query: Promise<unknown>) =>
  query.then(
    () => '',
    (error: { cause?: { message?: string }; message: string }) =>
      error.cause?.message ?? error.message,
  );

/** Files, notifications, the activity timeline and the audit log. */
describe('platform services', () => {
  useTestDatabase();

  const server = useTestServer();
  let orgId = '';
  let otherOrgId = '';
  let ownerId = '';
  let memberId = '';
  let disabledId = '';
  let otherOwnerId = '';
  let owner = server.client();
  let member = server.client();
  let otherOrg = server.client();
  let hr = server.client();

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

    otherOwnerId = globex.owner.id;
    owner = server.client({ user: ownerId, org: orgId });
    member = server.client({ user: memberId, org: orgId });
    otherOrg = server.client({ user: otherOwnerId, org: otherOrgId });
    hr = server.client({ plugin: HR_SECRET, org: orgId });
  });

  // For raw requests (downloads, exports, cookies): fresh, like `owner` and `member`.
  const ownerToken = () => accessToken(ownerId, orgId);
  const memberToken = () => accessToken(memberId, orgId);
  const otherOrgToken = () => accessToken(otherOwnerId, otherOrgId);

  afterAll(async () => {
    await rm(resolve(__dirname, '../../.test-files'), { recursive: true, force: true });
  });

  const upload = async (token: string, name: string, contentType: string, bytes: Buffer) => {
    const started = await server
      .client(token)
      .files.createUpload({ name, contentType, size: bytes.length });

    expect(server.status()).toBe(201);

    const put = await fetch(server.url(started.upload.url), {
      method: 'PUT',
      headers: started.upload.headers,
      body: bytes,
    });

    return { started, put };
  };

  describe('files', () => {
    it('uploads in two steps and serves the file through a signed link', async () => {
      const bytes = Buffer.from('hello erxes');
      const { started, put } = await upload(await memberToken(), 'notes.txt', 'text/plain', bytes);

      expect(started.file).toMatchObject({
        name: 'notes.txt',
        status: 'pending',
        size: bytes.length,
      });
      expect(put.status).toBe(204);

      const done = await member.files.complete({ id: started.file.id });

      expect(server.status()).toBe(200);
      expect(done).toMatchObject({
        status: 'ready',
        uploadedBy: { type: 'user', id: memberId },
      });

      const got = await member.files.get({ id: done.id });
      const download = await fetch(server.url(got.downloadUrl ?? ''));

      expect(await download.text()).toBe('hello erxes');
      expect(download.headers.get('content-disposition')).toMatch(/^inline; filename="notes.txt"/);
      expect(download.headers.get('x-content-type-options')).toBe('nosniff');

      // The stable address redirects signed-in members to a fresh link.
      const redirect = await fetch(server.url(done.url), {
        headers: server.headers(await ownerToken()),
        redirect: 'manual',
      });

      expect(redirect.status).toBe(302);
      expect(redirect.headers.get('location')).toMatch(/\/core\/v1\/files\/signed\//);
    });

    it('serves risky types as downloads, never inline', async () => {
      const { started } = await upload(
        await memberToken(),
        'page.html',
        'text/html',
        Buffer.from('<script>1</script>'),
      );

      const done = await member.files.complete({ id: started.file.id });
      const got = await member.files.get({ id: done.id });
      const download = await fetch(server.url(got.downloadUrl ?? ''));

      expect(download.headers.get('content-disposition')).toMatch(/^attachment;/);
      expect(download.headers.get('content-security-policy')).toContain('sandbox');
    });

    it('rejects bytes that differ from what was declared', async () => {
      const started = await member.files.createUpload({
        name: 'a.txt',
        contentType: 'text/plain',
        size: 3,
      });

      const put = await fetch(server.url(started.upload.url), {
        method: 'PUT',
        headers: started.upload.headers,
        body: Buffer.from('longer than three'),
      });

      expect(put.status).toBe(400);
      await expect(member.files.complete({ id: started.file.id })).rejects.toMatchObject({
        status: 409,
        code: 'UPLOAD_INCOMPLETE',
      });
    });

    it('refuses forged or reused-for-another-purpose links', async () => {
      const { started } = await upload(
        await memberToken(),
        'b.txt',
        'text/plain',
        Buffer.from('b'),
      );

      const token = started.upload.url.split('/').at(-1) ?? '';
      const forged = `${token.split('.')[0]}.AAAA`;

      expect((await fetch(server.url(`/core/v1/files/signed/${forged}`))).status).toBe(403);
      // An upload link can't be used to read.
      expect((await fetch(server.url(`/core/v1/files/signed/${token}`))).status).toBe(403);
    });

    it('applies the deployment limit, the blocked list and the organisation settings', async () => {
      await expect(
        member.files.createUpload({
          name: 'big.zip',
          contentType: 'application/zip',
          size: 6 * 1024 * 1024,
        }),
      ).rejects.toMatchObject({ status: 400, code: 'FILE_TOO_LARGE' });
      await expect(
        member.files.createUpload({
          name: 'setup.exe',
          contentType: 'application/octet-stream',
          size: 10,
        }),
      ).rejects.toMatchObject({ code: 'FILE_TYPE_NOT_ALLOWED' });

      await expect(
        member.files.updateSettings({ maxSizeMb: 1, allowedTypes: [] }),
      ).rejects.toMatchObject({ status: 403 });
      await expect(
        owner.files.updateSettings({ maxSizeMb: 50, allowedTypes: [] }),
      ).rejects.toMatchObject({ code: 'LIMIT_EXCEEDED' });

      expect(
        await owner.files.updateSettings({ maxSizeMb: 2, allowedTypes: ['image/*', '.PDF'] }),
      ).toMatchObject({
        maxSizeMb: 2,
        allowedTypes: ['image/*', '.pdf'],
        limitMb: 5,
        storage: 'local',
      });

      await expect(
        member.files.createUpload({ name: 'a.txt', contentType: 'text/plain', size: 1 }),
      ).rejects.toMatchObject({ code: 'FILE_TYPE_NOT_ALLOWED' });
      expect(
        await member.files.createUpload({ name: 'a.png', contentType: 'image/png', size: 1 }),
      ).toMatchObject({ file: { name: 'a.png' } });
      expect(
        await member.files.createUpload({
          name: 'Report.PDF',
          contentType: 'application/pdf',
          size: 1,
        }),
      ).toMatchObject({ file: { name: 'Report.PDF' } });

      await owner.files.updateSettings({ maxSizeMb: 5, allowedTypes: [] });
    });

    it('keeps files inside their organisation and lets only the uploader or a manager delete', async () => {
      const { started } = await upload(
        await memberToken(),
        'c.txt',
        'text/plain',
        Buffer.from('c'),
      );

      const { id } = started.file;

      // Only the uploader can finish an upload.
      await expect(owner.files.complete({ id })).rejects.toMatchObject({ status: 404 });
      await member.files.complete({ id });

      await expect(otherOrg.files.get({ id })).rejects.toMatchObject({ status: 404 });
      expect(
        (
          await fetch(server.url(`/core/v1/files/${id}/download`), {
            headers: server.headers(await otherOrgToken()),
          })
        ).status,
      ).toBe(404);

      const list = await owner.files.list({ ids: `${id},missing` });

      expect(list.data.map((file) => file.id)).toEqual([id]);

      const { started: ownerFile } = await upload(
        await ownerToken(),
        'd.txt',
        'text/plain',
        Buffer.from('d'),
      );

      await owner.files.complete({ id: ownerFile.file.id });

      await expect(member.files.remove({ id: ownerFile.file.id })).rejects.toMatchObject({
        status: 403,
      });
      expect(await owner.files.remove({ id })).toEqual({ ok: true });
      expect(server.status()).toBe(200);
      await expect(owner.files.get({ id })).rejects.toMatchObject({ status: 404 });
    });

    it('lets plugins upload for an organisation', async () => {
      const file = { name: 'x.txt', contentType: 'text/plain', size: 1 };

      // The client secret itself is never accepted on API calls…
      await expect(server.client(HR_SECRET).files.createUpload(file)).rejects.toMatchObject({
        status: 401,
      });
      // …and the deployment-wide token (no organisation) only updates the manifest.
      await expect(
        server.client({ plugin: HR_SECRET }).files.createUpload(file),
      ).rejects.toMatchObject({ status: 403, code: 'ORG_REQUIRED' });

      const viaPlugin = await hr.files.createUpload({
        name: 'contract.pdf',
        contentType: 'application/pdf',
        size: 4,
      });

      expect(viaPlugin.file).toMatchObject({
        source: 'hr',
        uploadedBy: { type: 'plugin', id: 'hr' },
      });
    });
  });

  describe('notifications', () => {
    it('lets plugins notify members, retry-safe, and skips inactive members', async () => {
      const input = {
        userIds: [memberId, disabledId],
        kind: 'hr.leave.requested',
        title: 'Leave request from Bat',
        link: '/hr/leaves/abc',
        entity: { type: 'leave', id: 'abc' },
        dedupeKey: 'leave-abc',
      };

      expect(await hr.notifications.create(input)).toEqual({ created: 1, skipped: 1 });
      expect(server.status()).toBe(201);
      expect(await hr.notifications.create(input)).toEqual({ created: 0, skipped: 2 });
    });

    it('checks what plugins send', async () => {
      const base = { userIds: [memberId], title: 'x' };

      await expect(
        hr.notifications.create({ ...base, kind: 'ecom.order.paid' }),
      ).rejects.toMatchObject({ code: 'INVALID_TYPE' });
      await expect(
        hr.notifications.create({ ...base, kind: 'hr.x', userIds: ['nobody'] }),
      ).rejects.toMatchObject({ code: 'INVALID_RECIPIENT' });
      await expect(
        hr.notifications.create({ ...base, kind: 'hr.x', link: 'https://evil.example' }),
      ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
      // Members can't create notifications; plugins can't read inboxes.
      await expect(member.notifications.create({ ...base, kind: 'hr.x' })).rejects.toMatchObject({
        status: 403,
      });
      await expect(hr.notifications.list({})).rejects.toMatchObject({ status: 403 });
      // No token for an organisation that hasn't installed the plugin.
      await expect(
        server.client({ plugin: HR_SECRET, org: 'missing' }).notifications.unreadCount({}),
      ).rejects.toMatchObject({ code: 'NOT_INSTALLED' });
    });

    it('gives each member their own inbox with unread counts', async () => {
      await hr.notifications.create({
        userIds: [memberId],
        kind: 'hr.review.due',
        title: 'Review due',
        priority: 'high',
      });

      expect((await member.notifications.unreadCount({})).count).toBe(2);
      expect((await owner.notifications.unreadCount({})).count).toBe(0);

      const inbox = await member.notifications.list({ unread: 'true' });

      expect(inbox.data.map((item) => item.kind)).toEqual(['hr.review.due', 'hr.leave.requested']);
      expect(inbox.data[1]).toMatchObject({
        source: 'hr',
        read: false,
        entity: { type: 'leave', id: 'abc' },
      });

      const first = inbox.data[0]?.id ?? '';

      expect((await owner.notifications.markRead({ ids: [first] })).updated).toBe(0);
      expect((await member.notifications.markRead({ ids: [first] })).updated).toBe(1);
      expect((await member.notifications.unreadCount({})).count).toBe(1);
      expect((await member.notifications.markRead({})).updated).toBe(1);
      expect((await member.notifications.list({ unread: 'true' })).data).toHaveLength(0);

      await expect(owner.notifications.remove({ id: first })).rejects.toMatchObject({
        status: 404,
      });
      expect(await member.notifications.remove({ id: first })).toEqual({ ok: true });
      expect(server.status()).toBe(200);
    });

    it('tells a member when someone else makes them a customer’s owner', async () => {
      const created = await owner.customers.create({
        firstName: 'Owned',
        primaryEmail: 'owned@mail.mn',
        ownerId: memberId,
      });

      const inbox = await member.notifications.list({ source: 'core' });

      expect(inbox.data[0]).toMatchObject({
        kind: 'core.customer.assigned',
        body: 'Owned',
        link: `/contacts/customers/${created.id}`,
        actor: { type: 'user', id: ownerId },
      });

      // Making yourself owner doesn't notify you.
      await member.customers.create({
        firstName: 'Mine',
        primaryEmail: 'mine@mail.mn',
        ownerId: memberId,
      });
      expect((await member.notifications.list({ source: 'core' })).totalCount).toBe(1);
    });
  });

  describe('inboxes', () => {
    it('counts unread per inbox and filters one plugin’s inbox', async () => {
      await member.notifications.markRead({});
      await hr.notifications.create({
        userIds: [memberId],
        kind: 'hr.onboarding.started',
        title: 'Onboarding started',
        priority: 'high',
      });

      const counts = await member.notifications.unreadCount({});
      const hrOnly = await member.notifications.unreadCount({ source: 'hr' });

      expect(counts.bySource.hr).toBe(1);
      expect(hrOnly).toEqual({ count: 1, bySource: { hr: 1 } });

      const important = await member.notifications.list({ source: 'hr', priority: 'high' });

      expect(important.data.map((item) => item.kind)).toEqual(['hr.onboarding.started']);
      expect((await member.notifications.list({ kind: 'hr.onboarding.' })).totalCount).toBe(1);
    });

    it('lets members mute a plugin or a kind, but not security notices', async () => {
      const saved = await member.notifications.updateSettings({
        muted: ['hr', 'core.customer.updated', 'core.user.role_changed'],
      });

      expect(saved.sources).toContain('hr');

      expect(
        await hr.notifications.create({ userIds: [memberId], kind: 'hr.x', title: 'muted' }),
      ).toEqual({ created: 0, skipped: 1 });

      await owner.users.update({ id: memberId, role: 'admin' });
      await owner.users.update({ id: memberId, role: 'member' });

      const roles = await member.notifications.list({ kind: 'core.user.role_changed' });

      expect(roles.totalCount).toBe(2);
      expect(roles.data[0]).toMatchObject({
        priority: 'high',
        data: { changes: { role: ['admin', 'member'] } },
      });

      await member.notifications.updateSettings({ muted: [] });
    });

    it('tells owners what others change, merging quick edits into one notification', async () => {
      const { id } = await member.customers.create({
        firstName: 'Watched',
        primaryEmail: 'watched@mail.mn',
        ownerId: memberId,
      });

      await owner.customers.update({ id, position: 'Manager' });
      await owner.customers.update({ id, position: 'Director', code: 'C-1' });

      const updates = await member.notifications.list({ kind: 'core.customer.updated' });

      expect(updates.totalCount).toBe(1);
      expect(updates.data[0]?.data.changes).toEqual({
        position: [null, 'Director'],
        code: [null, 'C-1'],
      });

      // The owner's own edits don't notify them.
      await member.customers.update({ id, department: 'Sales' });
      expect((await member.notifications.list({ kind: 'core.customer.updated' })).totalCount).toBe(
        1,
      );

      // A plugin event on the record reaches the owner's inbox for that plugin.
      await hr.activities.create({
        targetType: 'customer',
        targetId: id,
        type: 'hr.candidate.hired',
        summary: 'Hired as Director',
      });

      const fromHr = await member.notifications.list({ source: 'hr', kind: 'hr.candidate.hired' });

      expect(fromHr.data[0]).toMatchObject({
        title: 'Hired as Director',
        link: `/contacts/customers/${id}`,
      });

      await owner.customers.remove({ ids: [id] });

      const deleted = await member.notifications.list({ kind: 'core.customer.deleted' });

      expect(deleted.data[0]).toMatchObject({ body: 'Watched', link: null });
    });
  });

  describe('activity timeline', () => {
    it('records customer changes, tags, links and merges', async () => {
      const a = await owner.customers.create({ firstName: 'Anu', primaryEmail: 'anu@mail.mn' });
      const b = await owner.customers.create({ firstName: 'Anu B', primaryEmail: 'anub@mail.mn' });
      const tag = await owner.tags.create({ type: 'customer', name: 'VIP' });
      const company = await owner.companies.create({ primaryName: 'Nomad LLC' });

      await owner.customers.update({ id: a.id, lastName: 'Bold', firstName: 'Anu' });
      await owner.customers.tag({ ids: [a.id], add: [tag.id], remove: [] });
      await owner.customers.linkCompany({ id: a.id, companyId: company.id });
      await owner.customers.update({ id: b.id, position: 'CEO' });

      const timeline = await member.activities.list({ targetType: 'customer', targetId: a.id });

      expect(timeline.data.map((item) => item.type)).toEqual([
        'customer.company_linked',
        'customer.tagged',
        'customer.updated',
        'customer.created',
      ]);
      expect(timeline.data[2]?.data).toEqual({ changes: { lastName: [null, 'Bold'] } });
      expect(timeline.data[1]?.data).toEqual({ added: [tag.id], removed: [] });

      const companyTimeline = await member.activities.list({
        targetType: 'company',
        targetId: company.id,
      });

      expect(companyTimeline.data[0]).toMatchObject({
        type: 'company.customer_linked',
        data: { customerId: a.id },
      });

      // Merging moves the other customer's timeline to the one kept.
      await owner.customers.merge({ ids: [a.id, b.id], keepId: a.id });

      const merged = await member.activities.list({ targetType: 'customer', targetId: a.id });
      const types = merged.data.map((item) => item.type);

      expect(types[0]).toBe('customer.merged');
      expect(merged.data[0]?.data.mergedIds).toEqual([b.id]);
      expect(types.filter((type) => type === 'customer.created')).toHaveLength(2);

      // Deleting a customer deletes its timeline.
      await owner.customers.remove({ ids: [a.id] });

      const { db, activities } = await import('@erxes/core-db');
      const { eq } = await import('drizzle-orm');

      expect(
        await db().select().from(activities).where(eq(activities.targetId, a.id)),
      ).toHaveLength(0);
    });

    it('lets plugins add entries, retry-safe, to records of their organisation', async () => {
      const customer = await owner.customers.create({
        firstName: 'Guest',
        primaryEmail: 'guest@mail.mn',
      });

      const entry = {
        targetType: 'customer',
        targetId: customer.id,
        type: 'hr.candidate.applied',
        summary: 'Applied for Accountant',
        entity: { type: 'application', id: 'app1' },
        link: '/hr/applications/app1',
        actorUserId: memberId,
        dedupeKey: 'application-app1',
      } satisfies ActivityInput;

      const first = await hr.activities.create(entry);

      expect(server.status()).toBe(201);

      const retry = await hr.activities.create(entry);

      expect(first.created).toBe(true);
      expect(retry).toMatchObject({
        created: false,
        activity: { id: first.activity.id },
      });
      expect(first.activity).toMatchObject({
        source: 'hr',
        actor: { type: 'user', id: memberId },
      });

      await expect(
        hr.activities.create({ ...entry, dedupeKey: undefined, type: 'ecom.x.y' }),
      ).rejects.toMatchObject({ code: 'INVALID_TYPE' });
      await expect(
        server
          .client({ plugin: HR_SECRET, org: otherOrgId })
          .activities.create({ ...entry, dedupeKey: undefined }),
      ).rejects.toMatchObject({ status: 404 });
      await expect(member.activities.create(entry)).rejects.toMatchObject({ status: 403 });

      const timeline = await owner.activities.list({
        targetType: 'customer',
        targetId: customer.id,
        source: 'hr',
      });

      expect(timeline.data).toHaveLength(1);
      await expect(
        otherOrg.activities.list({ targetType: 'customer', targetId: customer.id }),
      ).rejects.toMatchObject({ status: 404 });
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

      await expect(
        owner.auth.changePassword({ currentPassword: 'nope', newPassword: 'Owner-pass-456' }),
      ).rejects.toMatchObject({ code: 'WRONG_PASSWORD' });
      await expect(
        owner.auth.changePassword({
          currentPassword: 'Owner-pass-123',
          newPassword: 'Owner-pass-123',
        }),
      ).rejects.toMatchObject({ code: 'SAME_PASSWORD' });
      expect(
        await owner.auth.changePassword({
          currentPassword: 'Owner-pass-123',
          newPassword: 'Owner-pass-456',
        }),
      ).toEqual({ ok: true });

      // A failed and a successful sign-in show up in my list, not in others'.
      const anonymous = server.client();

      await expect(
        anonymous.auth.signIn({
          email: 'owner@acme.mn',
          password: 'Owner-pass-123',
          subdomain: 'acme',
        }),
      ).rejects.toMatchObject({ status: 401 });
      await anonymous.auth.signIn({
        email: 'owner@acme.mn',
        password: 'Owner-pass-456',
        subdomain: 'acme',
      });

      const mine = await owner.auth.signIns();

      expect(mine.data.map((entry) => entry.success).slice(0, 2)).toEqual([true, false]);
      expect((await member.auth.signIns()).data).toHaveLength(0);
    });

    it('lets a member edit their own profile, not their role', async () => {
      const saved = await member.users.update({
        id: memberId,
        firstName: 'Bold',
        lastName: 'Bat',
        links: { github: 'https://github.com/bold' },
      });

      expect(saved).toMatchObject({
        firstName: 'Bold',
        lastName: 'Bat',
        links: { github: 'https://github.com/bold' },
      });
      await expect(member.users.update({ id: memberId, role: 'admin' })).rejects.toMatchObject({
        code: 'OWN_ROLE',
      });
    });
  });

  describe('audit log', () => {
    it('records who changed what, for owners and admins only', async () => {
      const customer = await owner.customers.create({
        firstName: 'Audited',
        primaryEmail: 'audited@mail.mn',
      });

      await owner.customers.update({ id: customer.id, position: 'CTO' });
      await owner.users.update({ id: memberId, role: 'admin' });
      await owner.customers.remove({ ids: [customer.id] });

      await member.audit.list({}); // now an admin
      await owner.users.update({ id: memberId, role: 'member' });
      await expect(member.audit.list({})).rejects.toMatchObject({ status: 403 });

      const entries = await owner.audit.list({ targetId: customer.id });

      expect(entries.data.map((entry) => entry.action).slice(-2)).toEqual([
        'customer.updated',
        'customer.created',
      ]);
      expect(entries.data.find((entry) => entry.action === 'customer.updated')).toMatchObject({
        actor: { type: 'user', id: ownerId },
        targetLabel: 'Audited',
        changes: { position: [null, 'CTO'] },
      });

      const roles = await owner.audit.list({ action: 'user.role_changed', targetId: memberId });

      expect(roles.data[0]?.changes).toEqual({ role: ['admin', 'member'] });

      const prefixed = await owner.audit.list({ action: 'file.' });

      expect(prefixed.data.length).toBeGreaterThan(0);
      expect(prefixed.data.every((entry) => entry.action.startsWith('file.'))).toBe(true);

      expect((await otherOrg.audit.list({ targetId: customer.id })).data).toHaveLength(0);
    });

    it('never stores password hashes', async () => {
      expect(
        await owner.users.setPassword({ id: memberId, password: 'A-new-password-123' }),
      ).toMatchObject({ id: memberId });

      const entries = await owner.audit.list({ targetId: memberId });

      expect(JSON.stringify(entries)).not.toMatch(/scrypt|passwordHash/);
      expect(entries.data[0]?.action).toBe('user.password_set');
    });
  });

  describe('event stream', () => {
    it('publishes in the caller’s transaction: rolled back means never published', async () => {
      const { db } = await import('@erxes/core-db');
      const { sql } = await import('drizzle-orm');

      const customer = await owner.customers.create({
        firstName: 'Streamed',
        primaryEmail: 'streamed@mail.mn',
        ownerId: memberId,
      });

      await db()
        .transaction(async (tx) => {
          await tx.execute(
            sql`select core_publish_event(${orgId}, 'hr', 'hr.contract.drafted', '{}'::jsonb, 'customer', ${customer.id}, 'Drafted a contract')`,
          );
          throw new Error('roll back');
        })
        .catch(() => undefined);
      await db().execute(
        sql`select core_publish_event(${orgId}, 'hr', 'hr.contract.signed', '{"contractId":"c1"}'::jsonb, 'customer', ${customer.id}, 'Signed contract C-1', '/hr/contracts/c1', null, 'contract-c1')`,
      );
      await db().execute(
        sql`select core_publish_event(${orgId}, 'hr', 'hr.contract.signed', '{}'::jsonb, 'customer', ${customer.id}, 'Signed contract C-1', null, null, 'contract-c1')`,
      );
      expect(
        await dbError(
          db().execute(sql`select core_publish_event(${orgId}, 'hr', 'ecom.order.paid')`),
        ),
      ).toMatch(/must start with "hr\."/);
      // The same recipient limit as POST /events.
      expect(
        await dbError(
          db().execute(
            sql`select core_publish_event(${orgId}, 'hr', 'hr.x.y', p_notify => jsonb_build_object('title', 'Too many', 'userIds', (select jsonb_agg(n::text) from generate_series(1, 501) n)))`,
          ),
        ),
      ).toMatch(/1 to 500 team members/);

      const { processEvents } = await import('~/modules/events/processor');

      await processEvents();

      const timeline = await owner.activities.list({
        targetType: 'customer',
        targetId: customer.id,
        kind: 'plugins',
      });

      expect(timeline.data.map((entry) => entry.summary)).toEqual(['Signed contract C-1']);
      expect(timeline.data[0]).toMatchObject({
        source: 'hr',
        link: '/hr/contracts/c1',
        data: { contractId: 'c1' },
      });

      // The owner hears about it in HR's inbox; running again changes nothing.
      await processEvents();

      const inbox = await member.notifications.list({ source: 'hr', kind: 'hr.contract.signed' });

      expect(inbox.totalCount).toBe(1);
    });

    it('lets plugins publish over HTTP, checks what they send, and notifies', async () => {
      await expect(
        hr.events.publish({ events: [{ type: 'hr.x.y', summary: 'no subject' }] }),
      ).rejects.toMatchObject({ code: 'SUBJECT_REQUIRED' });

      const sent = await hr.events.publish({
        events: [
          {
            type: 'hr.review.scheduled',
            payload: { reviewId: 'r1' },
            notify: { userIds: [memberId], title: 'Review on Friday', priority: 'high' },
            dedupeKey: 'review-r1',
          },
        ],
      });

      expect(server.status()).toBe(201);

      const again = await hr.events.publish({
        events: [{ type: 'hr.review.scheduled', dedupeKey: 'review-r1' }],
      });

      expect(sent).toEqual({ published: 1, duplicates: 0 });
      expect(again).toEqual({ published: 0, duplicates: 1 });

      const { processEvents } = await import('~/modules/events/processor');

      await processEvents();

      const inbox = await member.notifications.list({ kind: 'hr.review.scheduled' });

      expect(inbox.data[0]).toMatchObject({
        title: 'Review on Friday',
        priority: 'high',
        source: 'hr',
      });

      // Core's own changes are in the stream too (for automations).
      const stream = await owner.events.list({ type: 'core.customer.' });

      expect(stream.data.length).toBeGreaterThan(0);
      await expect(member.events.list({})).rejects.toMatchObject({ status: 403 });
    });
  });

  describe('audit hardening', () => {
    it('takes plugin entries into the same log, filterable by source', async () => {
      const { db } = await import('@erxes/core-db');
      const { sql } = await import('drizzle-orm');

      const recorded = await hr.audit.record({
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
      });

      expect(recorded).toEqual({ recorded: 1 });
      await expect(
        hr.audit.record({ entries: [{ action: 'core.user.deleted' }] }),
      ).rejects.toMatchObject({ code: 'INVALID_TYPE' });

      await db().execute(
        sql`select core_record_audit(${orgId}, 'hr', 'hr.salary.changed', ${ownerId}, 'employee', 'e2', 'Saraa', '{"salary":[1,2]}'::jsonb)`,
      );

      const fromHr = await owner.audit.list({ source: 'hr' });

      expect(fromHr.data.map((entry) => entry.action)).toEqual([
        'hr.salary.changed',
        'hr.employee.deleted',
      ]);
      expect(fromHr.data[1]).toMatchObject({
        actor: { type: 'user', id: memberId },
        ip: '203.0.113.7',
        source: 'hr',
      });
      expect((await owner.audit.list({ ip: '203.0.113.7' })).totalCount).toBe(1);
      expect((await owner.audit.list({ q: 'Bat deleted' })).data[0]?.targetLabel).toBe('Bat Dorj');
      expect((await owner.audit.list({})).totalCapped).toBe(false);
    });

    it('is append-only and shows when an entry was changed', async () => {
      const { db } = await import('@erxes/core-db');
      const { sql } = await import('drizzle-orm');

      expect(await owner.audit.verify()).toMatchObject({ ok: true, brokenAt: null });
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

      expect(await owner.audit.verify()).toMatchObject({ ok: false, brokenAt: 3 });
      expect((await otherOrg.audit.verify()).ok).toBe(true);
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

      await expect(member.audit.updateSettings({ retentionDays: 30 })).rejects.toMatchObject({
        status: 403,
      });
      expect(await otherOrg.audit.updateSettings({ retentionDays: 30 })).toEqual({
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
      await hr.audit.record({
        entries: [{ action: 'hr.note.added', targetLabel: '=HYPERLINK("http://evil")' }],
      });

      const csv = await fetch(server.url('/core/v1/audit/export?format=csv&source=hr'), {
        headers: server.headers(await ownerToken()),
      });

      const text = await csv.text();

      expect(csv.headers.get('content-disposition')).toMatch(
        /attachment; filename="audit-log-.*\.csv"/,
      );
      expect(text.split('\n')[0]).toBe(
        'createdAt,source,actorType,actorId,action,targetType,targetId,targetLabel,changes,metadata,ip,userAgent,chainSeq,hash',
      );
      expect(text).toContain(`"'=HYPERLINK(""http://evil"")"`);

      const json = await fetch(
        server.url('/core/v1/audit/export?format=json&action=hr.note.added'),
        {
          headers: server.headers(await ownerToken()),
        },
      );

      const rows = z.array(z.record(z.unknown())).parse(await json.json());

      expect(rows).toHaveLength(1);
      expect(rows[0]).not.toHaveProperty('orgId');
      expect(
        (
          await fetch(server.url('/core/v1/audit/export'), {
            headers: server.headers(await memberToken()),
          })
        ).status,
      ).toBe(403);
      expect((await owner.audit.list({ action: 'audit.exported' })).totalCount).toBe(2);
    });

    it('records sign-outs and sign-ins with unknown emails', async () => {
      await expect(
        server.client().auth.signIn({ email: 'nobody@acme.mn', password: 'x', subdomain: 'acme' }),
      ).rejects.toMatchObject({ status: 401 });

      const unknown = await owner.audit.list({ action: 'auth.sign_in_failed', q: 'nobody' });

      expect(unknown.data[0]).toMatchObject({
        actor: { type: 'system' },
        targetLabel: 'nobody@acme.mn',
      });

      await fetch(server.url('/core/v1/auth/sign-out'), {
        method: 'POST',
        headers: {
          cookie: `erxes_session=${await memberToken()}`,
          'sec-fetch-site': 'same-origin',
        },
      });

      expect(
        (await owner.audit.list({ action: 'auth.signed_out', actorId: memberId })).totalCount,
      ).toBe(1);
    });
  });

  describe('notes', () => {
    it('adds notes with mentions and files; only the author edits, anyone pins', async () => {
      const { id } = await owner.customers.create({
        firstName: 'Noted',
        primaryEmail: 'noted@mail.mn',
      });

      await expect(
        owner.activities.addNote({
          targetType: 'customer',
          targetId: id,
          body: 'x',
          fileIds: ['missing'],
        }),
      ).rejects.toMatchObject({ code: 'INVALID_FILE' });

      const note = await owner.activities.addNote({
        targetType: 'customer',
        targetId: id,
        body: 'Call back on Monday @member',
        mentions: [memberId],
      });

      expect(server.status()).toBe(201);
      expect(note).toMatchObject({
        type: 'customer.note',
        pinned: false,
        data: { body: 'Call back on Monday @member' },
      });

      const mention = await member.notifications.list({ kind: 'core.note.mentioned' });

      expect(mention.data[0]).toMatchObject({
        body: 'Call back on Monday @member',
        link: `/contacts/customers/${id}`,
      });

      await expect(
        member.activities.updateNote({ id: note.id, body: 'mine now' }),
      ).rejects.toMatchObject({ code: 'NOT_AUTHOR' });

      const pinned = await member.activities.updateNote({ id: note.id, pinned: true });

      const edited = await owner.activities.updateNote({
        id: note.id,
        body: 'Call back on Tuesday',
      });

      expect(pinned.pinned).toBe(true);
      expect(edited).toMatchObject({ pinned: true, data: { body: 'Call back on Tuesday' } });
      expect(edited.editedAt).not.toBeNull();

      const notes = await owner.activities.list({
        targetType: 'customer',
        targetId: id,
        kind: 'notes',
      });

      const changes = await owner.activities.list({
        targetType: 'customer',
        targetId: id,
        kind: 'changes',
      });

      const pins = await owner.activities.list({
        targetType: 'customer',
        targetId: id,
        pinned: 'true',
      });

      expect(notes.data).toHaveLength(1);
      expect(changes.data.map((entry) => entry.type)).toEqual(['customer.created']);
      expect(pins.data).toHaveLength(1);

      await expect(member.activities.removeNote({ id: note.id })).rejects.toMatchObject({
        status: 403,
      });
      expect(await owner.activities.removeNote({ id: note.id })).toEqual({ ok: true });
      expect(server.status()).toBe(200);
    });

    it('shows a company’s customers’ entries on its timeline when asked', async () => {
      const company = await owner.companies.create({ primaryName: 'Rollup LLC' });

      const customer = await owner.customers.create({
        firstName: 'Rolled',
        primaryEmail: 'rolled@mail.mn',
      });

      await owner.customers.linkCompany({ id: customer.id, companyId: company.id });
      await owner.activities.addNote({
        targetType: 'customer',
        targetId: customer.id,
        body: 'Prefers email',
      });

      const own = await owner.activities.list({
        targetType: 'company',
        targetId: company.id,
        kind: 'notes',
      });

      const rolled = await owner.activities.list({
        targetType: 'company',
        targetId: company.id,
        kind: 'notes',
        includeRelated: 'true',
      });

      expect(own.data).toHaveLength(0);
      expect(rolled.data[0]).toMatchObject({
        targetType: 'customer',
        targetId: customer.id,
      });
    });
  });
});
