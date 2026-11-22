import type { PluginManifest } from '@erxes/core-contract';
import { integrationConnections, secrets } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { deriveKey, encrypt } from '~/lib/crypto';
import { resealSchedule } from '~/modules/secrets/vault';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const stored = (id: string) => adminDb().select().from(secrets).where(eq(secrets.id, id));

const storedOf = (orgId: string, owner: string) =>
  adminDb()
    .select()
    .from(secrets)
    .where(and(eq(secrets.orgId, orgId), eq(secrets.owner, owner)));

const reseal = async () => {
  await resealSchedule.queues[0]?.run();
};

const HR: PluginManifest = {
  title: 'HR',
  version: '1',
  scopes: ['secrets:write'],
  permissions: [{ action: 'hr.integration.manage', label: 'Manage integrations' }],
  integrations: [
    {
      key: 'facebook',
      name: 'Facebook',
      summary: 'Messenger',
      category: 'social',
      permission: 'hr.integration.manage',
    },
  ],
};

const secretIdOf = async (connectionId: string) => {
  const [row] = await adminDb()
    .select({ secretId: integrationConnections.secretId })
    .from(integrationConnections)
    .where(eq(integrationConnections.id, connectionId));

  if (!row) throw new Error('the connection was not stored');

  return row.secretId;
};

describe('secret vault', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const notFound = { status: 404, code: 'NOT_FOUND' };

  const save = (value: string, org = t.ids.org) =>
    t.hr(org).secrets.save({ key: 'facebook', name: 'Page', value });

  beforeAll(async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest(HR);
  });

  it('does not open a sealed value moved to another secret, organisation or owner', async () => {
    const first = await save('first');
    const second = await save('second');
    const theirs = await save('theirs', t.ids.otherOrg);
    const [source] = await stored(await secretIdOf(first.id));

    if (!source) throw new Error('the secret was not stored');

    const moved = { sealed: source.sealed, keyId: source.keyId };

    await adminDb()
      .update(secrets)
      .set(moved)
      .where(eq(secrets.id, await secretIdOf(second.id)));
    await adminDb()
      .update(secrets)
      .set(moved)
      .where(eq(secrets.id, await secretIdOf(theirs.id)));

    await expect(t.hr().secrets.read({ id: second.id })).rejects.toMatchObject({ status: 500 });
    await expect(t.hr(t.ids.otherOrg).secrets.read({ id: theirs.id })).rejects.toMatchObject({
      status: 500,
    });
    expect(await t.hr().secrets.read({ id: first.id })).toEqual({ value: 'first' });

    await adminDb()
      .update(secrets)
      .set({ owner: 'tms' })
      .where(eq(secrets.id, await secretIdOf(first.id)));
    await expect(t.hr().secrets.read({ id: first.id })).rejects.toMatchObject(notFound);
  });

  it('removes a feature’s secret with the row that kept it, and keeps one secret through a change', async () => {
    const hook = await t
      .owner()
      .webhooks.create({ url: 'https://example.com/hook', eventTypes: ['*'] });

    const [sealed] = await storedOf(t.ids.org, 'core');

    expect(sealed).toMatchObject({ owner: 'core' });
    expect(JSON.stringify(sealed)).not.toContain(hook.secret);

    const rotated = await t.owner().webhooks.rotateSecret({ id: hook.webhook.id });

    expect(rotated.secret).not.toBe(hook.secret);
    expect((await storedOf(t.ids.org, 'core')).map((row) => row.id)).toEqual([sealed?.id]);

    await t.owner().webhooks.remove({ id: hook.webhook.id });
    expect(await storedOf(t.ids.org, 'core')).toEqual([]);
  });

  it('gives a plugin none of core’s connections', async () => {
    const till = await t.owner().integrations.connect({ key: 'test', name: 'Till', keys: {} });

    await expect(t.hr().secrets.read({ id: till.id })).rejects.toMatchObject(notFound);
    await expect(t.hr().secrets.remove({ id: till.id })).rejects.toMatchObject(notFound);
    expect((await t.hr().secrets.list({})).data.map((row) => row.id)).not.toContain(till.id);
  });

  it('opens secrets sealed before the vault and moves them to the current key', async () => {
    const legacyKey = deriveKey(config.auth.jwtSecret, 'erxes-core-secrets-v1');
    const current = await save('new-value');
    const currentSecret = await secretIdOf(current.id);
    const [reference] = await stored(currentSecret);

    if (!reference) throw new Error('the secret was not stored');

    // Nothing to move yet.
    await reseal();
    expect((await stored(currentSecret))[0]?.sealed).toBe(reference.sealed);

    const hr = { orgId: t.ids.org, owner: 'hr' };

    // A full batch of secrets whose key is gone comes first; the old ones are behind it.
    const lost = Array.from({ length: 200 }, (_, index) => ({
      ...hr,
      id: `000-lost-${String(index).padStart(3, '0')}`,
      keyId: 'a-key-not-set',
      sealed: reference.sealed,
    }));

    const old = ['old-value-1', 'old-value-2'].map((value, index) => ({
      ...hr,
      id: `zz-legacy-${index + 1}`,
      keyId: 'legacy',
      sealed: encrypt(legacyKey, value, ''),
    }));

    await adminDb()
      .insert(secrets)
      .values([...lost, ...old]);
    await adminDb()
      .insert(integrationConnections)
      .values(
        ['000-lost-000', 'zz-legacy-1', 'zz-legacy-2'].map((secretId) => ({
          id: `conn-${secretId}`,
          orgId: t.ids.org,
          plugin: 'hr',
          key: 'facebook',
          name: secretId,
          secretId,
        })),
      );

    expect(await t.hr().secrets.read({ id: 'conn-zz-legacy-1' })).toEqual({
      value: 'old-value-1',
    });
    await expect(t.hr().secrets.read({ id: 'conn-000-lost-000' })).rejects.toMatchObject({
      status: 500,
    });

    await reseal();

    const moved = await Promise.all(old.map(async ({ id }) => (await stored(id))[0]));

    expect(moved.map((row) => row?.keyId)).toEqual([reference.keyId, reference.keyId]);
    expect(JSON.stringify(moved)).not.toContain('old-value');
    expect(moved[0]?.sealed).not.toBe(moved[1]?.sealed);
    expect((await stored('000-lost-199'))[0]?.keyId).toBe('a-key-not-set');
    expect((await stored(currentSecret))[0]?.sealed).toBe(reference.sealed);
    expect(await t.hr().secrets.read({ id: 'conn-zz-legacy-1' })).toEqual({
      value: 'old-value-1',
    });
    expect(await t.hr().secrets.read({ id: 'conn-zz-legacy-2' })).toEqual({
      value: 'old-value-2',
    });
    expect(await t.hr().secrets.read({ id: current.id })).toEqual({ value: 'new-value' });

    // Only the ones it can't open are left: the next run moves nothing and still ends well.
    await reseal();
    expect((await stored('zz-legacy-1'))[0]?.sealed).toBe(moved[0]?.sealed);
  });

  it('counts what the vault keeps for each of core’s features, in the member’s organisation only', async () => {
    const counts = async (client: ReturnType<typeof t.owner>) =>
      new Map((await client.secrets.holdings()).data.map((row) => [row.holder, row.count]));

    const before = await counts(t.owner());
    const elsewhere = await counts(t.other());

    const hook = await t
      .owner()
      .webhooks.create({ url: 'https://example.com/held', eventTypes: ['*'] });

    await save('held-token');

    const after = await counts(t.owner());

    expect(after.get('webhook')).toBe((before.get('webhook') ?? 0) + 1);
    expect([...after.keys()]).toEqual([...new Set([...before.keys(), 'webhook'])]);
    expect(await counts(t.other())).toEqual(elsewhere);

    const answer = JSON.stringify(await t.owner().secrets.holdings());

    expect(answer).not.toContain(hook.secret);
    expect(answer).not.toContain('held-token');

    await expect(t.member().secrets.holdings()).rejects.toMatchObject({
      status: 403,
      code: 'NOT_ALLOWED',
    });
  });

  it('is for plugins with secrets:write only, and takes no empty value', async () => {
    await expect(
      t.owner().secrets.save({ key: 'facebook', name: 'x', value: 'x' }),
    ).rejects.toMatchObject({ code: 'PLUGIN_ONLY' });
    await expect(save('')).rejects.toMatchObject({ status: 400 });

    const { id } = await save('kept');

    await t
      .client(await t.pluginToken())
      .plugins.registerManifest({ ...HR, version: '2', scopes: ['customers:read'] });

    await expect(t.hr().secrets.read({ id })).rejects.toMatchObject({ code: 'SCOPE_REQUIRED' });
    await expect(save('x')).rejects.toMatchObject({ code: 'SCOPE_REQUIRED' });
  });
});
