import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { createApp } from '~/app';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, currentToken, describeWithDb, useTestDatabase } from './db';
import { pluginToken } from './plugin';

describeWithDb('timelines: plugin records, search, logged calls, reactions, plugin edits', { timeout: 300_000 }, () => {
  useTestDatabase();

  let server: Server;
  let base = '';
  let orgId = '';
  let ownerId = '';
  let owner = '';
  let member = '';
  let hr = '';

  const call = async (token: string, method: string, path: string, body?: unknown) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();

    return { status: response.status, body: text ? JSON.parse(text) : null };
  };

  beforeAll(async () => {
    const { users, newId } = await import('@erxes/core-db');
    const acme = await createOrganization({ subdomain: 'acme', name: 'Acme', owner: { email: 'o@acme.mn' } });
    const memberId = newId();

    orgId = acme.organization.id;
    ownerId = acme.owner.id;
    await adminDb().insert(users).values({ id: memberId, orgId, email: 'm@acme.mn', role: 'member', status: 'active' });
    owner = await currentToken(ownerId, orgId);
    member = await currentToken(memberId, orgId);
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    await call(await pluginToken(base), 'PUT', '/plugins/manifest', {
      title: 'HR',
      version: '1',
      scopes: ['activities:write'],
      permissions: [{ action: 'hr.employee.view', label: 'See employees' }],
      timelines: [{ type: 'hr.employee', label: 'Employee', permission: 'hr.employee.view' }],
      activityTypes: [{ type: 'hr.leave.approved', label: 'Leave approved', icon: 'IconBeach', color: '#16a34a' }],
    });
    hr = await pluginToken(base, orgId);
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("keeps timelines for a plugin's own records, with its permission and namespace", async () => {
    const path = '/activities?targetType=hr.employee&targetId=emp-1';

    expect((await call(member, 'GET', path)).body.code).toBe('NOT_ALLOWED');
    expect((await call(owner, 'GET', path)).status).toBe(200);
    expect((await call(owner, 'GET', '/activities?targetType=ecom.order&targetId=o1')).body.code).toBe('NO_TIMELINE');

    const note = await call(owner, 'POST', '/activities/notes', { targetType: 'hr.employee', targetId: 'emp-1', body: 'Great onboarding' });

    expect(note.status).toBe(201);

    const entry = await call(hr, 'POST', '/activities', {
      targetType: 'hr.employee',
      targetId: 'emp-1',
      type: 'hr.leave.approved',
      summary: 'Leave approved: 3 days',
      dedupeKey: 'leave-1',
    });

    expect(entry.status).toBe(201);
    // Not another plugin's record type.
    expect((await call(hr, 'POST', '/activities', { targetType: 'ecom.order', targetId: 'o1', type: 'hr.x.y', summary: 'x' })).status).toBe(403);

    // The plugin changes its own entry (by dedupe key), then removes it.
    expect((await call(hr, 'PATCH', '/activities/key:leave-1', { summary: 'Leave approved: 2 days' })).body.summary).toBe('Leave approved: 2 days');
    expect((await call(owner, 'GET', path)).body.data.map((item: { summary: string | null }) => item.summary)).toContain('Leave approved: 2 days');
    expect((await call(hr, 'DELETE', `/activities/${note.body.id}`)).status).toBe(404);
    expect((await call(hr, 'DELETE', '/activities/key:leave-1')).status).toBe(200);

    const types = await call(member, 'GET', '/activities/types');

    expect(types.body.types).toContainEqual({ type: 'hr.leave.approved', label: 'Leave approved', source: 'hr', icon: 'IconBeach', color: '#16a34a' });
    expect(types.body.timelines).toContainEqual({ type: 'hr.employee', label: 'Employee', source: 'hr', permission: 'hr.employee.view' });
  });

  it('searches and filters, keeps note history, and counts reactions', async () => {
    const customer = await call(owner, 'POST', '/customers', { firstName: 'Timeline' });
    const target = { targetType: 'customer', targetId: customer.body.id };
    const note = await call(owner, 'POST', '/activities/notes', { ...target, body: 'Wants the blue plan' });

    await call(member, 'POST', '/activities/notes', { ...target, body: 'Sent the brochure' });

    const list = (query: string) => call(owner, 'GET', `/activities?targetType=customer&targetId=${customer.body.id}&${query}`);

    expect((await list('q=blue')).body.data.map((item: { id: string }) => item.id)).toEqual([note.body.id]);
    expect((await list(`actorId=${ownerId}&kind=notes`)).body.data).toHaveLength(1);
    expect((await list(`from=${encodeURIComponent(new Date(Date.now() + 60_000).toISOString())}`)).body.data).toEqual([]);

    // Edits keep the earlier wording.
    await call(owner, 'PATCH', `/activities/notes/${note.body.id}`, { body: 'Wants the green plan' });

    const edited = (await list('kind=notes')).body.data.find((item: { id: string }) => item.id === note.body.id);

    expect(edited.data).toMatchObject({ body: 'Wants the green plan', history: [{ body: 'Wants the blue plan' }] });

    // Reactions: added, counted per member, taken back.
    await Promise.all([call(owner, 'POST', `/activities/${note.body.id}/reactions`, { emoji: '👍' }), call(member, 'POST', `/activities/${note.body.id}/reactions`, { emoji: '👍' })]);

    let reacted = (await list('kind=notes')).body.data.find((item: { id: string }) => item.id === note.body.id);

    expect(reacted.reactions['👍']).toHaveLength(2);
    await call(owner, 'POST', `/activities/${note.body.id}/reactions`, { emoji: '👍' });
    reacted = (await list('kind=notes')).body.data.find((item: { id: string }) => item.id === note.body.id);
    expect(reacted.reactions['👍']).toHaveLength(1);
  });
});
