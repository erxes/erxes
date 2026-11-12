import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { createApp } from '~/app';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { currentToken, describeWithDb, useTestDatabase } from './db';
import { pluginToken } from './plugin';

describeWithDb('customers for plugins (find or create)', () => {
  useTestDatabase();

  let server: Server;
  let base = '';
  let orgId = '';
  let owner = '';

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
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'o@acme.mn' },
    });

    orgId = acme.organization.id;
    owner = await currentToken(acme.owner.id, orgId);
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('finds by email or phone (any of theirs), or creates — once, even when asked twice at once', async () => {
    const hr = await pluginToken(base, orgId);
    const [first, second] = await Promise.all([
      call(hr, 'POST', '/customers/find-or-create', {
        primaryEmail: 'Applicant@Mail.mn',
        firstName: 'Saraa',
      }),
      call(hr, 'POST', '/customers/find-or-create', { primaryEmail: 'applicant@mail.mn' }),
    ]);

    expect([first.body.created, second.body.created].sort()).toEqual([false, true]);
    expect(first.body.customer.id).toBe(second.body.customer.id);

    // Another of their numbers and emails find them too.
    await call(owner, 'PATCH', `/customers/${first.body.customer.id}`, {
      phones: ['99112233'],
      primaryPhone: '99112233',
    });
    expect(
      (await call(hr, 'POST', '/customers/find-or-create', { primaryPhone: '9911 2233' })).body,
    ).toMatchObject({
      created: false,
      customer: { id: first.body.customer.id },
    });

    // The plugin can read what it found; the timeline says the plugin created it.
    expect((await call(hr, 'GET', `/customers/${first.body.customer.id}`)).body.primaryEmail).toBe(
      'applicant@mail.mn',
    );

    const audit = await call(
      owner,
      'GET',
      `/audit?targetId=${first.body.customer.id}&action=customer.created`,
    );

    expect(audit.body.data[0]).toMatchObject({ actor: { type: 'plugin', id: 'hr' }, source: 'hr' });
    expect((await call(hr, 'POST', '/customers/find-or-create', {})).status).toBe(400);
  });

  it('needs the customers scopes', async () => {
    await call(await pluginToken(base), 'PUT', '/plugins/manifest', {
      title: 'HR',
      version: '1',
      scopes: ['notifications:write'],
    });

    const narrow = await pluginToken(base, orgId);

    expect(
      (await call(narrow, 'POST', '/customers/find-or-create', { primaryEmail: 'x@mail.mn' })).body
        .code,
    ).toBe('SCOPE_REQUIRED');
    expect((await call(narrow, 'GET', '/customers')).body.code).toBe('MEMBERS_ONLY');
  });
});
