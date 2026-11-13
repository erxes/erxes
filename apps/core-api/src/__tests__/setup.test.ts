import { describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { config } from '~/config';
import { subdomainFromName } from '~/modules/setup/setup.service';
import { useTestDatabase } from './db';
import { useTestServer } from './support';

const OpenApiDocument = z.object({ openapi: z.string(), paths: z.record(z.string(), z.unknown()) });

const owner = {
  organizationName: 'Acme LLC',
  firstName: 'Bat',
  lastName: 'Dorj',
  email: 'Owner@Acme.mn',
  password: 'Secret-pass1',
};

describe('first-run setup (/core/v1/setup)', () => {
  useTestDatabase();

  const server = useTestServer();
  const required = async () => (await server.client().auth.setupStatus({})).required;

  it('makes subdomains from organisation names', () => {
    expect(subdomainFromName('Acme LLC')).toBe('acme-llc');
    expect(subdomainFromName('  --Nomad  Tech!! ')).toBe('nomad-tech');
    expect(subdomainFromName('Монгол')).toBe('default');
  });

  it('is required on an empty database and asks for a strong password', async () => {
    expect(await required()).toBe(true);
    await expect(
      server.client().auth.setup({ ...owner, password: 'password' }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
  });

  it('creates the organisation and owner, signs in, and only once', async () => {
    const browser = server.browser();

    // The country brings its currency.
    expect(await browser.api.auth.setup({ ...owner, country: 'mn' })).toMatchObject({
      user: { email: 'owner@acme.mn', fullName: 'Bat Dorj', role: 'owner' },
      organization: { name: 'Acme LLC', subdomain: 'acme-llc', country: 'MN', currency: 'MNT' },
    });
    expect(browser.cookie()).toMatch(/^erxes_session=./);
    expect(await required()).toBe(false);
    await expect(
      server.client().auth.setup({ ...owner, email: 'other@acme.mn' }),
    ).rejects.toMatchObject({ status: 409, code: 'SETUP_DONE' });
    expect(
      await server.browser().api.auth.signIn({ email: 'owner@acme.mn', password: owner.password }),
    ).toMatchObject({ user: { email: 'owner@acme.mn' } });
  });

  it('publishes the OpenAPI document without signing in', async () => {
    const response = await fetch(server.url('/core/v1/openapi.json'));
    const document = OpenApiDocument.parse(await response.json());

    expect(response.status).toBe(200);
    expect(document.openapi).toMatch(/^3\./);
    expect(Object.keys(document.paths)).toEqual(
      expect.arrayContaining(['/customers', '/customers/{id}', '/companies', '/setup']),
    );
  });

  it('is off where the SaaS side creates organisations', async () => {
    config.setup.enabled = false;

    try {
      expect(await required()).toBe(false);
      await expect(server.client().auth.setup(owner)).rejects.toMatchObject({
        code: 'SETUP_DISABLED',
      });
    } finally {
      config.setup.enabled = true;
    }
  });
});
