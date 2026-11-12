import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it } from 'vite-plus/test';
import { createApp } from '~/app';
import { config } from '~/config';
import { subdomainFromName } from '~/modules/setup/setup.service';
import { describeWithDb, useTestDatabase } from './db';

describeWithDb('first-run setup (/core/v1/setup)', () => {
  useTestDatabase();

  let server: Server;
  let base = '';

  beforeAll(() => {
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  interface Body {
    required: boolean;
    user: { email: string; fullName: string | null; role: string };
    organization: { name: string; subdomain: string };
    code: string;
  }

  const call = async (method: string, path: string, body?: unknown) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    return {
      status: response.status,
      cookie: response.headers.get('set-cookie'),
      body: (await response.json()) as Body,
    };
  };

  const owner = {
    organizationName: 'Acme LLC',
    firstName: 'Bat',
    lastName: 'Dorj',
    email: 'Owner@Acme.mn',
    password: 'Secret-pass1',
  };

  it('makes subdomains from organisation names', () => {
    expect(subdomainFromName('Acme LLC')).toBe('acme-llc');
    expect(subdomainFromName('  --Nomad  Tech!! ')).toBe('nomad-tech');
    expect(subdomainFromName('Монгол')).toBe('default');
  });

  it('is required on an empty database and asks for a strong password', async () => {
    expect((await call('GET', '/setup')).body.required).toBe(true);

    const weak = await call('POST', '/setup', { ...owner, password: 'password' });
    expect(weak.status).toBe(400);
    expect(weak.body.code).toBe('INVALID_INPUT');
  });

  it('creates the organisation and owner, signs in, and only once', async () => {
    const done = await call('POST', '/setup', owner);

    expect(done.status).toBe(201);
    expect(done.cookie).toContain('erxes_session=');
    expect(done.body).toMatchObject({
      user: { email: 'owner@acme.mn', fullName: 'Bat Dorj', role: 'owner' },
      organization: { name: 'Acme LLC', subdomain: 'acme-llc' },
    });
    expect((await call('GET', '/setup')).body.required).toBe(false);

    const again = await call('POST', '/setup', { ...owner, email: 'other@acme.mn' });
    expect(again.status).toBe(409);
    expect(again.body.code).toBe('SETUP_DONE');

    const signIn = await call('POST', '/auth/sign-in', {
      email: 'owner@acme.mn',
      password: owner.password,
    });

    expect(signIn.status).toBe(200);
  });

  it('publishes the OpenAPI document without signing in', async () => {
    const response = await fetch(`${base}/core/v1/openapi.json`);
    const document = (await response.json()) as { openapi: string; paths: Record<string, unknown> };

    expect(response.status).toBe(200);
    expect(document.openapi).toMatch(/^3\./);
    expect(Object.keys(document.paths)).toEqual(
      expect.arrayContaining(['/customers', '/customers/{id}', '/companies', '/setup']),
    );
  });

  it('is off where the SaaS side creates organisations', async () => {
    config.setup.enabled = false;

    try {
      expect((await call('GET', '/setup')).body.required).toBe(false);
      expect((await call('POST', '/setup', owner)).body.code).toBe('SETUP_DISABLED');
    } finally {
      config.setup.enabled = true;
    }
  });
});
