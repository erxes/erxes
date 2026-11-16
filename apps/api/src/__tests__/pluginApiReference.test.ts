import {
  CUSTOMER_TOKEN_SCHEME,
  EMPLOYEE_TOKEN_SCHEME,
  PLUGIN_SESSION_SCHEME,
  type PluginApiAudience,
  WEBSITE_KEY_SCHEME,
} from '@erxes/core-contract';
import { verifyPluginSession } from '@erxes/plugin-sdk';
import { pluginOpenApi } from '@erxes/plugin-sdk/openapi';
import { oc } from '@orpc/contract';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/** A plugin's procedures, as its contract declares them. */
const contract = {
  greetings: {
    create: oc.input(z.object({ name: z.string().min(1) })).output(z.object({ text: z.string() })),
  },
};

const DOCS = [
  { audience: 'member', path: '/openapi/member.json' },
  { audience: 'customer', path: '/openapi/customer.json' },
] as const;

const document = (audience: PluginApiAudience) =>
  pluginOpenApi(contract, { plugin: 'hr', audience, title: 'HR', version: '2.0.0', prefix: '/v1' });

describe('plugin API reference', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const service = async () => t.client(await t.pluginToken());

  const register = async (docs: { audience: PluginApiAudience; path: string }[]) =>
    (await service()).plugins.registerManifest({
      title: 'HR',
      version: '2.0.1',
      api: { url: 'https://hr.example.com/api', docs },
    });

  beforeAll(async () => {
    await (
      await service()
    ).plugins.registerManifest({
      title: 'HR',
      version: '2.0.0',
      api: { url: 'https://hr.example.com/api', docs: [...DOCS] },
    });
    await t.owner().plugins.install({ name: 'hr' });
  });

  it("lists an installed plugin's documents, one per audience", async () => {
    const hr = (await t.member().plugins.list({})).data.find((plugin) => plugin.name === 'hr');

    expect(hr?.manifest?.api).toEqual({ url: 'https://hr.example.com/api', docs: DOCS });

    // A path elsewhere, or two documents for one audience.
    await expect(
      register([{ audience: 'member', path: 'https://elsewhere.example.com/x' }]),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      register([
        { audience: 'member', path: '/a.json' },
        { audience: 'member', path: '/b.json' },
      ]),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      register([
        { audience: 'employee', path: '/openapi/employee.json' },
        { audience: 'website', path: '/openapi/website.json' },
      ]),
    ).resolves.toBeDefined();
  });

  it('documents member routes with the session token a script gets from core', async () => {
    const doc = await document('member');

    expect(Object.keys(doc.paths ?? {})).toEqual(['/v1/greetings/create']);
    expect(doc.security).toEqual([{ [PLUGIN_SESSION_SCHEME]: [] }]);
    expect(JSON.stringify(doc.components?.securitySchemes)).toContain(
      'POST /core/v1/plugins/hr/session',
    );
  });

  it("documents employee routes with the plugin's own token, customer routes with core's, and website routes with a key", async () => {
    const employee = await document('employee');

    expect(employee.security).toEqual([{ [EMPLOYEE_TOKEN_SCHEME]: [] }]);

    const customer = await document('customer');

    expect(customer.security).toEqual([{ [CUSTOMER_TOKEN_SCHEME]: [] }]);
    expect(JSON.stringify(customer.components?.securitySchemes)).toContain(
      'POST /core/v1/customer-auth/sign-in',
    );

    const website = await document('website');

    expect(website.security).toEqual([
      { [WEBSITE_KEY_SCHEME]: [] },
      { [WEBSITE_KEY_SCHEME]: [], [CUSTOMER_TOKEN_SCHEME]: [] },
    ]);
    expect(website.components?.securitySchemes?.[WEBSITE_KEY_SCHEME]).toMatchObject({
      type: 'apiKey',
      in: 'header',
      name: 'x-api-key',
    });
  });

  it('gives a script with an API key a session token the plugin accepts as that member', async () => {
    const { key } = await t.owner().apiKeys.create({ name: 'HR sync', lifetimeDays: 30 });
    const session = await t.client(key).plugins.session({ name: 'hr' });

    expect(session.apiUrl).toBe('https://hr.example.com/api');
    expect(
      await verifyPluginSession(session.token, { coreUrl: t.url(''), plugin: 'hr' }),
    ).toMatchObject({ userId: t.ids.owner, orgId: t.ids.org });
  });
});
