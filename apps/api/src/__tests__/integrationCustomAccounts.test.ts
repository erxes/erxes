import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const OWN_KEY = 'sk_own_shop_0123456789';

const SECOND_KEY = 'sk_second_shop_0123456789';

describe('custom integration accounts', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const keysSeen: string[] = [];
  let service: Server;
  let programId = '';

  beforeAll(async () => {
    service = createServer((req, res) => {
      req.resume();
      req.on('end', () => {
        keysSeen.push(req.headers.authorization ?? '');
        res.end('ok');
      });
    }).listen(0, '127.0.0.1');
    await once(service, 'listening');

    const address = service.address();

    if (!address || typeof address === 'string') throw new Error('not listening on a port');

    const host = `127.0.0.1:${address.port}`;

    const integration = await t
      .owner()
      .integrations.create({ key: 'shop', name: 'Shop', hosts: [host] });

    await t.owner().integrations.setSecrets({ id: integration.id, secrets: { apiKey: OWN_KEY } });

    programId = (
      await t.owner().integrations.saveProgram({
        integrationId: integration.id,
        kind: 'action',
        key: 'ping',
        label: 'Ping the shop',
        code: `const res = await request({
          url: 'http://${host}/ping',
          headers: { authorization: '{{secret.apiKey}}' },
        });
        return { status: res.status };`,
      })
    ).id;
  });

  afterAll(() => new Promise<void>((resolve) => service.close(() => resolve())));

  const accountInput = async () =>
    (await t.owner().automations.catalog({})).actions
      .find((action) => action.type === 'integrations.shop.ping')
      ?.fields.find((field) => field.type === 'integration_account');

  it('runs a program with the picked account’s key, and with the integration’s own without one', async () => {
    expect(await accountInput()).toBeUndefined();

    const account = await t.owner().integrationAccounts.create({
      integration: 'custom.shop',
      name: 'Second shop',
      secrets: { apiKey: SECOND_KEY },
    });

    expect(account.sealedNames).toEqual(['apiKey']);
    expect(JSON.stringify(account)).not.toContain(SECOND_KEY);
    expect(await accountInput()).toMatchObject({ integration: 'custom.shop', required: false });

    await t.owner().integrations.testProgram({ id: programId });

    const picked = await t
      .owner()
      .integrations.testProgram({ id: programId, input: { _account: account.id } });

    expect(keysSeen).toEqual([OWN_KEY, SECOND_KEY]);
    expect(JSON.stringify(picked)).not.toContain(SECOND_KEY);

    await t.owner().integrationAccounts.remove({ id: account.id });

    await expect(
      t.owner().integrations.testProgram({ id: programId, input: { _account: account.id } }),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });
    expect(keysSeen).toHaveLength(2);
  });

  it('keeps another organisation’s accounts out of reach', async () => {
    await expect(
      t.other().integrationAccounts.list({ integration: 'custom.shop' }),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });
  });
});
