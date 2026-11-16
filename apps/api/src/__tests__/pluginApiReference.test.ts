import { PLUGIN_SESSION_SCHEME } from '@erxes/core-contract';
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

describe('plugin API reference', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const service = async () => t.client(await t.pluginToken());

  beforeAll(async () => {
    await (
      await service()
    ).plugins.registerManifest({
      title: 'HR',
      version: '2.0.0',
      api: { url: 'https://hr.example.com/api', openapi: '/openapi.json' },
    });
    await t.owner().plugins.install({ name: 'hr' });
  });

  it('lists where an installed plugin serves its OpenAPI document', async () => {
    const hr = (await t.member().plugins.list({})).data.find((plugin) => plugin.name === 'hr');

    expect(hr?.manifest?.api).toEqual({
      url: 'https://hr.example.com/api',
      openapi: '/openapi.json',
    });

    await expect(
      (await service()).plugins.registerManifest({
        title: 'HR',
        version: '2.0.1',
        api: { url: 'https://hr.example.com/api', openapi: 'https://elsewhere.example.com/x' },
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('documents the routes under their prefix, with the session token a script gets from core', async () => {
    const doc = await pluginOpenApi(contract, {
      plugin: 'hr',
      title: 'HR',
      version: '2.0.0',
      prefix: '/v1',
    });

    expect(Object.keys(doc.paths ?? {})).toEqual(['/v1/greetings/create']);
    expect(doc.security).toEqual([{ [PLUGIN_SESSION_SCHEME]: [] }]);
    expect(JSON.stringify(doc.components?.securitySchemes)).toContain(
      'POST /core/v1/plugins/hr/session',
    );
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
