import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it } from 'vite-plus/test';
import { createApp } from '~/app';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, currentToken, describeWithDb, useTestDatabase } from './db';
import { pluginToken } from './plugin';

describeWithDb('recycle bin and mass-deletion guard', { timeout: 300_000 }, () => {
  useTestDatabase();

  let server: Server;
  let base = '';
  let orgId = '';
  let owner = '';
  let admin = '';

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

    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'o@acme.mn' },
    });

    const adminId = newId();

    orgId = acme.organization.id;
    await adminDb()
      .insert(users)
      .values({ id: adminId, orgId, email: 'a@acme.mn', role: 'admin', status: 'active' });
    owner = await currentToken(acme.owner.id, orgId);
    admin = await currentToken(adminId, orgId);
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('keeps deleted customers with their tags, links and timeline, and restores them whole', async () => {
    const tag = await call(owner, 'POST', '/tags', {
      type: 'customer',
      name: 'vip',
      colorCode: '#ff0000',
    });

    const company = await call(owner, 'POST', '/companies', { primaryName: 'Acme LLC' });

    const customer = await call(owner, 'POST', '/customers', {
      firstName: 'Saraa',
      primaryEmail: 'saraa@mail.mn',
      tagIds: [tag.body.id],
    });

    await call(owner, 'PUT', `/customers/${customer.body.id}/companies/${company.body.id}`);
    await call(owner, 'POST', '/activities/notes', {
      targetType: 'customer',
      targetId: customer.body.id,
      body: 'Remember me',
    });

    expect(
      (await call(admin, 'POST', '/customers/remove', { ids: [customer.body.id] })).body,
    ).toEqual({ removed: 1 });
    expect((await call(owner, 'GET', `/customers/${customer.body.id}`)).status).toBe(404);

    const bin = await call(admin, 'GET', '/trash');

    expect(bin.body.data[0]).toMatchObject({
      recordType: 'customer',
      recordId: customer.body.id,
      label: 'Saraa',
      counts: { tags: 1, links: 1 },
    });
    expect(bin.body.data[0].counts.activities).toBeGreaterThanOrEqual(2);

    expect(
      (await call(admin, 'POST', '/trash/restore', { ids: [bin.body.data[0].id] })).body,
    ).toEqual({ restored: 1, failed: [] });

    const back = await call(owner, 'GET', `/customers/${customer.body.id}`);

    expect(back.body).toMatchObject({ firstName: 'Saraa', primaryEmail: 'saraa@mail.mn' });
    expect(back.body.tagIds ?? back.body.tags?.map((item: { id: string }) => item.id)).toContain(
      tag.body.id,
    );
    expect(
      (await call(owner, 'GET', `/customers/${customer.body.id}/companies`)).body.data.map(
        (item: { id: string }) => item.id,
      ),
    ).toContain(company.body.id);

    const timeline = await call(
      owner,
      'GET',
      `/activities?targetType=customer&targetId=${customer.body.id}&kind=notes`,
    );

    expect(timeline.body.data.map((item: { data: { body?: string } }) => item.data.body)).toContain(
      'Remember me',
    );
    expect((await call(admin, 'GET', '/trash')).body.data).toEqual([]);

    // Purging for good is the owner's.
    await call(admin, 'POST', '/customers/remove', { ids: [customer.body.id] });

    const again = (await call(admin, 'GET', '/trash')).body.data[0];

    expect((await call(admin, 'POST', '/trash/purge', { ids: [again.id] })).status).toBe(403);
    expect((await call(owner, 'POST', '/trash/purge', { ids: [again.id] })).body).toEqual({
      purged: 1,
    });
  });

  it('stops a member deleting far too much at once, tells the owners, and keeps everything restorable', async () => {
    const { customers, newId } = await import('@erxes/core-db');
    const ids = Array.from({ length: 45 }, () => newId());

    await adminDb()
      .insert(customers)
      .values(ids.map((id, index) => ({ id, orgId, firstName: `Bulk ${index}` })));

    expect(
      (await call(admin, 'POST', '/customers/remove', { ids: ids.slice(0, 25) })).body,
    ).toEqual({ removed: 25 });

    const stopped = await call(admin, 'POST', '/customers/remove', { ids: ids.slice(25) });

    expect(stopped.status).toBe(429);
    expect(stopped.body.code).toBe('MASS_DELETE_STOPPED');
    // Refused: nothing of the second batch was deleted.
    expect((await call(owner, 'GET', `/customers/${ids[30]}`)).status).toBe(200);

    const alerts = await call(owner, 'GET', '/notifications?kind=core.security.mass_deletion');

    expect(alerts.body.data.length).toBeGreaterThanOrEqual(1);
    // Owners are not limited.
    expect((await call(owner, 'POST', '/customers/remove', { ids: ids.slice(25) })).body).toEqual({
      removed: 20,
    });
    expect((await call(owner, 'GET', '/trash?limit=500')).body.data.length).toBe(45);
  });

  it('suspends a plugin that deletes far too much', async () => {
    const { activities, newId } = await import('@erxes/core-db');
    const hr = await pluginToken(base, orgId);
    const customer = await call(owner, 'POST', '/customers', { firstName: 'Target' });
    const entries = Array.from({ length: 45 }, () => newId());

    await adminDb()
      .insert(activities)
      .values(
        entries.map((id) => ({
          id,
          orgId,
          targetType: 'customer',
          targetId: customer.body.id,
          source: 'hr',
          type: 'hr.x.y',
          summary: 'x',
          actorType: 'plugin' as const,
          actorId: 'hr',
        })),
      );

    let last = { status: 200, body: null as { code?: string } | null };

    for (const id of entries) {
      last = await call(hr, 'DELETE', `/activities/${id}`);

      if (last.status !== 200) break;
    }

    expect(last.body?.code).toBe('MASS_DELETE_STOPPED');

    const plugins = await call(owner, 'GET', '/plugins');
    const state = plugins.body.data.find((plugin: { name: string }) => plugin.name === 'hr');

    expect(state).toMatchObject({ installed: false });
    expect(state.statusReason).toMatch(/Suspended/);
    // Its tokens stop working; installing again resumes it.
    expect((await call(hr, 'DELETE', `/activities/${entries[44]}`)).status).toBe(401);
    expect((await call(owner, 'POST', '/plugins/hr/install')).body).toMatchObject({
      installed: true,
      statusReason: null,
    });
  });
});
